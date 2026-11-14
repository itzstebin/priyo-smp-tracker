/**
 * scraper.js
 * Headless Mineflayer bot that connects to play.priyosmp.com,
 * runs /ah, traverses auction house pages, parses item prices & lore,
 * scrapes buy orders (/order), syncs player stats (/stats <username>),
 * and pushes real-time market data to the Priyo SMP Tracker backend.
 */

const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');
const { parseItemLore, parseBuyOrderLore } = require('./loreParser');

// Load config
const configPath = path.join(__dirname, 'config.json');
let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const smallCapsMap = {
  'ᴀ': 'a', 'ʙ': 'b', 'ᴄ': 'c', 'ᴅ': 'd', 'ᴇ': 'e', 'ꜰ': 'f', 'ɢ': 'g', 'ʜ': 'h',
  'ɪ': 'i', 'ᴊ': 'j', 'ᴋ': 'k', 'ʟ': 'l', 'ᴍ': 'm', 'ɴ': 'n', 'ᴏ': 'o', 'ᴘ': 'p',
  'ꞯ': 'q', 'ʀ': 'r', 'ѕ': 's', 'ꜱ': 's', 'ᴛ': 't', 'ᴜ': 'u', 'ᴠ': 'v', 'ᴡ': 'w',
  'х': 'x', 'ʏ': 'y', 'ᴢ': 'z'
};

function normalizeSmallCaps(str) {
  if (!str) return '';
  let out = '';
  for (const ch of str) {
    out += smallCapsMap[ch] || ch;
  }
  return out.toLowerCase();
}

function stripColorCodes(text) {
  if (!text) return '';
  return text.replace(/[§&][0-9a-fk-or]/gi, '').trim();
}

function extractTitleString(title) {
  if (!title) return '';
  if (typeof title === 'string') {
    try {
      const parsed = JSON.parse(title);
      return extractTitleString(parsed);
    } catch {
      return title;
    }
  }
  if (typeof title === 'object') {
    if (title.value?.text?.value) return String(title.value.text.value);
    if (title.text) return String(title.text);
    if (title.value && typeof title.value === 'string') return title.value;
    if (title.value && typeof title.value === 'object') {
      const raw = JSON.stringify(title.value);
      const m = raw.match(/"text":\{"type":"string","value":"([^"]+)"\}/);
      if (m) return m[1];
    }
  }
  return JSON.stringify(title);
}

function getNormalizedTitle(title) {
  return normalizeSmallCaps(extractTitleString(title));
}

function getRawLoreLines(item) {
  if (!item) return [];
  const lore = [];
  if (item.customLore && Array.isArray(item.customLore)) {
    item.customLore.forEach(l => lore.push(String(l)));
  } else if (item.nbt?.value?.display?.value?.Lore?.value?.value) {
    const rawLore = item.nbt.value.display.value.Lore.value.value;
    if (Array.isArray(rawLore)) {
      rawLore.forEach(l => lore.push(String(l)));
    }
  }
  return lore;
}

function isFilterAllSelected(hopperItem) {
  if (!hopperItem) return false;
  const rawLore = getRawLoreLines(hopperItem);
  if (!rawLore || rawLore.length === 0) return true;

  // In Priyo SMP AH & Orders, the first line of the category filter lore is "⬝ ᴀʟʟ".
  // When ALL is active, the first line is green.
  const firstLine = rawLore[0];
  if (firstLine) {
    try {
      const p = typeof firstLine === 'string' ? JSON.parse(firstLine) : firstLine;
      const color = p.color || (p.extra && p.extra[0] && p.extra[0].color);
      if (color === 'green' || color === '#6bf18d' || color === '#55FF55' || color === 'lime') {
        return true;
      }
    } catch {
      if (firstLine.includes('green') || firstLine.includes('§a') || firstLine.includes('#6b')) {
        return true;
      }
    }
  }

  for (const line of rawLore) {
    if (line.includes('green') || line.includes('§a')) {
      const clean = normalizeSmallCaps(stripColorCodes(line));
      if (clean.includes('all')) return true;
    }
  }

  return false;
}

class AhScraperBot {
  constructor() {
    this.bot = null;
    this.isScanning = false;
    this.scanTimer = null;
    this.triggerPollTimer = null;
    this.antiAfkTimer = null;
    this.reconnectTimer = null;
    this.isReconnecting = false;
    this.hasLoggedIn = false;
    this.reconnectDelay = 12000;
    this.reconnectAttempts = 0;
  }

  getBaseApiUrl() {
    if (process.env.API_BASE_URL) return process.env.API_BASE_URL.replace(/\/+$/, '');
    if (config.api?.endpoint) {
      try {
        const u = new URL(config.api.endpoint);
        return `${u.protocol}//${u.host}`;
      } catch (e) {}
    }
    return 'https://priyo-smp-tracker.vercel.app';
  }

  getIngestEndpoint() {
    if (process.env.API_BASE_URL) {
      return `${process.env.API_BASE_URL.replace(/\/+$/, '')}/api/ingest`;
    }
    return config.api?.endpoint || `${this.getBaseApiUrl()}/api/ingest`;
  }

  getOrdersEndpoint() {
    if (process.env.API_BASE_URL) {
      return `${process.env.API_BASE_URL.replace(/\/+$/, '')}/api/ingest-orders`;
    }
    return config.api?.ordersEndpoint || `${this.getBaseApiUrl()}/api/ingest-orders`;
  }

  getTriggerEndpoint() {
    if (process.env.API_BASE_URL) {
      return `${process.env.API_BASE_URL.replace(/\/+$/, '')}/api/bot/check-trigger`;
    }
    return `${this.getBaseApiUrl()}/api/bot/check-trigger`;
  }

  start() {
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch (e) {}

    const attemptStr = this.reconnectAttempts > 0 ? ` (Attempt #${this.reconnectAttempts + 1})` : '';
    console.log(`🔌 Connecting bot '${config.bot.username}' to ${config.server.host}:${config.server.port} (version: ${config.server.version || '1.20.4'})${attemptStr}...`);
    
    const botOptions = {
      host: config.server.host,
      port: config.server.port,
      username: config.bot.username,
      version: config.server.version || '1.20.4',
      auth: config.bot.auth || 'offline',
      checkTimeoutInterval: 45000
    };

    try {
      this.bot = mineflayer.createBot(botOptions);
      this.setupListeners();
    } catch (createErr) {
      console.error('❌ Failed to initialize Mineflayer instance:', createErr.message);
      this.scheduleReconnect('init-failure');
    }
  }

  setupListeners() {
    this.bot.on('spawn', () => {
      console.log('✅ Bot spawned into Priyo SMP! Connection healthy.');
      this.reconnectDelay = 12000;
      this.reconnectAttempts = 0;
      this.isReconnecting = false;
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
      
      // Auto-login on spawn
      setTimeout(() => {
        this.performAuth();
      }, 1500);

      // Start Anti-AFK
      this.startAntiAfk();

      // Query player stats for whynotshanks right after join
      setTimeout(() => {
        if (this.bot && this.bot.chat) {
          console.log('📊 Initial query for /stats whynotshanks...');
          this.bot.chat('/stats whynotshanks');
        }
      }, 5000);

      // Idle player stats auto-query rotation for top baltop players
      this.topPlayerIndex = 0;
      this.topPlayersToQuery = [
        'whynotshanks', 'Achuuzz', 'JoshzGaming', 'zainspeed', 'Priyoo',
        'RocKLeeMeoww', 'zert777', 'macalo', 'Slowbag', 'kratoz3377',
        'blacknova006', 'LeoYagamiiii', 'iglspidey', '.HUNTER34622', 'HARI28',
        'GRI', 'igrise_arise_288', 'Terocious', 'luffy', 'chikkopaiyan'
      ];
      if (this.statsRotationTimer) clearInterval(this.statsRotationTimer);
      this.statsRotationTimer = setInterval(() => {
        if (!this.isScanning && this.bot && this.bot.chat && this.hasLoggedIn) {
          const target = this.topPlayersToQuery[this.topPlayerIndex % this.topPlayersToQuery.length];
          this.topPlayerIndex++;
          console.log(`📊 Auto-querying real in-game /stats for player: ${target}`);
          this.activeStatQueryPlayer = target;
          this.bot.chat(`/stats ${target}`);
        }
      }, 18000);

      // Start periodic full scan loop (/ah and /order)
      const intervalMs = (config.bot.scanIntervalSeconds || 60) * 1000;
      console.log(`⏱️ Setting up Market scan loop (/ah & /order) every ${config.bot.scanIntervalSeconds || 60} seconds.`);
      
      // First scan after 9 seconds of joining
      setTimeout(() => this.runFullMarketScan(), 9000);

      if (this.scanTimer) clearInterval(this.scanTimer);
      this.scanTimer = setInterval(() => {
        this.runFullMarketScan();
      }, intervalMs);

      // Poll web UI trigger & pending player stat commands
      if (this.triggerPollTimer) clearInterval(this.triggerPollTimer);
      this.triggerPollTimer = setInterval(async () => {
        try {
          const res = await fetch(this.getTriggerEndpoint());
          const data = await res.json();
          if (data && data.scanNow && !this.isScanning) {
            console.log('⚡ Immediate scan requested from Web Dashboard!');
            this.runFullMarketScan();
          }

          // Handle pending commands (e.g. /stats <username>, /bal <username>)
          if (data && Array.isArray(data.pendingCommands) && data.pendingCommands.length > 0) {
            for (const cmd of data.pendingCommands) {
              if (this.bot && this.bot.chat && !this.isScanning) {
                console.log(`📡 In-game executing requested command: "${cmd.command}" (target: ${cmd.target_player})`);
                this.activeStatQueryPlayer = cmd.target_player;
                this.bot.chat(cmd.command);
                await new Promise(r => setTimeout(r, 1500));
              }
            }
          }
        } catch (e) {}
      }, 3500);
    });

    this.bot.on('message', (jsonMsg) => {
      const text = jsonMsg.toString();
      console.log(`[Chat] ${text}`);

      const lower = text.toLowerCase();
      if (lower.includes('/register') || lower.includes("isn't registered") || lower.includes("not registered") || lower.includes("please, register") || lower.includes("register to the server")) {
        console.log('📝 Server requested registration! Sending /register command...');
        const regCmd = config.bot.registerCommand || `/register ${config.bot.autoLoginPassword} ${config.bot.autoLoginPassword}`;
        this.bot.chat(regCmd);
      } else if (!this.hasLoggedIn && (lower.includes('/login') || lower.includes("please login") || lower.includes("use the command /login") || lower.includes("please, login"))) {
        console.log('🔑 Server requested login! Sending /login command...');
        const logCmd = config.bot.loginCommand || `/login ${config.bot.autoLoginPassword}`;
        this.bot.chat(logCmd);
      } else if (lower.includes('successful login') || lower.includes('successfully logged in') || lower.includes('welcome back') || lower.includes('logged in')) {
        this.hasLoggedIn = true;
        console.log('🎉 Login confirmed by server! Bot authenticated.');
      } else if (lower.includes('exceeded the maximum number of registrations')) {
        console.warn('⚠️ Server IP limit: Please register helloeveryoneiam once using mobile hotspot/VPN.');
      }

      // Check for /stats or /bal response lines from server
      this.handleStatResponse(text);
    });

    this.bot.on('windowOpen', (win) => {
      const titleStr = getNormalizedTitle(win.title);
      
      // Check if it's a Player Stats window: e.g. "whynotshanks stats" or "whynotshanks"
      const activeTarget = this.activeStatQueryPlayer;
      const statsMatch = titleStr.match(/([\.a-zA-Z0-9_*]{2,20})\s+stats/i);
      const isPlayerStats = statsMatch || (activeTarget && (titleStr.toLowerCase().includes(activeTarget.toLowerCase()) || titleStr.toLowerCase().includes('stats')));
      if (isPlayerStats) {
        const targetUser = statsMatch ? statsMatch[1] : (activeTarget || titleStr.trim());
        console.log(`📊 Detected in-game Stats GUI for player: ${targetUser} (window: "${titleStr}")`);
        this.activeStatQueryPlayer = null;
        this.parseAndIngestStatsWindow(win, targetUser);
        return;
      }

      // Check if it's Bounties window: e.g. "Bounties" or "Active Bounties"
      if (titleStr.toLowerCase().includes('bount')) {
        console.log(`🎯 Detected in-game Bounties GUI (window: "${titleStr}")`);
        this.parseAndIngestBountiesWindow(win);
        return;
      }

      if (titleStr.includes('login') || titleStr.includes('register')) {
        console.log(`📋 Auth GUI window open: "${titleStr}"`);
      }
    });

    this.bot.on('kicked', (reason) => {
      const reasonStr = typeof reason === 'string' ? reason : JSON.stringify(reason);
      console.warn('⚠️ Bot kicked from server:', reasonStr);

      const lower = reasonStr.toLowerCase();
      if (reasonStr.includes('already connected to this proxy')) {
        console.warn('----------------------------------------------------------------------------------');
        console.warn(`🚨 CONFLICT: Account '${config.bot.username}' is ALREADY logged in on another client!`);
        console.warn(`👉 Solution: Exit the server on Lunar Client or use an alt username in bot/config.json.`);
        console.warn('----------------------------------------------------------------------------------');
        this.reconnectDelay = Math.min(60000, (this.reconnectDelay || 15000) * 1.5);
      } else if (reasonStr.includes('logging in too fast')) {
        this.reconnectDelay = 25000;
      } else if (lower.includes('restart') || lower.includes('server closed') || lower.includes('reboot') || lower.includes('shutting down')) {
        console.log('🔄 [Server Restart Detected] Priyo SMP is restarting. Bot will automatically reconnect once online.');
        this.reconnectDelay = 15000;
      }

      this.scheduleReconnect('kicked');
    });

    this.bot.on('error', (err) => {
      console.error('❌ Bot network error:', err.message);
      // Essential for server restarts: if server drops socket or is offline, trigger auto-reconnect
      this.scheduleReconnect('socket-error');
    });

    this.bot.on('end', (reason) => {
      console.log(`🔌 Connection ended (${reason || 'server disconnect'}).`);
      this.scheduleReconnect('end');
    });
  }

  performAuth() {
    if (this.hasLoggedIn) return;
    if (config.bot.loginCommand) {
      console.log(`🔑 Sending login command: ${config.bot.loginCommand}`);
      this.bot.chat(config.bot.loginCommand);
    } else if (config.bot.autoLoginPassword) {
      this.bot.chat(`/login ${config.bot.autoLoginPassword}`);
    }
  }

  async parseAndIngestStatsWindow(win, username) {
    try {
      const { parsePrice } = require('./loreParser');
      const payload = { username };

      const getSlotText = (slotIdx) => {
        const item = win.slots[slotIdx];
        if (!item) return '';
        const rawLore = getRawLoreLines(item);
        if (Array.isArray(rawLore) && rawLore.length > 0) {
          const l = rawLore[0];
          try {
            const p = JSON.parse(l);
            return (p.extra ? p.extra.map(e => e.text).join('') : (p.text || '')).replace(/§[0-9a-fk-or]/gi, '').trim();
          } catch {
            return String(l).replace(/§[0-9a-fk-or]/gi, '').trim();
          }
        }
        return '';
      };

      // Slot 10: Emerald -> Money: e.g. "443.65K"
      const moneyText = getSlotText(10);
      if (moneyText) payload.balance = parsePrice(moneyText);

      // Slot 11: Amethyst Shard -> Shards: e.g. "1.39K"
      const shardsText = getSlotText(11);
      if (shardsText) payload.shards = parsePrice(shardsText);

      // Slot 12: Diamond Sword -> Kills: e.g. "3"
      const killsText = getSlotText(12);
      if (killsText) payload.kills = parseInt(killsText) || 0;

      // Slot 13: Skeleton Skull -> Deaths: e.g. "20"
      const deathsText = getSlotText(13);
      if (deathsText) payload.deaths = parseInt(deathsText) || 0;

      // Slot 14: Clock -> Playtime: e.g. "16d 11h" -> 16*24 + 11 = 395h
      const playText = getSlotText(14);
      if (playText) {
        let totalHours = 0;
        const dMatch = playText.match(/(\d+)\s*d/i);
        const hMatch = playText.match(/(\d+)\s*h/i);
        if (dMatch) totalHours += parseInt(dMatch[1]) * 24;
        if (hMatch) totalHours += parseInt(hMatch[1]);
        if (totalHours > 0) payload.playtime_hours = totalHours;
      }

      // Slot 15: Stone -> Blocks Placed: e.g. "14.52K"
      const placedText = getSlotText(15);
      if (placedText) payload.blocks_placed = parsePrice(placedText);

      // Slot 16: Cobblestone -> Blocks Broken: e.g. "22.45K"
      const brokenText = getSlotText(16);
      if (brokenText) payload.blocks_broken = parsePrice(brokenText);

      // Slot 19: Zombie Head -> Mob Kills: e.g. "809"
      const mobText = getSlotText(19);
      if (mobText) payload.mob_kills = parsePrice(mobText);

      // Slot 20: Iron Nugget -> /Sell Earned: e.g. "17.60M"
      const sellText = getSlotText(20);
      if (sellText) payload.sell_earned = parsePrice(sellText);

      console.log(`✅ Extracted 100% REAL stats for ${username} from in-game GUI:`, payload);

      await fetch(`${this.getBaseApiUrl()}/api/ingest-player-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Close the stats window cleanly
      setTimeout(() => {
        try { if (this.bot) this.bot.closeWindow(win); } catch(e) {}
      }, 500);

    } catch (err) {
      console.error('Error parsing stats window:', err);
    }
  }

  async parseAndIngestBountiesWindow(win) {
    try {
      const { parsePrice } = require('./loreParser');
      const bounties = [];
      console.log('--- DUMPING BOUNTIES WINDOW SLOTS ---');
      for (let i = 0; i < Math.min(10, win.slots.length); i++) {
        const it = win.slots[i];
        if (it) {
          console.log(`Slot ${i}: name=${it.name}, displayName=${it.displayName}, customName=${it.customName}`);
          console.log(`  lore:`, getRawLoreLines(it));
          if (it.nbt) {
            console.log(`  SkullOwner:`, it.nbt?.value?.SkullOwner);
            console.log(`  display:`, JSON.stringify(it.nbt?.value?.display));
          }
        }
      }
      for (let i = 0; i < win.slots.length; i++) {
        const item = win.slots[i];
        if (!item) continue;
        const rawName = item.displayName || item.name;
        if (!rawName || ['Barrier', 'Gray Dye', 'Lime Dye', 'Arrow', 'Feather', 'Paper', 'Chest', 'Glass Pane'].includes(rawName)) continue;

        const rawLore = getRawLoreLines(item).join(' ');
        const bountyMatch = rawLore.match(/(?:bounty|reward|price|amount)\s*:?\s*[₹$]?([\d,.]+[kKmMbB]?)/i) ||
                            rawLore.match(/[₹$]([\d,.]+[kKmMbB]?)/i);
        const amount = bountyMatch ? parsePrice(bountyMatch[1]) : 0;

        let username = '';
        // Try SkullOwner from NBT
        if (item.nbt?.value?.SkullOwner?.value?.Name?.value) {
          username = String(item.nbt.value.SkullOwner.value.Name.value).trim();
        } else if (typeof item.nbt?.value?.SkullOwner?.value === 'string') {
          username = item.nbt.value.SkullOwner.value.trim();
        }
        // Try customName
        if (!username && item.customName) {
          try {
            const parsed = JSON.parse(item.customName);
            username = (parsed.extra ? parsed.extra.map(e => e.text).join('') : (parsed.text || '')).replace(/§[0-9a-fk-or]/gi, '').trim();
          } catch {
            username = String(item.customName).replace(/§[0-9a-fk-or]/gi, '').trim();
          }
        }
        // Try lore lines for "Player: xyz" or "Target: xyz"
        if (!username) {
          const targetMatch = rawLore.match(/(?:target|player|wanted|victim)\s*:?\s*([\.a-zA-Z0-9_*]{2,20})/i);
          if (targetMatch) username = targetMatch[1].trim();
        }
        // Fallback to rawName if not generic
        if (!username) {
          username = rawName.replace(/'s Head/i, '').replace(/Head/i, '').replace(/Skull/i, '').trim();
        }

        if (username && !['player', 'head', 'skeleton', 'item'].includes(username.toLowerCase()) && username.length >= 2 && username.length <= 20) {
          bounties.push({ username, bounty: amount || 50000 });
        }
      }

      if (bounties.length > 0) {
        console.log(`🎯 Extracted ${bounties.length} active player bounties:`, bounties);
        await fetch(`${this.getBaseApiUrl()}/api/ingest-bounties`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bounties })
        });
      }

      setTimeout(() => {
        try { if (this.bot) this.bot.closeWindow(win); } catch(e) {}
      }, 500);
    } catch (err) {
      console.error('Error parsing bounties window:', err);
    }
  }

  async scanBounties() {
    if (!this.bot || !this.bot.chat) return;
    console.log('🎯 Starting Bounties scan (/bounties)...');
    try {
      this.bot.chat('/bounties');
      await new Promise(r => setTimeout(r, 2500));
      if (this.bot.currentWindow) {
        try { this.bot.closeWindow(this.bot.currentWindow); } catch(e) {}
        this.bot.currentWindow = null;
        await new Promise(r => setTimeout(r, 600));
      }
    } catch (e) {
      console.warn('Error during bounties scan:', e);
    }
  }

  handleStatResponse(text) {
    if (!text) return;
    const clean = text.replace(/§[0-9a-fk-or]/gi, '').trim();
    const lower = clean.toLowerCase();

    let target = this.activeStatQueryPlayer || 'whynotshanks';

    const playerMatch = clean.match(/(?:player|stats for|balance of|user)\s*:?\s*([\.a-zA-Z0-9_*]{2,20})/i);
    if (playerMatch) target = playerMatch[1];

    const statsPayload = { username: target };
    let foundAny = false;

    // Balance detection: "whynotshanks has ₹443.65K." or "Balance: ₹443.65K"
    const balHasMatch = clean.match(/([\.a-zA-Z0-9_*]{2,20})\s+has\s+[₹$]?([\d.]+[kKmMbB]?)/i);
    if (balHasMatch) {
      const { parsePrice } = require('./loreParser');
      const bal = parsePrice(balHasMatch[2]);
      if (bal !== null) {
        statsPayload.username = balHasMatch[1];
        statsPayload.balance = bal;
        foundAny = true;
      }
    } else if (lower.includes('balance:') || lower.includes('balance is') || lower.includes('money:')) {
      const { parsePrice } = require('./loreParser');
      const bal = parsePrice(clean);
      if (bal !== null) {
        statsPayload.balance = bal;
        foundAny = true;
      }
    }

    // Kills detection
    const killsMatch = clean.match(/(?:kills|player kills)\s*:?\s*(\d+)/i);
    if (killsMatch) {
      statsPayload.kills = parseInt(killsMatch[1]);
      foundAny = true;
    }

    // Deaths detection
    const deathsMatch = clean.match(/(?:deaths|total deaths)\s*:?\s*(\d+)/i);
    if (deathsMatch) {
      statsPayload.deaths = parseInt(deathsMatch[1]);
      foundAny = true;
    }

    // Playtime detection
    const playMatch = clean.match(/(?:playtime|time played|hours)\s*:?\s*(\d+(?:\.\d+)?)\s*(?:h|hours)?/i);
    if (playMatch) {
      statsPayload.playtime_hours = parseFloat(playMatch[1]);
      foundAny = true;
    }

    // Shards detection
    const shardsMatch = clean.match(/(?:shards|points)\s*:?\s*(\d+)/i);
    if (shardsMatch) {
      statsPayload.shards = parseInt(shardsMatch[1]);
      foundAny = true;
    }

    if (foundAny) {
      console.log(`📊 Captured real in-game /stats for ${target}:`, statsPayload);
      fetch(`${this.getBaseApiUrl()}/api/ingest-player-stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(statsPayload)
      }).catch(() => {});
    }
  }

  startAntiAfk() {
    if (this.antiAfkTimer) clearInterval(this.antiAfkTimer);
    this.antiAfkTimer = setInterval(() => {
      if (this.bot && this.bot.entity && !this.isScanning) {
        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() - 0.5) * 0.4;
        this.bot.look(yaw, pitch, true).catch(() => {});
      }
    }, 15000);
  }

  async ensureAhFilterIsAll(window) {
    let cur = this.bot.currentWindow || window;
    const hopper = cur.slots[48];
    if (!hopper) return;
    if (isFilterAllSelected(hopper)) {
      console.log('✅ AH Filter is already set to ALL.');
      return;
    }

    console.log('🔄 AH Filter is NOT set to ALL. Cycling forward to reach ALL...');
    for (let c = 0; c < 12; c++) {
      await this.bot.clickWindow(48, 0, 0); // Left-click cycles forward in /ah
      await new Promise(r => setTimeout(r, 700));
      cur = this.bot.currentWindow || window;
      const updated = cur.slots[48];
      const isAll = isFilterAllSelected(updated);
      console.log(`[AH Filter Click ${c + 1}] is ALL now? ${isAll}`);
      if (isAll) {
        console.log(`✅ AH Filter successfully cycled to ALL after ${c + 1} clicks!`);
        await new Promise(r => setTimeout(r, 600));
        return;
      }
    }
  }

  async ensureOrdersFilterIsAll(window) {
    let cur = this.bot.currentWindow || window;
    const hopper = cur.slots[48];
    if (!hopper) return;
    if (isFilterAllSelected(hopper)) {
      console.log('✅ Orders Filter is already set to All.');
      return;
    }

    console.log('🔄 Orders Filter is NOT set to All. Cycling forward using left-click...');
    for (let c = 0; c < 12; c++) {
      await this.bot.clickWindow(48, 0, 0); // Left-click cycles forward in /order
      await new Promise(r => setTimeout(r, 700));
      cur = this.bot.currentWindow || window;
      const updated = cur.slots[48];
      const isAll = isFilterAllSelected(updated);
      console.log(`[Orders Filter Click ${c + 1}] is All now? ${isAll}`);
      if (isAll) {
        console.log(`✅ Orders Filter successfully cycled to All after ${c + 1} clicks!`);
        await new Promise(r => setTimeout(r, 600));
        return;
      }
    }
  }

  async scanAuctionHouse() {
    if (this.isScanning) {
      console.log('⏳ A scan is already in progress, skipping...');
      return;
    }

    this.isScanning = true;
    console.log(`📦 Starting Auction House scan (${config.bot.ahCommand || '/ah'})...`);

    try {
      // Ensure any previously opened window is completely closed
      if (this.bot.currentWindow) {
        try {
          this.bot.closeWindow(this.bot.currentWindow);
        } catch (e) {}
        this.bot.currentWindow = null;
        await new Promise(r => setTimeout(r, 1200));
      } else {
        await new Promise(r => setTimeout(r, 800));
      }

      this.bot.chat(config.bot.ahCommand || '/ah');

      // Wait for window open with 10s timeout
      let window = await this.waitForWindow(10000, t => t.includes('auction') || t.includes('ah'));

      // If window didn't open, retry once after small delay
      if (!window) {
        console.log('🔄 Window did not open on first attempt. Retrying /ah...');
        await new Promise(r => setTimeout(r, 2000));
        this.bot.chat(config.bot.ahCommand || '/ah');
        window = await this.waitForWindow(10000, t => t.includes('auction') || t.includes('ah'));
      }

      if (!window) {
        console.warn('⚠️ Auction House GUI window did not open.');
        this.isScanning = false;
        return;
      }

      console.log(`📂 AH Window opened (${window.slots.length} slots)`);

      // Verify that slot 48 filter is set to ALL
      await this.ensureAhFilterIsAll(window);

      const allListings = [];
      let currentPage = 1;
      const maxPages = config.bot.maxPages || 25;

      while (currentPage <= maxPages) {
        const curWindow = this.bot.currentWindow || window;
        const curTitle = getNormalizedTitle(curWindow.title);
        if (!curTitle.toLowerCase().includes('auction') && !curTitle.toLowerCase().includes('ah')) {
          console.warn(`⚠️ Non-AH window active: "${curTitle}", skipping AH scan.`);
          break;
        }
        console.log(`📄 Scanning AH Page ${currentPage}...`);
        await new Promise(r => setTimeout(r, 700));

        // Read auction items (slots 0 to 44)
        const pageItems = [];
        const maxItemSlot = Math.min(44, curWindow.slots.length - 1);

        for (let slotIdx = 0; slotIdx <= maxItemSlot; slotIdx++) {
          const item = curWindow.slots[slotIdx];
          if (item) {
            const parsed = parseItemLore(item);
            if (parsed && parsed.price > 0) {
              parsed.slot = slotIdx;
              parsed.page = currentPage;
              pageItems.push(parsed);
            }
          }
        }

        console.log(`   Found ${pageItems.length} active listings on page ${currentPage}`);
        allListings.push(...pageItems);

        // Check for Next Page button
        const nextSlot = this.findNextPageSlot(curWindow);
        if (nextSlot === null || currentPage >= maxPages) {
          console.log(`🏁 Reached last AH page or max limit (${currentPage})`);
          break;
        }

        // Click next page
        try {
          if (!this.bot) break;
          const winPromise = new Promise(resolve => {
            if (!this.bot) return resolve(null);
            const onOpen = (newWin) => {
              try { if (this.bot) this.bot.removeListener('windowOpen', onOpen); } catch(e) {}
              resolve(newWin);
            };
            this.bot.once('windowOpen', onOpen);
            setTimeout(() => {
              try { if (this.bot) this.bot.removeListener('windowOpen', onOpen); } catch(e) {}
              resolve(null);
            }, 2500);
          });

          if (this.bot) await this.bot.clickWindow(nextSlot, 0, 0);
          const nextWin = await winPromise;
          if (nextWin) {
            window = nextWin;
          } else {
            window = this.bot.currentWindow || window;
          }
          currentPage++;
          await new Promise(r => setTimeout(r, 700));
        } catch (clickErr) {
          console.warn(`Failed to click next page slot ${nextSlot}:`, clickErr.message);
          break;
        }
      }

      // Close the window cleanly
      try {
        this.bot.closeWindow(window);
        this.bot.currentWindow = null;
        await new Promise(r => setTimeout(r, 600));
      } catch (e) {}

      // Push real scraped data to Backend API
      if (allListings.length > 0) {
        console.log(`📤 Pushing ${allListings.length} REAL listings to API: ${config.api.endpoint}`);
        await this.pushToApi(allListings);
      } else {
        console.log('ℹ️ No items detected in AH.');
      }

    } catch (err) {
      console.error('❌ Error during AH scan:', err);
    } finally {
      this.isScanning = false;
    }
  }

  async runFullMarketScan() {
    console.log('====================================================');
    console.log('🚀 Running Full Priyo SMP Market Scan (/ah, /order, /bounties)...');
    console.log('====================================================');
    await this.scanAuctionHouse();
    await new Promise(r => setTimeout(r, 2000));
    await this.scanBuyOrders();
    await new Promise(r => setTimeout(r, 2000));
    await this.scanBounties();
    console.log('🏁 Full Market Scan completed successfully!');
  }

  async scanBuyOrders() {
    if (this.isScanning) {
      console.log('⏳ A scan is already in progress, skipping buy orders...');
      return;
    }

    this.isScanning = true;
    const orderCmd = config.bot.orderCommand || '/order';
    console.log(`📦 Starting Buy Orders scan (${orderCmd})...`);

    try {
      if (this.bot.currentWindow) {
        try {
          this.bot.closeWindow(this.bot.currentWindow);
          this.bot.currentWindow = null;
          await new Promise(r => setTimeout(r, 600));
        } catch (e) {}
      }

      this.bot.chat(orderCmd);

      let window = await this.waitForWindow(10000, t => t.includes('order'));
      if (!window) {
        console.log('🔄 Window did not open on first attempt. Retrying ' + orderCmd + '...');
        await new Promise(r => setTimeout(r, 1200));
        this.bot.chat(orderCmd);
        window = await this.waitForWindow(10000, t => t.includes('order'));
      }

      if (!window) {
        console.warn('⚠️ Buy Orders GUI window did not open.');
        this.isScanning = false;
        return;
      }

      const titleStr = getNormalizedTitle(window.title);
      console.log(`📂 Orders Window opened: "${titleStr}" (${window.slots.length} slots)`);

      const allOrders = [];
      let currentPage = 1;
      const maxPages = config.bot.orderMaxPages || 8;

      while (currentPage <= maxPages) {
        const curWindow = this.bot.currentWindow || window;
        const curTitle = getNormalizedTitle(curWindow.title);
        console.log(`📄 Scanning Orders Page ${currentPage} ("${curTitle}")...`);
        await new Promise(r => setTimeout(r, 700));

        const pageOrders = [];
        const maxItemSlot = Math.min(44, curWindow.slots.length - 1);

        for (let slotIdx = 0; slotIdx <= maxItemSlot; slotIdx++) {
          const item = curWindow.slots[slotIdx];
          if (item) {
            const parsed = parseBuyOrderLore(item);
            if (parsed && parsed.unitPrice > 0) {
              parsed.slot = slotIdx;
              parsed.page = currentPage;
              pageOrders.push(parsed);
            }
          }
        }

        console.log(`   Found ${pageOrders.length} active buy orders on page ${currentPage}`);
        allOrders.push(...pageOrders);

        // Check title e.g. "ORDERS - 1/6" to see if we reached the end
        const titleMatch = curTitle.match(/(\d+)\s*\/\s*(\d+)/);
        if (titleMatch) {
          const thisPageNum = parseInt(titleMatch[1]);
          const totalPageNum = parseInt(titleMatch[2]);
          if (thisPageNum >= totalPageNum || currentPage >= totalPageNum) {
            console.log(`🏁 Reached last Orders page (${thisPageNum}/${totalPageNum})`);
            break;
          }
        }

        const nextSlot = this.findNextPageSlot(curWindow);
        if (nextSlot === null || currentPage >= maxPages) {
          console.log(`🏁 Reached last Orders page or max limit (${currentPage})`);
          break;
        }

        try {
          const winPromise = new Promise(resolve => {
            const onOpen = (newWin) => {
              try { this.bot.removeListener('windowOpen', onOpen); } catch(e) {}
              resolve(newWin);
            };
            this.bot.once('windowOpen', onOpen);
            setTimeout(() => {
              try { this.bot.removeListener('windowOpen', onOpen); } catch(e) {}
              resolve(null);
            }, 2500);
          });

          await this.bot.clickWindow(nextSlot, 0, 0);
          const nextWin = await winPromise;
          if (nextWin) {
            window = nextWin;
          } else {
            window = this.bot.currentWindow || window;
          }
          currentPage++;
          await new Promise(r => setTimeout(r, 700));
        } catch (clickErr) {
          console.warn(`Failed to click next page slot ${nextSlot}:`, clickErr.message);
          break;
        }
      }

      try {
        this.bot.closeWindow(window);
        this.bot.currentWindow = null;
        await new Promise(r => setTimeout(r, 600));
      } catch (e) {}

      if (allOrders.length > 0) {
        const endpoint = this.getOrdersEndpoint();
        console.log(`📤 Pushing ${allOrders.length} REAL buy orders to API: ${endpoint}`);
        await this.pushOrdersToApi(allOrders);
      } else {
        console.log('ℹ️ No items detected in Orders GUI.');
      }

    } catch (err) {
      console.error('❌ Error during Orders scan:', err);
    } finally {
      this.isScanning = false;
    }
  }

  async pushOrdersToApi(orders) {
    const endpoint = this.getOrdersEndpoint();
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'mineflayer-bot',
          server: config.server.host,
          timestamp: Date.now(),
          count: orders.length,
          orders: orders
        })
      });
      const data = await res.json();
      console.log(`✅ Server saved ${orders.length} REAL buy orders! Response:`, data);
    } catch (apiErr) {
      console.error(`⚠️ Could not reach API at ${endpoint}:`, apiErr.message);
    }
  }

  findNextPageSlot(window) {
    const configuredSlot = config.bot.nextPageSlot || 53;
    const itemAtConfig = window.slots[configuredSlot];
    if (itemAtConfig && !this.isGlassPaneOrBarrier(itemAtConfig)) {
      return configuredSlot;
    }

    for (let i = 45; i < Math.min(54, window.slots.length); i++) {
      const item = window.slots[i];
      if (item && !this.isGlassPaneOrBarrier(item)) {
        const name = (item.displayName || item.name || '').toLowerCase();
        if (name.includes('next') || name.includes('forward') || name.includes('page') || name.includes('arrow')) {
          return i;
        }
      }
    }

    return null;
  }

  isGlassPaneOrBarrier(item) {
    const name = (item.name || '').toLowerCase();
    return name.includes('stained_glass_pane') || name.includes('barrier') || name.includes('air');
  }

  waitForWindow(timeoutMs = 10000, matcher = null) {
    return new Promise((resolve) => {
      let resolved = false;

      const timer = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          if (this.bot) {
            try { this.bot.removeListener('windowOpen', onWindowOpen); } catch (e) {}
          }
          resolve(null);
        }
      }, timeoutMs);

      const onWindowOpen = (win) => {
        const titleStr = getNormalizedTitle(win.title);
        console.log(`Window opened: "${titleStr}" (${win.slots ? win.slots.length : 0} slots)`);

        // If it's a stats window, parse it immediately!
        const activeTarget = this.activeStatQueryPlayer;
        const statsMatch = titleStr.match(/([\.a-zA-Z0-9_*]{2,20})\s+stats/i);
        const isPlayerStats = statsMatch || (activeTarget && (titleStr.toLowerCase().includes(activeTarget.toLowerCase()) || titleStr.toLowerCase().includes('stats')));
        if (isPlayerStats) {
          const targetUser = statsMatch ? statsMatch[1] : (activeTarget || titleStr.trim());
          console.log(`📊 Intercepted Stats GUI for: ${targetUser} (window: "${titleStr}")`);
          this.activeStatQueryPlayer = null;
          this.parseAndIngestStatsWindow(win, targetUser);
          return; // Do not resolve market scanner window with stats GUI!
        }

        // If it's a login or welcome popup, close it immediately and keep waiting!
        if (titleStr.includes('login') || titleStr.includes('register') || titleStr.includes('welcome back')) {
          console.log(`Closing non-target popup window: "${titleStr}"`);
          try { if (this.bot) this.bot.closeWindow(win); } catch(e) {}
          if (this.bot) this.bot.currentWindow = null;
          return;
        }

        if (matcher && !matcher(titleStr)) {
          console.log(`Window "${titleStr}" does not match expected criteria, continuing wait...`);
          return;
        }

        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          if (this.bot) {
            try { this.bot.removeListener('windowOpen', onWindowOpen); } catch (e) {}
          }
          resolve(win);
        }
      };

      this.bot.on('windowOpen', onWindowOpen);
    });
  }

  async pushToApi(listings) {
    try {
      const res = await fetch(this.getIngestEndpoint(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'mineflayer-bot',
          server: config.server.host,
          timestamp: Date.now(),
          count: listings.length,
          listings: listings
        })
      });
      const data = await res.json();
      console.log(`✅ Server saved ${listings.length} REAL listings! Response:`, data);
    } catch (apiErr) {
      console.error(`⚠️ Could not reach API at ${this.getIngestEndpoint()}:`, apiErr.message);
    }
  }

  cleanup() {
    if (this.scanTimer) clearInterval(this.scanTimer);
    if (this.triggerPollTimer) clearInterval(this.triggerPollTimer);
    if (this.antiAfkTimer) clearInterval(this.antiAfkTimer);
    this.scanTimer = null;
    this.triggerPollTimer = null;
    this.antiAfkTimer = null;
    this.isScanning = false;
    this.hasLoggedIn = false;

    if (this.bot) {
      try {
        this.bot.removeAllListeners();
        this.bot.quit();
      } catch (e) {}
      this.bot = null;
    }
  }

  scheduleReconnect(source) {
    this.cleanup();
    if (this.isReconnecting) return;
    this.isReconnecting = true;
    this.reconnectAttempts = (this.reconnectAttempts || 0) + 1;

    // Smart backoff: 10s-15s, expanding up to 30s max if server reboot takes 1-2 minutes
    const baseDelay = this.reconnectDelay || 12000;
    const delay = Math.min(30000, Math.max(10000, baseDelay + (this.reconnectAttempts > 3 ? 5000 : 0)));

    console.log(`🔄 [${source}] Server disconnected/restarting. Reconnecting in ${(delay / 1000).toFixed(0)}s (Attempt #${this.reconnectAttempts})...`);

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(() => {
      this.isReconnecting = false;
      this.reconnectTimer = null;
      console.log(`🚀 [Auto-Reconnect] Joining Priyo SMP (attempt #${this.reconnectAttempts})...`);
      this.start();
    }, delay);
  }
}

// Global process error handlers to prevent bot crash on unexpected network disconnects
process.on('uncaughtException', (err) => {
  console.error('⚠️ Uncaught Exception in Bot process:', err.message);
  if (scraper && typeof scraper.scheduleReconnect === 'function') {
    scraper.scheduleReconnect('uncaught-exception');
  }
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Unhandled Rejection in Bot process:', reason);
});

// Start scraper bot
const scraper = new AhScraperBot();
scraper.start();
