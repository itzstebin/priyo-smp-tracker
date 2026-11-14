import re

with open(r'c:\Users\Stebin_S\Downloads\DonutSMP Flips_ Best Items to Flip for Profit _ DonutStats.html', 'r', encoding='utf-8') as f:
    text = f.read()

slugs = set(re.findall(r'href=["\'](?:https://donutstats\.io)?/prices/([^"\'\?#]+)["\']', text))
print('Found item slugs in HTML:', len(slugs))
print(sorted(list(slugs))[:30])

with open(r'C:\Users\Stebin_S\.gemini\antigravity\scratch\priyo-smp-tracker\all_slugs.txt', 'w') as out:
    for s in sorted(list(slugs)):
        out.write(s + '\n')
