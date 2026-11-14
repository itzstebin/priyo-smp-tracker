import sqlite3
import os
import urllib.request
import time

db_path = r'C:\Users\Stebin_S\.gemini\antigravity\scratch\priyo-smp-tracker\server\data\tracker.db'
assets_dir = r'C:\Users\Stebin_S\.gemini\antigravity\scratch\priyo-smp-tracker\client\donut-assets'
os.makedirs(assets_dir, exist_ok=True)

conn = sqlite3.connect(db_path)
c = conn.cursor()

c.execute('SELECT DISTINCT display_name FROM active_listings')
listings = set(r[0] for r in c.fetchall() if r[0])

c.execute('SELECT DISTINCT item_name FROM buy_orders')
orders = set(r[0] for r in c.fetchall() if r[0])

c.execute('SELECT DISTINCT item_name FROM price_history')
history = set(r[0] for r in c.fetchall() if r[0])

all_items = sorted(list(listings.union(orders).union(history)))
print(f'Total items to check: {len(all_items)}')

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def normalize_name(name):
    # e.g. "Block of Gold" -> "gold_block" or "block_of_gold"
    # "Bottle o' Enchanting" -> "experience_bottle"
    clean = name.lower().strip()
    clean = clean.replace("'", "").replace("&", "and")
    clean = clean.replace(" ", "_").replace("-", "_")
    return clean

name_aliases = {
    'bottle_o_enchanting': ['experience_bottle', 'bottle_o_enchanting'],
    'steak': ['cooked_beef', 'beef'],
    'raw_beef': ['beef', 'raw_beef'],
    'raw_porkchop': ['porkchop'],
    'cooked_porkchop': ['cooked_porkchop'],
    'totem_of_undying': ['totem_of_undying', 'totem'],
    'enchanted_golden_apple': ['enchanted_golden_apple', 'golden_apple'],
    'smithing_template': ['netherite_upgrade_smithing_template', 'smithing_template'],
    'netherite_upgrade': ['netherite_upgrade_smithing_template', 'smithing_template'],
    'sculk_catalyst': ['sculk_catalyst'],
    'sculk_sensor': ['sculk_sensor'],
    'sculk_shrieker': ['sculk_shrieker'],
    'recovery_compass': ['recovery_compass', 'compass'],
    'music_disc': ['music_disc_otherside', 'music_disc_5', 'music_disc_pigstep', 'music_disc_cat'],
}

downloaded_count = 0
already_have_count = 0
failed_items = []

for item in all_items:
    clean = normalize_name(item)
    target_file = os.path.join(assets_dir, f'{clean}.png')
    
    if os.path.exists(target_file) and os.path.getsize(target_file) > 100:
        already_have_count += 1
        continue

    # Try variants
    variants = [clean]
    # Check if starts with "block_of_" -> e.g. "block_of_gold" -> "gold_block"
    if clean.startswith('block_of_'):
        variants.append(clean.replace('block_of_', '') + '_block')
    if clean.endswith('_block') and not clean.startswith('block_of_'):
        variants.append('block_of_' + clean.replace('_block', ''))
    
    if clean in name_aliases:
        variants.extend(name_aliases[clean])

    success = False
    for v in variants:
        v_url = f'https://donutstats.io/items/{v}.png'
        try:
            req = urllib.request.Request(v_url, headers=headers)
            with urllib.request.urlopen(req, timeout=4) as res:
                if res.status == 200:
                    data = res.read()
                    if len(data) > 80:
                        with open(target_file, 'wb') as f:
                            f.write(data)
                        print(f'[SUCCESS] Downloaded: {item} -> {clean}.png ({len(data)} bytes) from {v}.png')
                        downloaded_count += 1
                        success = True
                        break
        except Exception:
            pass
        time.sleep(0.05)
    
    if not success:
        failed_items.append((item, clean))

print(f'\nDone! Downloaded: {downloaded_count}, Already existed: {already_have_count}, Failed/Missing: {len(failed_items)}')
if failed_items:
    print('Sample missing items:', failed_items[:15])
