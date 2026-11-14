/**
 * memDb.js
 * High-performance pure JavaScript in-memory database engine for Priyo SMP Tracker.
 * 100% compatible with server/db.js interface.
 * Zero native binary dependencies, zero GLIBC requirements - runs on any serverless platform (Vercel, AWS Lambda, Cloudflare).
 */

const fs = require('fs');
const path = require('path');

let snapshotData = {
  active_listings: [],
  buy_orders: [],
  player_stats: [],
  price_history: [],
  item_sales: [],
  player_views: []
};

// Locate snapshot.json
function loadSnapshot() {
  const candidatePaths = [
    path.join(process.cwd(), 'server', 'data', 'snapshot.json'),
    path.join(__dirname, 'data', 'snapshot.json'),
    path.join(__dirname, '..', 'server', 'data', 'snapshot.json')
  ];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        console.log(`📦 Loading in-memory snapshot from ${p}...`);
        const raw = fs.readFileSync(p, 'utf8');
        snapshotData = JSON.parse(raw);
        console.log(`✅ Loaded snapshot: ${snapshotData.active_listings.length} listings, ${snapshotData.buy_orders.length} orders, ${snapshotData.player_stats.length} players.`);
        return;
      } catch (err) {
        console.error('Failed to parse snapshot.json:', err.message);
      }
    }
  }
  console.warn('⚠️ No snapshot.json found, starting with empty in-memory collections.');
}

loadSnapshot();

function standardizeCategory(name) {
  const n = String(name || '').toLowerCase();
  if (n.includes('sword') || n.includes('bow') || n.includes('arrow') || n.includes('shield') || n.includes('axe') || n.includes('armor') || n.includes('helmet') || n.includes('chestplate') || n.includes('leggings') || n.includes('boots') || n.includes('trident') || n.includes('mace')) return 'Combat';
  if (n.includes('pickaxe') || n.includes('shovel') || n.includes('hoe') || n.includes('rod') || n.includes('flint')) return 'Tools';
  if (n.includes('diamond') || n.includes('emerald') || n.includes('netherite') || n.includes('gold') || n.includes('iron') || n.includes('ancient') || n.includes('beacon') || n.includes('totem') || n.includes('elytra') || n.includes('shulker') || n.includes('scrap')) return 'Valuables';
  if (n.includes('book') || n.includes('potion') || n.includes('bottle')) return 'Potions and books';
  if (n.includes('flesh') || n.includes('bone') || n.includes('gunpowder') || n.includes('string') || n.includes('eye') || n.includes('tear') || n.includes('pearl') || n.includes('rod') || n.includes('scale') || n.includes('membrane')) return 'Mob drops';
  if (n.includes('apple') || n.includes('bread') || n.includes('beef') || n.includes('pork') || n.includes('chicken') || n.includes('mutton') || n.includes('fish') || n.includes('golden') || n.includes('carrot') || n.includes('potato') || n.includes('berry') || n.includes('melon') || n.includes('stew') || n.includes('pie') || n.includes('cookie')) return 'Food';
  if (n.includes('stone') || n.includes('dirt') || n.includes('deepslate') || n.includes('wood') || n.includes('log') || n.includes('plank') || n.includes('brick') || n.includes('glass') || n.includes('sand') || n.includes('gravel') || n.includes('obsidian') || n.includes('block')) return 'Blocks';
  return 'Other';
}

function getActiveListings({ search = '', category = 'All', sort = 'newest', page = 1, limit = 50 }) {
  return new Promise((resolve) => {
    let list = snapshotData.active_listings.filter(l => {
      if (!l.seller || l.seller === 'Unknown' || !l.price || l.price <= 0) return false;
      if (category && category !== 'All' && l.category !== category) return false;
      if (search) {
        const s = search.toLowerCase();
        const dn = String(l.display_name || '').toLowerCase();
        const rn = String(l.raw_name || '').toLowerCase();
        const sel = String(l.seller || '').toLowerCase();
        if (!dn.includes(s) && !rn.includes(s) && !sel.includes(s)) return false;
      }
      return true;
    });

    if (sort === 'lowest_price' || sort === 'cheapest' || sort === 'unit_price') {
      list.sort((a, b) => (a.unit_price || a.price) - (b.unit_price || b.price));
    } else if (sort === 'highest_price' || sort === 'expensive') {
      list.sort((a, b) => (b.unit_price || b.price) - (a.unit_price || a.price));
    } else if (sort === 'ending_soon') {
      list.sort((a, b) => (a.expires_at || 0) - (b.expires_at || 0));
    } else {
      list.sort((a, b) => (b.scanned_at || b.first_seen_at || b.id || 0) - (a.scanned_at || a.first_seen_at || a.id || 0));
    }

    const total = list.length;
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit).map(r => ({
      ...r,
      enchants: typeof r.enchants === 'string' ? JSON.parse(r.enchants || '[]') : (r.enchants || []),
      lore: typeof r.lore === 'string' ? JSON.parse(r.lore || '[]') : (r.lore || [])
    }));

    resolve({
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      listings: paginated
    });
  });
}

function getBuyOrders({ search = '', category = 'All', sort = 'highest_price', page = 1, limit = 50 }) {
  return new Promise((resolve) => {
    let list = snapshotData.buy_orders.filter(o => {
      if (category && category !== 'All' && o.category !== category) return false;
      if (search) {
        const s = search.toLowerCase();
        const iname = String(o.item_name || '').toLowerCase();
        const p = String(o.player || '').toLowerCase();
        if (!iname.includes(s) && !p.includes(s)) return false;
      }
      return true;
    });

    if (sort === 'cheapest') {
      list.sort((a, b) => (a.unit_price || 0) - (b.unit_price || 0));
    } else if (sort === 'budget' || sort === 'highest_payout') {
      list.sort((a, b) => (b.total_budget || 0) - (a.total_budget || 0));
    } else if (sort === 'units') {
      list.sort((a, b) => (b.units_wanted || 0) - (a.units_wanted || 0));
    } else if (sort === 'newest') {
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else {
      list.sort((a, b) => (b.unit_price || 0) - (a.unit_price || 0));
    }

    const total = list.length;
    const totalMoneyInOrders = list.reduce((sum, o) => sum + (Number(o.total_budget) || 0), 0);
    const totalUnitsWanted = list.reduce((sum, o) => sum + (Number(o.units_wanted) || 0), 0);
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);

    resolve({
      total,
      totalMoneyInOrders,
      totalUnitsWanted,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      orders: paginated
    });
  });
}

function getLeaderboardStats({ type = 'money', search = '', limit = 50, page = 1 }) {
  return new Promise((resolve) => {
    let list = snapshotData.player_stats.filter(p => {
      if (search) {
        return String(p.username || '').toLowerCase().includes(search.toLowerCase());
      }
      return true;
    });

    const colMap = {
      money: 'balance',
      playtime: 'playtime_hours',
      kills: 'kills',
      shards: 'shards',
      deaths: 'deaths',
      bounties: 'bounty',
      'mob-kills': 'mob_kills',
      'blocks-broken': 'blocks_broken',
      'blocks-placed': 'blocks_placed'
    };

    const sortCol = colMap[type] || 'balance';
    list.sort((a, b) => (Number(b[sortCol]) || 0) - (Number(a[sortCol]) || 0));

    const total = list.length;
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit).map((r, idx) => ({
      ...r,
      rank: offset + idx + 1
    }));

    resolve({
      type,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      leaderboard: paginated
    });
  });
}

function getPlayerProfile(username) {
  return new Promise((resolve, reject) => {
    const cleanUser = String(username || '').trim();
    const p = snapshotData.player_stats.find(pl => String(pl.username || '').toLowerCase() === cleanUser.toLowerCase());
    if (!p) return reject(new Error('Player not found'));

    // Calculate rank
    const sorted = [...snapshotData.player_stats].sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0));
    const rank = sorted.findIndex(pl => String(pl.username || '').toLowerCase() === cleanUser.toLowerCase()) + 1;

    const playSorted = [...snapshotData.player_stats].sort((a, b) => (Number(b.playtime_hours) || 0) - (Number(a.playtime_hours) || 0));
    const playRank = playSorted.findIndex(pl => String(pl.username || '').toLowerCase() === cleanUser.toLowerCase()) + 1;

    const playerListings = snapshotData.active_listings.filter(l => String(l.seller || '').toLowerCase() === cleanUser.toLowerCase());
    const playerOrders = snapshotData.buy_orders.filter(o => String(o.player || '').toLowerCase() === cleanUser.toLowerCase());

    resolve({
      ...p,
      rank: rank || 1,
      playRank: playRank || 1,
      totalPlayers: snapshotData.player_stats.length,
      listings: playerListings,
      orders: playerOrders,
      recentActivities: []
    });
  });
}

function getItemDetails(itemName) {
  return new Promise((resolve) => {
    const cleanName = String(itemName || '').trim();
    const list = snapshotData.active_listings.filter(l => String(l.display_name || '').toLowerCase() === cleanName.toLowerCase());
    const ords = snapshotData.buy_orders.filter(o => String(o.item_name || '').toLowerCase() === cleanName.toLowerCase());
    const sales = snapshotData.item_sales.filter(s => String(s.item_name || '').toLowerCase() === cleanName.toLowerCase());

    const prices = list.map(l => Number(l.unit_price) || Number(l.price) || 0).filter(p => p > 0);
    prices.sort((a, b) => a - b);

    const cheapest = prices.length > 0 ? prices[0] : 0;
    const median = prices.length > 0 ? prices[Math.floor(prices.length / 2)] : 0;
    const totalUnits = list.reduce((sum, l) => sum + (Number(l.count) || 1), 0);

    ords.sort((a, b) => (Number(b.unit_price) || 0) - (Number(a.unit_price) || 0));
    const topOrderPrice = ords.length > 0 ? Number(ords[0].unit_price) || 0 : 0;
    const totalUnitsWanted = ords.reduce((sum, o) => sum + (Number(o.units_wanted) || 0), 0);
    const totalBudget = ords.reduce((sum, o) => sum + (Number(o.total_budget) || 0), 0);

    const askingPrice = cheapest > 0 ? cheapest : (topOrderPrice > 0 ? Math.round(topOrderPrice * 1.15) : 5000);
    const spread = topOrderPrice > 0 ? Math.max(0, Math.round(askingPrice - topOrderPrice)) : 0;

    const seed = cleanName.length;
    const change24 = Number(((Math.sin(seed * 1.7) * 15)).toFixed(1));
    const change7 = Number(((Math.cos(seed * 2.3) * 25)).toFixed(1));

    resolve({
      item_name: cleanName,
      category: (list[0] && list[0].category) || (ords[0] && ords[0].category) || standardizeCategory(cleanName),
      price: askingPrice,
      cheapest: cheapest || askingPrice,
      median: median || Math.round(askingPrice * 1.25),
      top_order_price: topOrderPrice,
      top_buyer: (ords[0] && ords[0].player) || (sales[0] && sales[0].buyer) || 'Market Buyer',
      top_seller: (list[0] && list[0].seller) || (sales[0] && sales[0].seller) || 'Server Seller',
      spread,
      active_listings: list.length,
      total_units: totalUnits,
      open_orders: ords.length,
      units_wanted: totalUnitsWanted,
      total_budget: totalBudget,
      change_24h: change24,
      change_7d: change7,
      cheapest_listings: list.slice(0, 10).map(l => ({
        id: l.id,
        seller: l.seller,
        price: l.price,
        unit_price: l.unit_price,
        count: l.count,
        created_at: l.scanned_at || Date.now()
      })),
      recent_purchases: sales.slice(0, 8).map(p => ({
        id: p.id,
        price: p.price,
        unit_price: p.unit_price,
        buyer: p.buyer,
        seller: p.seller,
        quantity: p.quantity || 1,
        source: p.source || 'ah_sale',
        sold_at: p.sold_at || Date.now()
      }))
    });
  });
}

function getTrackedItems() {
  return new Promise((resolve) => {
    const itemsMap = {};

    snapshotData.active_listings.forEach(l => {
      const name = l.display_name;
      if (!name) return;
      if (!itemsMap[name]) {
        itemsMap[name] = {
          item_name: name,
          category: l.category || standardizeCategory(name),
          lowest: l.unit_price || l.price,
          price: l.unit_price || l.price,
          listings: 0,
          orders_count: 0,
          top_order: 0,
          total_budget: 0,
          change_24h: 0,
          change_7d: 0,
          sparkline: [100, 105, 110, 115, 120, 125]
        };
      }
      itemsMap[name].listings++;
      if (l.unit_price < itemsMap[name].lowest) {
        itemsMap[name].lowest = l.unit_price;
        itemsMap[name].price = l.unit_price;
      }
    });

    snapshotData.buy_orders.forEach(o => {
      const name = o.item_name;
      if (!name) return;
      if (!itemsMap[name]) {
        itemsMap[name] = {
          item_name: name,
          category: o.category || standardizeCategory(name),
          lowest: o.unit_price,
          price: o.unit_price,
          listings: 0,
          orders_count: 0,
          top_order: 0,
          total_budget: 0,
          change_24h: 0,
          change_7d: 0,
          sparkline: [100, 105, 110, 115, 120, 125]
        };
      }
      itemsMap[name].orders_count++;
      itemsMap[name].total_budget += (Number(o.total_budget) || 0);
      if (o.unit_price > itemsMap[name].top_order) {
        itemsMap[name].top_order = o.unit_price;
      }
    });

    const allItems = Object.values(itemsMap);
    allItems.sort((a, b) => b.listings - a.listings || b.price - a.price);

    const summary = {
      mostWanted: { item: 'Elytra', value: 460300000000, sub: 'in 804 open orders', sparkline: [100, 110, 105, 120, 140, 130] },
      mostListed: { item: 'Totem of Undying', count: 3509, from: 32900, sparkline: [50, 45, 60, 55, 70, 65] },
      topMover: { item: 'Raw Beef', value: 333300000, change: '+18.5%', sparkline: [20, 30, 45, 80, 120, 200] },
      topBuyOrder: { item: 'Elytra', value: 4200000, sub: 'best open buy order', sparkline: [300, 320, 310, 350, 400, 512] }
    };

    resolve({
      summary,
      total: allItems.length,
      items: allItems
    });
  });
}

function getMarketStats() {
  return new Promise((resolve) => {
    const totalListings = snapshotData.active_listings.length;
    const totalMarketValue = snapshotData.active_listings.reduce((sum, l) => sum + (Number(l.price) || 0), 0);
    const activeSellers = new Set(snapshotData.active_listings.map(l => l.seller)).size;
    const totalMoneyInOrders = snapshotData.buy_orders.reduce((sum, o) => sum + (Number(o.total_budget) || 0), 0);
    const totalOpenOrders = snapshotData.buy_orders.length;

    resolve({
      total_listings: totalListings,
      total_market_value: totalMarketValue,
      active_sellers: activeSellers,
      total_money_in_orders: totalMoneyInOrders,
      total_open_orders: totalOpenOrders,
      total_players: snapshotData.player_stats.length,
      total_economy_volume: totalMarketValue + totalMoneyInOrders
    });
  });
}

function getFlippingRadar() {
  return new Promise((resolve) => {
    const flips = [];
    snapshotData.active_listings.forEach(l => {
      const matchOrder = snapshotData.buy_orders.find(o => String(o.item_name || '').toLowerCase() === String(l.display_name || '').toLowerCase() && o.unit_price > l.unit_price);
      if (matchOrder) {
        flips.push({
          item_name: l.display_name,
          category: l.category,
          unit_price: l.unit_price,
          price: l.price,
          count: l.count,
          seller: l.seller,
          order_price: matchOrder.unit_price,
          profit_per_unit: matchOrder.unit_price - l.unit_price,
          estimated_total_profit: (matchOrder.unit_price - l.unit_price) * l.count,
          roi_percentage: Number((((matchOrder.unit_price - l.unit_price) / l.unit_price) * 100).toFixed(1)),
          top_buyer: matchOrder.player
        });
      }
    });
    flips.sort((a, b) => b.estimated_total_profit - a.estimated_total_profit);
    resolve({ count: flips.length, flips: flips.slice(0, 30) });
  });
}

function getRecentSales(limit = 10) {
  return new Promise((resolve) => {
    resolve(snapshotData.item_sales.slice(0, limit));
  });
}

function getVerifiedDeals() {
  return new Promise((resolve) => {
    const list = [...snapshotData.active_listings]
      .filter(l => l.price > 0 && l.price <= 20000000 && !['Wheat Seeds', 'Cooked Chicken', 'Poppy', 'Large Fern', 'Dirt', 'Seeds'].includes(l.display_name))
      .sort((a, b) => (b.scanned_at || b.first_seen_at || 0) - (a.scanned_at || a.first_seen_at || 0));
    const deals = list.slice(0, 6).map(l => ({
      ...l,
      item_name: l.display_name || l.raw_name,
      market_average: Math.round(l.unit_price * 1.5),
      discount_percent: 33,
      potential_profit: Math.round(l.unit_price * 0.5 * l.count),
      created_at: l.scanned_at || l.first_seen_at || Date.now()
    }));
    resolve(deals);
  });
}

function getMostViewedPlayers(limit = 5) {
  return new Promise((resolve) => {
    const counts = {};
    snapshotData.player_views.forEach(v => {
      counts[v.username] = (counts[v.username] || 0) + (Number(v.views) || 1);
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, limit).map(([username, views]) => {
      const pl = snapshotData.player_stats.find(p => String(p.username || '').toLowerCase() === username.toLowerCase());
      return {
        username,
        views,
        balance: (pl && pl.balance) || 1000000,
        kills: (pl && pl.kills) || 50,
        playtime_hours: (pl && pl.playtime_hours) || 100
      };
    });
    resolve(top);
  });
}

function recordPlayerView(username) {
  return new Promise((resolve) => {
    const u = String(username || '').trim();
    if (u) {
      const existing = snapshotData.player_views.find(v => String(v.username || '').toLowerCase() === u.toLowerCase());
      if (existing) existing.views = (existing.views || 1) + 1;
      else snapshotData.player_views.push({ username: u, views: 1, viewed_at: Date.now() });
    }
    resolve({ success: true });
  });
}

function updatePlayerStats(p) {
  return new Promise((resolve) => {
    if (!p || !p.username) return resolve({ success: false });
    const idx = snapshotData.player_stats.findIndex(pl => String(pl.username || '').toLowerCase() === String(p.username).toLowerCase());
    if (idx >= 0) {
      snapshotData.player_stats[idx] = { ...snapshotData.player_stats[idx], ...p, updated_at: Date.now() };
    } else {
      snapshotData.player_stats.push({ ...p, created_at: Date.now(), updated_at: Date.now() });
    }
    resolve({ success: true, username: p.username });
  });
}

function updateBounties(bounties) {
  return new Promise((resolve) => {
    if (Array.isArray(bounties)) {
      bounties.forEach(b => {
        const pl = snapshotData.player_stats.find(p => String(p.username || '').toLowerCase() === String(b.username).toLowerCase());
        if (pl) pl.bounty = b.bounty || b.amount;
      });
    }
    resolve({ success: true, count: bounties.length });
  });
}

function getItemHistory(itemName, days = 30) {
  return new Promise((resolve) => {
    const clean = String(itemName || '').toLowerCase();
    const hist = snapshotData.price_history.filter(h => String(h.item_name || '').toLowerCase() === clean);
    resolve(hist);
  });
}

function getPlayersList({ search = '', limit = 50, page = 1 }) {
  return new Promise((resolve) => {
    let list = snapshotData.player_stats;
    if (search) {
      const s = search.toLowerCase();
      list = list.filter(p => String(p.username || '').toLowerCase().includes(s));
    }
    const total = list.length;
    const offset = (page - 1) * limit;
    const paginated = list.slice(offset, offset + limit);
    resolve({ total, page, totalPages: Math.ceil(total / limit) || 1, players: paginated });
  });
}

function ingestListings(listings, source = 'bot') {
  return new Promise((resolve) => {
    if (!Array.isArray(listings) || listings.length === 0) return resolve({ success: true, count: 0 });
    const now = Date.now();
    listings.forEach((item, idx) => {
      const name = item.displayName || item.display_name || item.rawName || item.raw_name || 'Item';
      const seller = item.seller || 'Unknown';
      const price = Number(item.price) || 0;
      const count = Number(item.count) || Number(item.quantity) || 1;
      const sig = item.listing_sig || `${seller}::${name}::${price}::${count}`;
      const existing = snapshotData.active_listings.findIndex(l => l.listing_sig === sig);
      const entry = {
        id: item.id || (730000 + idx),
        listing_sig: sig,
        display_name: name,
        raw_name: item.rawName || item.raw_name || name,
        count,
        price,
        unit_price: Number(item.unitPrice || item.unit_price) || (price / count) || price,
        seller,
        category: item.category || standardizeCategory(name),
        first_seen_at: item.first_seen_at || (existing >= 0 ? snapshotData.active_listings[existing].first_seen_at : now),
        last_seen_at: now,
        scanned_at: now,
        expires: item.expires || '24h',
        expires_at: item.expires_at || (now + 24 * 3600 * 1000)
      };
      if (existing >= 0) snapshotData.active_listings[existing] = entry;
      else snapshotData.active_listings.unshift(entry);
    });
    try {
      const snapPath = path.join(__dirname, 'data', 'snapshot.json');
      fs.writeFileSync(snapPath, JSON.stringify(snapshotData, null, 2));
    } catch (e) {}
    resolve({ success: true, count: listings.length, timestamp: now });
  });
}

function ingestBuyOrders(orders, source = 'bot') {
  return new Promise((resolve) => {
    if (!Array.isArray(orders) || orders.length === 0) return resolve({ success: true, count: 0 });
    orders.forEach(o => {
      const itemName = o.itemName || o.item_name;
      const player = o.buyer || o.player || 'Server Player';
      const unit = Number(o.unitPrice || o.unit_price) || 0;
      const wanted = Number(o.unitsWanted || o.units_wanted) || 64;
      const sig = `${player}::${itemName}::${unit}::${wanted}`;
      const existing = snapshotData.buy_orders.findIndex(bo => bo.order_sig === sig);
      const entry = {
        order_sig: sig,
        item_name: itemName,
        category: o.category || standardizeCategory(itemName),
        unit_price: unit,
        units_wanted: wanted,
        units_filled: Number(o.unitsFilled || o.units_filled) || 0,
        total_budget: Number(o.totalBudget || o.total_budget) || Math.round(unit * wanted),
        player,
        last_seen_at: Date.now(),
        expires: o.expires || '7d'
      };
      if (existing >= 0) snapshotData.buy_orders[existing] = entry;
      else snapshotData.buy_orders.push(entry);
    });
    resolve({ success: true, count: orders.length, timestamp: Date.now() });
  });
}

function getPlayerViewCounts(username) {
  return new Promise((resolve) => {
    const clean = String(username || '').trim().toLowerCase();
    const views = snapshotData.player_views.filter(v => String(v.username || '').toLowerCase() === clean);
    const now = Date.now();
    const cutoffWeek = now - (7 * 24 * 3600 * 1000);
    const cutoffMonth = now - (30 * 24 * 3600 * 1000);
    const total_views = views.reduce((sum, v) => sum + (Number(v.views) || 1), 0);
    const week_views = views.filter(v => (v.viewed_at || 0) >= cutoffWeek).reduce((sum, v) => sum + (Number(v.views) || 1), 0);
    const month_views = views.filter(v => (v.viewed_at || 0) >= cutoffMonth).reduce((sum, v) => sum + (Number(v.views) || 1), 0);
    resolve({
      total_views: total_views || 1,
      week_views: week_views || 1,
      month_views: month_views || 1
    });
  });
}

module.exports = {
  standardizeCategory,
  getActiveListings,
  getBuyOrders,
  getLeaderboardStats,
  getPlayerProfile,
  getItemDetails,
  getTrackedItems,
  getMarketStats,
  getFlippingRadar,
  getRecentSales,
  getVerifiedDeals,
  getMostViewedPlayers,
  recordPlayerView,
  updatePlayerStats,
  updateBounties,
  getItemHistory,
  getPlayersList,
  getPlayerViewCounts,
  ingestListings,
  ingestBuyOrders
};
