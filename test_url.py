import urllib.request

urls = [
    'https://donutstats.io/items/amethyst_shard.png',
    'https://donutstats.io/amethyst_shard.png',
    'https://donutstats.io/items/anvil.png',
    'https://donutstats.io/anvil.png',
    'https://donutstats.io/items/diamond.png',
    'https://donutstats.io/diamond.png'
]

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

for u in urls:
    try:
        req = urllib.request.Request(u, headers=headers)
        with urllib.request.urlopen(req, timeout=5) as res:
            data = res.read()
            print(f'{u} -> {res.status} ({res.headers.get("content-type")}, {len(data)} bytes)')
    except Exception as e:
        print(f'{u} -> {e}')
