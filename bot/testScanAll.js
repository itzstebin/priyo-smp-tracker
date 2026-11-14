/**
 * testScanAll.js
 * Connects to Priyo SMP, tests filter verification on /ah and /order,
 * tests /stats GUI window parsing, and verifies all data gets saved.
 */

const mineflayer = require('mineflayer');
const fs = require('fs');
const path = require('path');
const { parseItemLore, parseBuyOrderLore, parsePrice, stripColorCodes } = require('./loreParser');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

console.log('Testing bot connection to', config.server.host);

const bot = mineflayer.createBot({
  host: config.server.host,
  port: config.server.port,
  username: config.bot.username,
  version: config.server.version || '1.20.4',
  auth: config.bot.auth || 'offline'
});

function getRawLoreLines(item) {
  if (!item) return [];
  const lore = [];
  if (item.customLore && Array.isArray(item.customLore)) {
    item.customLore.forEach(l => lore.push(String(l)));
  } else if (item.nbt?.value?.display?.value?.Lore?.value?.value) {
    const rawLore = item.nbt.value.display.value.Lore.value.value;
    if (Array.isArray(rawLore)) {
      rawLore.forEach(l => {
        try {
          const parsed = JSON.parse(l);
          const txt = (parsed.extra ? parsed.extra.map(e => e.text).join('') : (parsed.text || ''));
          lore.push(txt || l);
        } catch {
          lore.push(String(l));
        }
      });
    }
  }
  return lore;
}

function isFilterOptionActive(item, targetOption) {
  const lines = getRawLoreLines(item);
  for (const line of lines) {
    // Check if line contains targetOption (e.g. "ALL" or "All") AND has green color code §a
    if (line.toLowerCase().includes(targetOption.toLowerCase())) {
      if (line.includes('§a') || line.includes('&a') || line.startsWith('§a') || line.includes('• ALL') || line.includes('• All')) {
        // Also ensure another line is NOT active
        return true;
      }
    }
  }
  return false;
}

function getActiveFilterOption(item) {
  const lines = getRawLoreLines(item);
  for (const line of lines) {
    if (line.includes('§a') || line.includes('&a')) {
      const clean = stripColorCodes(line).replace(/^[•\s*-]+/, '').trim();
      return clean;
    }
  }
  return 'Unknown';
}

bot.on('spawn', async () => {
  console.log('✅ Bot spawned!');
  
  // Auth
  setTimeout(() => {
    bot.chat(`/login ${config.bot.autoLoginPassword}`);
  }, 1500);

  await new Promise(r => setTimeout(r, 6000));

  console.log('\n--- 1. TESTING /stats whynotshanks GUI ---');
  bot.chat('/stats whynotshanks');
  
  const statsWin = await waitForSpecificWindow((win, titleStr) => {
    return titleStr.toLowerCase().includes('stats');
  }, 8000);

  if (statsWin) {
    console.log(`📊 Stats window opened: "${getWindowTitleString(statsWin.title)}"`);
    for (let i = 0; i < statsWin.slots.length; i++) {
      const it = statsWin.slots[i];
      if (it) {
        console.log(`Slot ${i} (${it.name}): customLore=${JSON.stringify(getRawLoreLines(it))}`);
      }
    }
    bot.closeWindow(statsWin);
  } else {
    console.log('⚠️ Stats window did not open!');
  }

  await new Promise(r => setTimeout(r, 2000));

  console.log('\n--- 2. TESTING /ah FILTER HOPPER ---');
  bot.chat('/ah');
  const ahWin = await waitForSpecificWindow((win, titleStr) => {
    return titleStr.toLowerCase().includes('auction') || titleStr.toLowerCase().includes('ah');
  }, 8000);

  if (ahWin) {
    console.log(`📂 AH window opened: "${getWindowTitleString(ahWin.title)}"`);
    const hopper = ahWin.slots[48];
    if (hopper) {
      console.log('Slot 48 name:', hopper.name, 'lore:', JSON.stringify(getRawLoreLines(hopper)));
      let active = getActiveFilterOption(hopper);
      console.log('Current AH active filter:', active);
      
      // Let's cycle right click if not ALL
      let clicks = 0;
      while (!active.toLowerCase().includes('all') && clicks < 10) {
        console.log(`Cycling AH filter (right-click ${clicks + 1})...`);
        await bot.clickWindow(48, 1, 0); // Right-click cycles forward
        await new Promise(r => setTimeout(r, 800));
        const updatedHopper = ahWin.slots[48];
        active = getActiveFilterOption(updatedHopper);
        console.log('Now active:', active);
        if (active.toLowerCase().includes('all')) break;
        clicks++;
      }
    } else {
      console.log('Slot 48 is null in AH!');
    }

    // Read first 10 slots of page 1 to see items
    console.log('Scanning first 10 items in AH:');
    for (let i = 0; i < 10; i++) {
      const it = ahWin.slots[i];
      if (it) {
        const p = parseItemLore(it);
        console.log(`  Item ${i}: ${p.displayName} | Price: ${p.price} | Seller: ${p.seller} | Category: ${p.category}`);
      }
    }

    bot.closeWindow(ahWin);
  } else {
    console.log('⚠️ AH window did not open!');
  }

  await new Promise(r => setTimeout(r, 2000));

  console.log('\n--- 3. TESTING /order FILTER HOPPER ---');
  bot.chat('/order');
  const orderWin = await waitForSpecificWindow((win, titleStr) => {
    return titleStr.toLowerCase().includes('order');
  }, 8000);

  if (orderWin) {
    console.log(`📂 Orders window opened: "${getWindowTitleString(orderWin.title)}"`);
    const hopper = orderWin.slots[48];
    if (hopper) {
      console.log('Orders Slot 48 lore:', JSON.stringify(getRawLoreLines(hopper)));
      let active = getActiveFilterOption(hopper);
      console.log('Current Orders active filter:', active);

      let clicks = 0;
      while (!active.toLowerCase().includes('all') && clicks < 10) {
        console.log(`Cycling Orders filter (left-click ${clicks + 1})...`);
        await bot.clickWindow(48, 0, 0); // Left-click cycles forward in /order
        await new Promise(r => setTimeout(r, 800));
        const updatedHopper = orderWin.slots[48];
        active = getActiveFilterOption(updatedHopper);
        console.log('Now active:', active);
        if (active.toLowerCase().includes('all')) break;
        clicks++;
      }
    }

    // Read first 10 orders
    console.log('Scanning first 10 items in /order:');
    for (let i = 0; i < 10; i++) {
      const it = orderWin.slots[i];
      if (it) {
        const p = parseBuyOrderLore(it);
        if (p) {
          console.log(`  Order ${i}: ${p.itemName} | Unit: ${p.unitPrice} | Buyer: ${p.buyer} | Wanted: ${p.unitsWanted}`);
        }
      }
    }

    bot.closeWindow(orderWin);
  } else {
    console.log('⚠️ Orders window did not open!');
  }

  console.log('\nTest complete! Exiting...');
  setTimeout(() => process.exit(0), 1000);
});

bot.on('message', m => console.log('[Chat]', m.toString()));
bot.on('kicked', r => console.log('[Kicked]', r));
bot.on('error', e => console.error('[Error]', e));

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

function getWindowTitleString(title) {
  return normalizeSmallCaps(extractTitleString(title));
}

function waitForSpecificWindow(matcher, timeoutMs = 8000) {
  return new Promise(resolve => {
    let done = false;
    const timer = setTimeout(() => {
      if (!done) {
        done = true;
        resolve(null);
      }
    }, timeoutMs);

    const handler = (win) => {
      const titleStr = getWindowTitleString(win.title);
      console.log(`Window opened parsed normalized: "${titleStr}"`);
      if (matcher(win, titleStr)) {
        if (!done) {
          done = true;
          clearTimeout(timer);
          bot.removeListener('windowOpen', handler);
          resolve(win);
        }
      }
    };
    bot.on('windowOpen', handler);
  });
}
