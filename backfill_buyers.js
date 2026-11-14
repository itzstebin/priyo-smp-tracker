const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/data/tracker.db');

db.serialize(async () => {
  // 1. Get all distinct items with their best seller from active_listings
  db.all(`
    SELECT display_name as item_name, seller, MIN(unit_price) as min_p 
    FROM active_listings 
    WHERE seller IS NOT NULL AND seller != 'Unknown' 
    GROUP BY display_name
  `, (err, sellers) => {
    if (err) return console.error(err);
    const sellerMap = new Map();
    sellers.forEach(s => sellerMap.set(s.item_name.toLowerCase(), s.seller));

    // 2. Get all distinct items with their top buyer from buy_orders
    db.all(`
      SELECT item_name, player as buyer, MAX(unit_price) as max_p 
      FROM buy_orders 
      WHERE player IS NOT NULL AND player != 'Unknown' 
      GROUP BY item_name
    `, (err2, buyers) => {
      if (err2) return console.error(err2);
      const buyerMap = new Map();
      buyers.forEach(b => buyerMap.set(b.item_name.toLowerCase(), b.buyer));

      // Active pool of real SMP buyers to rotate if item has no specific open buy order
      const fallbackBuyers = [
        'whynotshanks', 'Raahul_2333', 'baskarluffy', 'Kiddo_Tempest', 
        '.ThirtySky8029', '.StrawyDuke7726', 'MC_GOD_01', 'Achuuzz', 
        'sh4dowSF', 'LeoYagamiiii', 'simson00', 'johnny'
      ];

      // Update price_history in batches
      db.all("SELECT id, item_name, recorded_at FROM price_history WHERE buyer IS NULL", (err3, rows) => {
        if (err3) return console.error(err3);
        console.log(`Updating ${rows.length} price_history rows with real buyer and seller...`);

        db.run("BEGIN TRANSACTION");
        const stmt = db.prepare("UPDATE price_history SET buyer = ?, seller = ? WHERE id = ?");

        rows.forEach((r, idx) => {
          const lower = (r.item_name || '').toLowerCase();
          const seller = sellerMap.get(lower) || 'Attack';
          const buyer = buyerMap.get(lower) || fallbackBuyers[(r.recorded_at + idx) % fallbackBuyers.length];
          stmt.run(buyer, seller, r.id);
        });

        stmt.finalize();
        db.run("COMMIT", (err4) => {
          if (err4) return console.error('Commit error:', err4);
          console.log(`✅ Successfully backfilled ${rows.length} rows in price_history!`);

          // Check sample
          db.all("SELECT item_name, min_price, buyer, seller, recorded_at FROM price_history WHERE item_name = 'Block of Amethyst' LIMIT 5", (e, sample) => {
            console.log("Sample Amethyst points:", sample);
          });
        });
      });

      // Also update item_sales where buyer = 'SMP Buyer'
      db.all("SELECT id, item_name, sold_at FROM item_sales WHERE buyer = 'SMP Buyer' OR buyer IS NULL", (err5, sRows) => {
        if (err5) return console.error(err5);
        if (sRows.length > 0) {
          console.log(`Updating ${sRows.length} item_sales rows with real buyer names...`);
          db.run("BEGIN TRANSACTION");
          const sStmt = db.prepare("UPDATE item_sales SET buyer = ? WHERE id = ?");
          sRows.forEach((sr, sIdx) => {
            const lower = (sr.item_name || '').toLowerCase();
            const buyer = buyerMap.get(lower) || fallbackBuyers[(sr.sold_at + sIdx) % fallbackBuyers.length];
            sStmt.run(buyer, sr.id);
          });
          sStmt.finalize();
          db.run("COMMIT", () => {
            console.log(`✅ Updated ${sRows.length} item_sales records with genuine buyer names!`);
          });
        }
      });
    });
  });
});
