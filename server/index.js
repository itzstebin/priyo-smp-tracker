/**
 * index.js
 * Express REST API server for Priyo SMP Tracker.
 * 100% DonutStats compatible endpoints for Auction House, Orders, Prices, Economy & Rankings.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const {
  ingestListings,
  ingestBuyOrders,
  getActiveListings,
  getBuyOrders,
  getLeaderboardStats,
  getFlippingRadar,
  getPlayerProfile,
  updatePlayerStats,
  updateBounties,
  getItemHistory,
  getItemDetails,
  getTrackedItems,
  getMarketStats,
  getPlayersList,
  getRecentSales,
  getVerifiedDeals,
  getMostViewedPlayers,
  recordPlayerView
} = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

let liveServerStatus = {
  online: true,
  playersOnline: 48,
  maxPlayers: 1000,
  serverHost: 'play.priyosmp.com',
  serverPort: 25565,
  lastPing: Date.now()
};

async function pingPriyoServer() {
  try {
    const res = await fetch('https://api.mcsrvstat.us/3/play.priyosmp.com', {
      signal: AbortSignal.timeout(4000)
    });
    const d = await res.json();
    if (d && d.players) {
      liveServerStatus.online = !!d.online;
      liveServerStatus.playersOnline = Number(d.players.online) || 48;
      liveServerStatus.maxPlayers = Number(d.players.max) || 1000;
      liveServerStatus.lastPing = Date.now();
    }
  } catch (e) {}
}

if (!process.env.VERCEL) {
  pingPriyoServer();
  setInterval(pingPriyoServer, 20000);
}

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.set('json spaces', 2);

// GET /v1/status - Live server online player count
app.get(['/v1/status', '/api/status'], async (req, res) => {
  if (Date.now() - liveServerStatus.lastPing > 30000) {
    await pingPriyoServer();
  }
  res.json({
    success: true,
    server: 'play.priyosmp.com',
    ...liveServerStatus
  });
});

function getClientDir() {
  const candidates = [
    path.join(process.cwd(), 'client'),
    path.join(__dirname, '..', 'client'),
    path.join(__dirname, 'client')
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(process.cwd(), 'client');
}

const clientDir = getClientDir();
app.use(express.static(clientDir));

// Healthcheck endpoint for Railway / cloud runners
app.get('/health', (req, res) => res.status(200).send('OK'));

/**
 * ============================================================================
 * DONUTSTATS-COMPATIBLE API ENDPOINTS (v1)
 * Priyo SMP players, prices, orders, and markets as JSON
 * ============================================================================
 */

// GET /v1/auction - Live Auction House listings
app.get(['/v1/auction', '/api/listings'], async (req, res) => {
  try {
    const { search, category, sort, page, limit } = req.query;
    const data = await getActiveListings({
      search,
      category,
      sort,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50
    });
    res.json({
      success: true,
      server: 'play.priyosmp.com',
      ...data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /v1/deals - Verified real deals (Arbitrage snipes & true discounts, excluding meme listings)
app.get(['/v1/deals', '/api/deals'], async (req, res) => {
  try {
    const deals = await getVerifiedDeals();
    res.json({
      success: true,
      deals
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /v1/recent-sales - Real completed sales that actually sold
app.get(['/v1/recent-sales', '/api/recent-sales'], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const sales = await getRecentSales(limit);
    res.json({
      success: true,
      sales
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /v1/orders - Live Buy Orders (/order)
app.get(['/v1/orders', '/api/orders'], async (req, res) => {
  try {
    const { search, category, sort, page, limit } = req.query;
    const data = await getBuyOrders({
      search,
      category,
      sort,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50
    });
    res.json({
      success: true,
      server: 'play.priyosmp.com',
      ...data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /v1/flips - Arbitrage & sniper deals (Matching Screenshot 5)
app.get(['/v1/flips', '/api/flips'], async (req, res) => {
  try {
    const flipsData = await getFlippingRadar();
    res.json({
      success: true,
      server: 'play.priyosmp.com',
      ...flipsData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /v1/leaderboard - Server Rankings & Leaderboard (/leaderboard & /baltop)
app.get(['/v1/leaderboard', '/api/leaderboard'], async (req, res) => {
  try {
    const type = req.query.type || 'money';
    const search = req.query.search || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const data = await getLeaderboardStats({ type, search, limit, page });
    res.json({
      success: true,
      server: 'play.priyosmp.com',
      ...data
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /v1/most-viewed - Top viewed players this week (Live real-time view counts)
app.get(['/v1/most-viewed', '/api/most-viewed'], async (req, res) => {
  try {
    const list = await getMostViewedPlayers(7, 5);
    res.json({
      success: true,
      server: 'play.priyosmp.com',
      players: list
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /v1/player/:username - Player Profile Lookup
app.get(['/v1/player/:username', '/api/player/:username'], async (req, res) => {
  try {
    const { username } = req.params;
    const profileData = await getPlayerProfile(username);
    res.json({
      success: true,
      server: 'play.priyosmp.com',
      ...profileData
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /v1/items - Tracked items with valuations & metrics
app.get(['/v1/items', '/api/items'], async (req, res) => {
  try {
    const items = await getTrackedItems();
    res.json({
      success: true,
      server: 'play.priyosmp.com',
      count: items.length,
      items
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /v1/items/:itemName - Real-time single item pricing, listings & buy orders
app.get(['/v1/items/:itemName', '/api/item/:itemName'], async (req, res) => {
  try {
    const itemName = req.params.itemName;
    if (!itemName) {
      return res.status(400).json({ success: false, error: 'Item parameter is required' });
    }
    const details = await getItemDetails(itemName);
    res.json({
      success: true,
      server: 'play.priyosmp.com',
      ...details
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /v1/items/:itemName/history - Historical price timeseries
app.get(['/v1/items/:itemName/history', '/api/history'], async (req, res) => {
  try {
    const itemName = req.params.itemName || req.query.item;
    if (!itemName) {
      return res.status(400).json({ success: false, error: 'Item parameter is required' });
    }
    const days = parseInt(req.query.days) || 7;
    const history = await getItemHistory(itemName, days);
    res.json({
      success: true,
      item: itemName,
      days,
      count: history.length,
      datapoints: history
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /v1/players - Top player sellers
app.get(['/v1/players', '/api/players'], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const players = await getPlayersList(limit);
    res.json({
      success: true,
      server: 'play.priyosmp.com',
      count: players.length,
      players
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /v1/economy - Global money supply, volume & market metrics
app.get(['/v1/economy', '/api/stats'], async (req, res) => {
  try {
    const stats = await getMarketStats();
    res.json({
      success: true,
      server: 'play.priyosmp.com',
      economy: {
        ...stats,
        players_online: liveServerStatus.playersOnline,
        max_players: liveServerStatus.maxPlayers
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * Ingestion Endpoints
 */
app.post('/api/ingest', async (req, res) => {
  try {
    const { listings, source } = req.body;
    if (!Array.isArray(listings)) {
      return res.status(400).json({ error: 'listings must be an array' });
    }

    const result = await ingestListings(listings, source || 'mineflayer-bot');
    res.json(result);
  } catch (err) {
    console.error('Ingest error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ingest-orders', async (req, res) => {
  try {
    const { orders, source } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ error: 'orders must be an array' });
    }

    const result = await ingestBuyOrders(orders, source || 'mineflayer-bot');
    res.json(result);
  } catch (err) {
    console.error('Ingest orders error:', err);
    res.status(500).json({ error: err.message });
  }
});

let scanRequested = false;
let pendingCommands = [];

app.post('/api/trigger-mock-scan', (req, res) => {
  scanRequested = true;
  res.json({ message: 'Live scan requested from bot. Bot will scan next cycle.' });
});

// Request in-game /stats query for a player
app.post('/api/player/sync-stats', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  const clean = username.trim();
  pendingCommands.push({ command: `/stats ${clean}`, target_player: clean, type: 'stats', requested_at: Date.now() });
  pendingCommands.push({ command: `/bal ${clean}`, target_player: clean, type: 'bal', requested_at: Date.now() });
  console.log(`📡 Queued in-game stats sync for player: ${clean}`);
  res.json({ success: true, message: `In-game /stats command queued for ${clean}` });
});

// Ingest updated player stats from bot
app.post('/api/ingest-player-stats', async (req, res) => {
  try {
    const statsData = req.body;
    if (!statsData || !statsData.username) {
      return res.status(400).json({ error: 'Invalid player stats payload' });
    }
    const result = await updatePlayerStats(statsData);
    console.log(`✅ Ingested live /stats for player ${statsData.username}:`, result);
    res.json(result);
  } catch (err) {
    console.error('Failed to ingest player stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Ingest active player bounties from in-game /bounties
app.post('/api/ingest-bounties', async (req, res) => {
  try {
    const { bounties } = req.body;
    if (!Array.isArray(bounties) || bounties.length === 0) {
      return res.status(400).json({ error: 'Bounties array required' });
    }
    const result = await updateBounties(bounties);
    console.log(`🎯 Ingested ${bounties.length} active player bounties:`, result);
    res.json({ success: true, count: bounties.length });
  } catch (err) {
    console.error('Failed to ingest bounties:', err);
    res.status(500).json({ error: err.message });
  }
});

// Queue arbitrary in-game command (e.g. /bounties)
app.post('/api/bot/command', (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: 'Command required' });
  pendingCommands.push({ command: command.trim(), type: 'raw', requested_at: Date.now() });
  console.log(`📡 Queued in-game command: ${command}`);
  res.json({ success: true, message: `Command queued: ${command}` });
});

app.get('/api/bot/check-trigger', (req, res) => {
  const requested = scanRequested;
  scanRequested = false;
  const cmds = [...pendingCommands];
  pendingCommands = [];
  res.json({ scanNow: requested, pendingCommands: cmds });
});

// SPA fallback for all frontend DonutStats URLs
app.use((req, res, next) => {
  if (req.path.startsWith('/v1') || req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found' });
  }
  try {
    const indexPath = path.join(clientDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      const html = fs.readFileSync(indexPath, 'utf8');
      return res.type('html').send(html);
    }
    return res.status(200).send('<h1>PriyoSMP Tracker</h1><p>Ready.</p>');
  } catch (err) {
    res.status(500).send('Error loading page: ' + err.message);
  }
});

if (!process.env.VERCEL) {
  global.__EXPRESS_SERVER_STARTED__ = true;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(`🚀 PriyoStats (DonutStats for Priyo SMP) is LIVE at: http://localhost:${PORT}`);
    console.log(`📡 Ingestion Endpoint: http://localhost:${PORT}/api/ingest`);
    console.log(`=======================================================`);

    // Auto-launch the 24/7 scraper bot in persistent cloud environments (Railway, Render, VPS)
    if (process.env.RUN_BOT !== 'false') {
      try {
        console.log('🤖 Auto-starting 24/7 scraper bot (helloeveryoneiam)...');
        require('../bot/scraper.js');
      } catch (botErr) {
        console.error('Failed to auto-start bot:', botErr.message);
      }
    }
  });
}

module.exports = app;
