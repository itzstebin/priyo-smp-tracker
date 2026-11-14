import urllib.request, os

assets_dir = r'C:\Users\Stebin_S\.gemini\antigravity\scratch\priyo-smp-tracker\client\donut-assets'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

mappings = {
    'block_of_lapis_lazuli.png': ['lapis_block.png', 'block_of_lapis_lazuli.png'],
    'lapis_lazuli_block.png': ['lapis_block.png'],
    'bucket_of_cod.png': ['cod_bucket.png', 'bucket_of_cod.png'],
    'bucket_of_tropical_fish.png': ['tropical_fish_bucket.png', 'bucket_of_tropical_fish.png'],
    'deepslate_lapis_lazuli_ore.png': ['deepslate_lapis_ore.png', 'deepslate_lapis_lazuli_ore.png'],
    'minecart_with_chest.png': ['chest_minecart.png'],
    'minecart_with_tnt.png': ['tnt_minecart.png'],
    'nether_quartz.png': ['quartz.png'],
    'redstone_dust.png': ['redstone.png'],
    'torch.png': ['torch.png'],
    'trial_key.png': ['trial_key.png'],
    'trident.png': ['trident.png'],
    'verdant_froglight.png': ['verdant_froglight.png'],
    'vines.png': ['vine.png', 'vines.png'],
    'waxed_oxidized_copper.png': ['waxed_oxidized_copper.png'],
    'wheat.png': ['wheat.png'],
    'wheat_seeds.png': ['wheat_seeds.png', 'seeds.png'],
    'white_banner.png': ['white_banner.png'],
    'white_concrete.png': ['white_concrete.png'],
    'white_dye.png': ['white_dye.png'],
    'wither_rose.png': ['wither_rose.png'],
    'wooden_axe.png': ['wooden_axe.png'],
    'yellow_dye.png': ['yellow_dye.png'],
    'steak.png': ['cooked_beef.png', 'beef.png'],
    'smithing_template.png': ['netherite_upgrade_smithing_template.png', 'smithing_template.png'],
}

for target_name, sources in mappings.items():
    dest = os.path.join(assets_dir, target_name)
    if os.path.exists(dest) and os.path.getsize(dest) > 100:
        continue

    # Try copying from existing file if in sources
    copied = False
    for s in sources:
        src_path = os.path.join(assets_dir, s)
        if os.path.exists(src_path) and os.path.getsize(src_path) > 100:
            with open(src_path, 'rb') as f_in, open(dest, 'wb') as f_out:
                f_out.write(f_in.read())
            print(f'Copied local {s} -> {target_name}')
            copied = True
            break
    
    if copied:
        continue

    # Try donutstats.io
    for s in sources:
        url = f'https://donutstats.io/items/{s}'
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=4) as res:
                if res.status == 200:
                    data = res.read()
                    if len(data) > 80:
                        with open(dest, 'wb') as f:
                            f.write(data)
                        print(f'Downloaded from donutstats: {s} -> {target_name}')
                        copied = True
                        break
        except Exception:
            pass

print('Done fixing specific item images!')
