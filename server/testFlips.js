const { db } = require('./db');

function test() {
  db.all(`
    SELECT 
      l.display_name,
      l.category,
      l.unit_price as ah_price,
      l.count as ah_count,
      l.seller,
      o.unit_price as order_price,
      (o.units_wanted - o.units_filled) as order_wanted,
      o.player as buyer
    FROM active_listings l
    JOIN buy_orders o ON l.display_name = o.item_name
    WHERE l.unit_price < o.unit_price
    ORDER BY (o.unit_price - l.unit_price) DESC
  `, (err, rows) => {
    if (err) return console.error('Error:', err);
    console.log(`Found ${rows.length} auction-to-order flip opportunities:`);
    rows.slice(0, 8).forEach(r => {
      const units = Math.min(r.ah_count, r.order_wanted);
      const spend = r.ah_price * units;
      const pay = r.order_price * units;
      const profit = pay - spend;
      const roi = Math.round((profit / spend) * 100);
      console.log(`• ${r.display_name}: Buy at ₹${r.ah_price} on /ah, sell to ${r.buyer} on /order at ₹${r.order_price} -> Profit: +₹${profit} (${roi}% ROI)`);
    });
  });
}

test();
