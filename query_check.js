const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./server/data/tracker.db');

const query = `
  SELECT 
    l.id,
    l.display_name,
    l.category,
    l.unit_price,
    l.count,
    l.seller,
    agg.avg_unit_price,
    agg.listings_count
  FROM active_listings l
  JOIN (
    SELECT display_name, AVG(unit_price) as avg_unit_price, COUNT(*) as listings_count
    FROM active_listings
    WHERE unit_price < 15000000
    GROUP BY display_name
    HAVING COUNT(*) >= 2
  ) agg ON l.display_name = agg.display_name
  WHERE l.unit_price <= (agg.avg_unit_price * 0.72) 
    AND (agg.avg_unit_price - l.unit_price) >= 1000
    AND l.unit_price < 15000000
  ORDER BY (agg.avg_unit_price - l.unit_price) DESC
  LIMIT 15
`;

db.all(query, [], (err, rows) => {
  console.log('Filtered Snipes:', rows);
});
