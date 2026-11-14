with open('parsed_main.html', 'r', encoding='utf-8') as f:
    text = f.read()

import re
pattern = r'<div class="relative grid grid-cols-\[minmax\(0,1fr\)_auto\][\s\S]*?(?=<div class="relative grid grid-cols-\[minmax\(0,1fr\)_auto\]|<footer|</section)'
rows = re.findall(pattern, text)
print('Total rows found in parsed_main.html:', len(rows))
if rows:
    print('Row 1:\n', rows[0])
    if len(rows) > 1:
        print('\nRow 2:\n', rows[1])
