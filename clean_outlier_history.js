const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'server', 'data', 'tracker.db'));

const commonJunk = ['Dirt', 'Steak', 'Wheat Seeds', 'Cooked Chicken', 'Poppy', 'Large Fern', 'Grass Block', 'Seeds', 'Oak Sapling', 'Cobbled Deepslate'];

db.serialize(() => {
  // 1. Create item_sales table
  db.run(`
    CREATE TABLE IF NOT EXISTS item_sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      item_name TEXT,
      category TEXT,
      price REAL,
      unit_price REAL,
      quantity INTEGER DEFAULT 1,
      seller TEXT,
      buyer TEXT,
      source TEXT DEFAULT 'ah_sale',
      sold_at INTEGER
    )
  `);
  db.run(`CREATE INDEX IF NOT EXISTS idx_item_sales_name ON item_sales(item_name)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_item_sales_time ON item_sales(sold_at)`);

  // 2. Insert verified initial completed sales
  const now = Date.now();
  const initialSales = [
    ['Enchanted Book', 'Potions and books', 4900, 4900, 1, 'llzJK67', 'whynotshanks', 'ah_sale', now - 180000],
    ['Enchanted Book', 'Potions and books', 5000, 5000, 1, 'Attack', 'Raahul_2333', 'order_fill', now - 360000],
    ['TNT', 'Other', 150000, 2343.75, 64, 'R21J', 'Achuuzz', 'ah_sale', now - 540000],
    ['Diamond Leggings', 'Combat', 270000, 270000, 1, 'shashi', 'Slowbag', 'ah_sale', now - 720000],
    ['Golden Horse Armor', 'Combat', 100000, 100000, 1, 'balaji_008', 'macalo', 'ah_sale', now - 1100000],
    ['Diamond Pickaxe', 'Tools', 300000, 300000, 1, 'StrawyDuke7726', 'JoshzGaming', 'ah_sale', now - 1500000],
    ['Gilded Blackstone', 'Blocks', 5000000, 312500, 16, 'soulblade_be', 'zainspeed', 'ah_sale', now - 2200000],
    ['Smithing Template', 'Other', 109700, 109700, 1, 'MK13111703', 'Priyoo', 'ah_sale', now - 3100000],
    ['Bone Block', 'Mob drops', 59000, 921.88, 64, 'JS_WOLF4307', 'blacknova006', 'ah_sale', now - 4200000],
    ['Blaze Rod', 'Other', 800000, 12500, 64, 'Selvam2442', 'LeoYagamiiii', 'ah_sale', now - 5500000]
  ];

  const salesStmt = db.prepare(`
    INSERT INTO item_sales (item_name, category, price, unit_price, quantity, seller, buyer, source, sold_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  initialSales.forEach(s => salesStmt.run(s));
  salesStmt.finalize();

  // 3. Fix corrupted price_history rows where avg_price was inflated by troll listings
  db.run(`
    UPDATE price_history 
    SET avg_price = min_price,
        max_price = CASE WHEN max_price > min_price * 3 THEN min_price * 1.5 ELSE max_price END
    WHERE avg_price > min_price * 4 AND min_price > 0
  `, function(err) {
    if (err) console.error(err);
    else console.log('Normalized inflated price_history rows:', this.changes);
  });

  // 4. Delete 1B meme rows from price_history for basic blocks/food
  const placeholders = commonJunk.map(() => '?').join(',');
  db.run(`
    DELETE FROM price_history 
    WHERE item_name IN (${placeholders}) AND min_price > 50000000
  `, commonJunk, function(err) {
    if (err) console.error(err);
    else console.log('Purged troll price_history rows:', this.changes);
  });

  console.log('Cleanup and item_sales table initialization complete!');
});
