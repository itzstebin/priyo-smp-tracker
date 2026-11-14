import sqlite3, os

conn = sqlite3.connect(r'C:\Users\Stebin_S\.gemini\antigravity\scratch\priyo-smp-tracker\server\data\tracker.db')
c = conn.cursor()

c.execute('SELECT DISTINCT display_name FROM active_listings')
listings = set(r[0] for r in c.fetchall() if r[0])

c.execute('SELECT DISTINCT item_name FROM buy_orders')
orders = set(r[0] for r in c.fetchall() if r[0])

all_items = sorted(list(listings.union(orders)))

assets_dir = r'C:\Users\Stebin_S\.gemini\antigravity\scratch\priyo-smp-tracker\client\donut-assets'
existing_files = set(f.lower() for f in os.listdir(assets_dir))

missing = []
for item in all_items:
    clean = item.lower().replace(' ', '_').replace('-', '_').replace("'", '')
    candidates = [
        clean + '.png',
        clean + '.webp',
        clean.replace('block_of_', '') + '_block.png',
        clean.replace('_block', '') + '.png'
    ]
    found = any(cand in existing_files for cand in candidates)
    if not found:
        missing.append((item, clean))

print(f'Total items in DB: {len(all_items)}')
print(f'Matched items: {len(all_items) - len(missing)}')
print(f'Missing items: {len(missing)}')
for m in missing:
    print('Missing:', m)
