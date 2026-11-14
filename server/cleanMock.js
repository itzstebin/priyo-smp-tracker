const sqlite3 = require('sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'tracker.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Wipe all mock data
  db.run("DELETE FROM active_listings WHERE seller IN ('VortexTamil', 'Sanjay_Craft', 'ChennaiKing', 'TamilSniper', 'Kavalan99', 'Dhanush_PvP', 'MaduraiBeast', 'Ajith_Raid')");
  db.run("DELETE FROM price_history WHERE recorded_at < 1794451700000");
  db.run("DELETE FROM bot_logs WHERE source = 'web-simulator'");

  db.get("SELECT COUNT(*) as active FROM active_listings", (e, r1) => {
    db.get("SELECT COUNT(*) as history FROM price_history", (e, r2) => {
      console.log(`Cleaned Database: Active Real Listings = ${r1.active}, Price History Checkpoints = ${r2.history}`);
      process.exit(0);
    });
  });
});
