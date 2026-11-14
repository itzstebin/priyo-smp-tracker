import re

with open(r'c:\Users\Stebin_S\Downloads\DonutSMP Flips_ Best Items to Flip for Profit _ DonutStats.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Look for image sources or static asset urls
imgs = re.findall(r'<img[^>]+src=["\']([^"\']+)["\']', text)
print('Total img srcs found:', len(imgs))
for s in imgs[:25]:
    print(s)

# Also look for any /static/ or /items/ or .png in the file
pngs = set(re.findall(r'/[^"\'\s]+\.png', text))
print('Unique png paths found:', len(pngs))
for p in list(pngs)[:25]:
    print(p)
