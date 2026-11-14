const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('C:/Users/Stebin_S/.gemini/antigravity/scratch/priyo-smp-tracker/server/data/tracker.db');

const q = `
  SELECT 
    l.id,
    l.display_name,
    l.unit_price,
    l.count,
    l.seller,
    agg.median_price,
    agg.listings_count
  FROM active_listings l
  JOIN (
    SELECT display_name, AVG(unit_price) as median_price, COUNT(*) as listings_count
    FROM active_listings
    WHERE unit_price < 5000000 AND price < 20000000
    GROUP BY display_name
    HAVING COUNT(*) >= 2
  ) agg ON l.display_name = agg.display_name
  WHERE l.unit_price < 5000000
    AND l.unit_price <= (agg.median_price * 0.75) 
    AND (agg.median_price - l.unit_price) >= 1500
  ORDER BY (agg.median_price - l.unit_price) * l.count DESC
  LIMIT 10
`;

db.all(q, [], (err, rows) => {
  if (err) console.error(err);
  else {
    const cleaned = rows.map(r => {
      const fairPrice = Math.min(Math.round(r.median_price), Math.round(r.unit_price * 3.5));
      const youSpend = Math.round(r.unit_price * r.count);
      const ordersPay = Math.round(fairPrice * r.count);
      const profit = ordersPay - youSpend;
      const roi = Math.round(((fairPrice - r.unit_price) / r.unit_price) * 100);
      return {
        item: r.display_name,
        seller: r.seller,
        count: r.count,
        unit_price: r.unit_price,
        fair_resell_price: fairPrice,
        profit,
        roi: `+${roi}%`
      };
    });
    console.log(JSON.stringify(cleaned, null, 2));
  }
  db.close();
});
