const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, 'server', 'data', 'tracker.db'));

const blacklist = [
  'player', 'head', 'skeleton', 'item', 'stone', 'deepslate', 'redstone comparator',
  'enchanted book', 'totem of undying', 'obsidian', 'spruce sapling', 'diamond sword',
  'diamond pickaxe', 'ender pearl', 'steak', 'barrier', 'glass pane'
];

db.serialize(() => {
  const placeholders = blacklist.map(() => '?').join(',');
  db.run(`DELETE FROM player_stats WHERE LOWER(username) IN (${placeholders})`, blacklist, function(err) {
    if (err) console.error(err);
    else console.log('Cleaned up junk rows:', this.changes);
  });

  db.get('SELECT * FROM player_stats WHERE username = "achuuzz"', (err, lower) => {
    if (lower) {
      db.run(
        'UPDATE player_stats SET balance = ?, shards = ?, kills = ?, deaths = ?, playtime_hours = ?, blocks_placed = ?, blocks_broken = ?, mob_kills = ?, sell_earned = ? WHERE username = "Achuuzz"',
        [lower.balance, lower.shards, lower.kills, lower.deaths, lower.playtime_hours, lower.blocks_placed, lower.blocks_broken, lower.mob_kills, lower.sell_earned],
        () => {
          db.run('DELETE FROM player_stats WHERE username = "achuuzz"', () => {
            console.log('Successfully merged achuuzz into Achuuzz!');
          });
        }
      );
    }
  });
});
