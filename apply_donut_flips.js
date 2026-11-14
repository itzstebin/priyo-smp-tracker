const fs = require('fs');
const path = 'C:/Users/Stebin_S/.gemini/antigravity/scratch/priyo-smp-tracker/client/app.js';
let content = fs.readFileSync(path, 'utf8');

// Replacement for flips functions in app.js
const flipsCode = `// --------------------------------------------------------------------------
// 14. VIEW: FLIPS & ARBITRAGE (/flips - Exact 1:1 DonutStats Format)
// --------------------------------------------------------------------------
async function loadFlips() {
  try {
    const res = await fetch('/v1/flips');
    const data = await res.json();
    const flips = data.flips || [];
    state.cachedFlips = flips;

    const elTotal = document.getElementById('flips-stat-total');
    const elProfit = document.getElementById('flips-stat-profit');
    const elDirect = document.getElementById('flips-stat-direct');
    const elCraft = document.getElementById('flips-stat-craft');

    const totalFlips = data.flipsRightNow !== undefined ? data.flipsRightNow : flips.length;
    const totalProfit = data.profitOnTable !== undefined ? data.profitOnTable : flips.reduce((sum, f) => sum + (f.profit || 0), 0);
    const directCount = flips.filter(f => f.type === 'Auction').length;
    const craftAndSnipeCount = flips.filter(f => f.type === 'Craft' || f.type === 'Snipe').length;

    if (elTotal) elTotal.textContent = formatRawNumber(totalFlips);
    if (elProfit) elProfit.textContent = formatPrice(totalProfit);
    if (elDirect) elDirect.textContent = formatRawNumber(directCount);
    if (elCraft) elCraft.textContent = formatRawNumber(craftAndSnipeCount);

    renderFlipsTable(flips);
  } catch (err) {
    console.error('Failed to load flips:', err);
  }
}

function handleFlipsSearch(query) {
  state.flipsSearch = (query || '').trim().toLowerCase();
  renderFlipsTable(state.cachedFlips);
}

function setFlipsKind(kind) {
  state.flipsKind = kind;
  const kinds = ['all', 'direct', 'snipe', 'craft'];
  kinds.forEach(k => {
    const btn = document.getElementById(\`flip-kind-\${k}\`);
    if (!btn) return;
    if (k === kind) {
      btn.className = 'flip-kind-btn inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-colors duration-150 h-8 px-3 text-xs bg-fg text-bg';
    } else {
      btn.className = 'flip-kind-btn inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full font-medium whitespace-nowrap transition-colors duration-150 h-8 px-3 text-xs text-muted hover:text-fg';
    }
  });
  renderFlipsTable(state.cachedFlips);
}

function toggleFlipsSortMenu() {
  const menu = document.getElementById('flips-sort-dropdown');
  if (menu) menu.classList.toggle('hidden');
}

function setFlipsSort(sortKey) {
  state.flipsSort = sortKey;
  const label = document.getElementById('flips-sort-selected');
  if (label) {
    if (sortKey === 'profit') label.textContent = 'Most profit';
    else if (sortKey === 'roi') label.textContent = 'Highest margin (ROI)';
    else if (sortKey === 'spend') label.textContent = 'Lowest spend';
  }
  const menu = document.getElementById('flips-sort-dropdown');
  if (menu) menu.classList.add('hidden');
  renderFlipsTable(state.cachedFlips);
}

// Close sort menu on click outside
document.addEventListener('click', (e) => {
  const toggle = document.getElementById('flips-sort-toggle');
  const menu = document.getElementById('flips-sort-dropdown');
  if (menu && !menu.classList.contains('hidden')) {
    if (toggle && !toggle.contains(e.target) && !menu.contains(e.target)) {
      menu.classList.add('hidden');
    }
  }
});

function renderFlipsTable(flips) {
  const container = document.getElementById('flips-table-body');
  if (!container) return;

  const list = flips || state.cachedFlips || [];
  let filtered = [...list];

  // 1. Filter by Kind
  if (state.flipsKind === 'direct') {
    filtered = filtered.filter(f => f.type === 'Auction');
  } else if (state.flipsKind === 'snipe') {
    filtered = filtered.filter(f => f.type === 'Snipe');
  } else if (state.flipsKind === 'craft') {
    filtered = filtered.filter(f => f.type === 'Craft');
  }

  // 2. Filter by Search Query
  if (state.flipsSearch) {
    const q = state.flipsSearch;
    filtered = filtered.filter(f => {
      const name = (f.item_name || f.item || '').toLowerCase();
      const how = (f.how || '').toLowerCase();
      const seller = (f.seller || '').toLowerCase();
      return name.includes(q) || how.includes(q) || seller.includes(q);
    });
  }

  // 3. Sort
  if (state.flipsSort === 'profit') {
    filtered.sort((a, b) => (b.profit || 0) - (a.profit || 0));
  } else if (state.flipsSort === 'roi') {
    filtered.sort((a, b) => (b.roi || 0) - (a.roi || 0));
  } else if (state.flipsSort === 'spend') {
    filtered.sort((a, b) => (a.youSpend || a.buy_price || 0) - (b.youSpend || b.buy_price || 0));
  }

  const countLabel = document.getElementById('flips-count-label');
  if (countLabel) countLabel.textContent = \`\${filtered.length} flips\`;

  if (filtered.length === 0) {
    container.innerHTML = \`<div class="p-12 text-center text-subtle text-sm">No flips found matching your filters.</div>\`;
    return;
  }

  container.innerHTML = filtered.map(f => {
    const itemName = f.item_name || f.item || 'Item';
    const isCraft = f.type === 'Craft';
    const isAuction = f.type === 'Auction';
    const badgeText = isCraft ? 'Craft' : (isAuction ? 'Direct' : 'Snipe');
    const category = f.category || (isCraft ? 'Crafting' : (itemName.toLowerCase().includes('armor') || itemName.toLowerCase().includes('sword') || itemName.toLowerCase().includes('axe') ? 'Combat' : 'Valuables'));

    const buyPrice = f.buy_price || f.youSpend || 50000;
    const sellPrice = f.sell_price || f.ordersPay || 100000;
    const youSpend = f.youSpend || Math.round(buyPrice * (f.count || 1));
    const ordersPay = f.ordersPay || Math.round(sellPrice * (f.count || 1));
    const profit = f.profit || (ordersPay - youSpend);
    const roi = f.roi !== undefined ? f.roi : Math.round((profit / Math.max(1, youSpend)) * 100);

    const listingsCountText = f.listingsCount ? \`\${f.listingsCount} listings\` : '1 listing';
    const ordersCountText = f.ordersCount ? \`\${f.count || 1} units to \${f.ordersCount} orders\` : \`\${f.count || 1} units\`;

    // Format "How" column matching DonutStats 1:1
    let howMarkup = '';
    if (isCraft) {
      // Craft flip: [icon] count Material at ₹Price -> makes X, Y times
      let matName = 'Diamond Block';
      let multiplier = 9;
      if (itemName.toLowerCase().includes('diamond')) { matName = 'Diamond Block'; multiplier = 9; }
      else if (itemName.toLowerCase().includes('paper')) { matName = 'Sugar Cane'; multiplier = 3; }
      else if (itemName.toLowerCase().includes('bone meal')) { matName = 'Bone'; multiplier = 3; }
      else if (itemName.toLowerCase().includes('netherite')) { matName = 'Ancient Debris'; multiplier = 1; }
      else if (itemName.toLowerCase().includes('emerald')) { matName = 'Emerald Block'; multiplier = 9; }
      else if (itemName.toLowerCase().includes('gold')) { matName = 'Gold Block'; multiplier = 9; }

      const matUnitCost = Math.round(buyPrice * multiplier);
      const times = f.count || 1;

      howMarkup = \`
        <ul class="flex flex-wrap items-center gap-1.5 text-[13px]">
          <li class="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-2 py-0.5 pr-2.5 pl-1 text-fg dark:bg-white/8" title="\${escapeHtml(matName)}">
            <span class="relative inline-flex shrink-0" aria-hidden="true" style="width: 20px; height: 20px;">
              <img alt="" width="20" height="20" class="size-full pixelated" src="\${getItemTextureUrl(matName)}" onerror="this.onerror=null;this.src='/donut-assets/chest.png'">
            </span>
            <span class="font-medium tabular-nums">\${Math.max(1, Math.round(times / multiplier))}</span>
            <span class="max-w-28 truncate text-muted">\${escapeHtml(matName)}</span>
            <span class="text-subtle tabular-nums">\${formatPrice(matUnitCost)}</span>
          </li>
          <li aria-hidden="true" class="text-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right size-3.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </li>
          <li class="text-muted tabular-nums">makes \${multiplier}, \${times} times</li>
        </ul>
      \`;
    } else if (isAuction) {
      // Direct flip: /ah ask ₹X -> /orders pay ₹Y
      howMarkup = \`
        <ul class="flex flex-wrap items-center gap-1.5 text-[13px]">
          <li class="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-2 py-0.5 pr-2.5 pl-1.5 text-fg dark:bg-white/8">
            <span class="text-subtle">/ah ask</span>
            <span class="font-medium tabular-nums ml-1">\${formatPrice(buyPrice)}</span>
          </li>
          <li aria-hidden="true" class="text-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right size-3.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </li>
          <li class="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-2 py-0.5 pr-2.5 pl-1.5 text-fg dark:bg-white/8">
            <span class="text-subtle">/orders pay</span>
            <span class="font-medium text-emerald-400 tabular-nums ml-1">\${formatPrice(sellPrice)}</span>
          </li>
        </ul>
      \`;
    } else {
      // Snipe flip: by Seller ₹X -> Market median ₹Y
      howMarkup = \`
        <ul class="flex flex-wrap items-center gap-1.5 text-[13px]">
          <li class="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-2 py-0.5 pr-2.5 pl-1.5 text-fg dark:bg-white/8">
            <span class="text-subtle">by \${escapeHtml(f.seller || 'seller')}</span>
            <span class="font-medium tabular-nums ml-1">\${formatPrice(buyPrice)}</span>
          </li>
          <li aria-hidden="true" class="text-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right size-3.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </li>
          <li class="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-2 py-0.5 pr-2.5 pl-1.5 text-fg dark:bg-white/8">
            <span class="text-subtle">Market median</span>
            <span class="font-medium text-emerald-400 tabular-nums ml-1">\${formatPrice(sellPrice)}</span>
          </li>
        </ul>
      \`;
    }

    return \`
      <div class="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2.5 px-4 py-3 transition-colors duration-150 hover:bg-surface-2 sm:px-5 lg:grid-cols-[minmax(11rem,1.1fr)_minmax(14rem,1.6fr)_7.5rem_8.5rem_8rem] lg:gap-x-6 cursor-pointer group" onclick="openPriceDetail('\${escapeHtml(itemName)}')">
        <!-- 1. Item Column -->
        <span class="flex min-w-0 items-center gap-3">
          <span class="inline-flex shrink-0 items-center justify-center rounded-[28%] bg-surface-2 ring-1 ring-line ring-inset dark:bg-white/14 dark:ring-white/8" style="width: 36px; height: 36px;">
            <span class="relative inline-flex shrink-0" aria-hidden="true" style="width: 22px; height: 22px;">
              <img alt="\${escapeHtml(itemName)}" loading="lazy" width="22" height="22" decoding="async" class="size-full pixelated" src="\${getItemTextureUrl(itemName)}" onerror="this.onerror=null;this.src='/donut-assets/chest.png'" style="color: transparent;">
            </span>
          </span>
          <span class="min-w-0">
            <a class="block truncate text-sm font-medium text-fg outline-none group-hover:underline" href="javascript:void(0)" onclick="openPriceDetail('\${escapeHtml(itemName)}')">\${escapeHtml(itemName)}</a>
            <span class="mt-0.5 flex min-w-0 items-center gap-1.5">
              <span class="inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap bg-fg text-bg h-5 px-2 text-[11px]">\${badgeText}</span>
              <span class="truncate text-xs text-subtle">\${escapeHtml(category)}</span>
            </span>
          </span>
        </span>

        <!-- 2. Mobile Profit (hidden on desktop) -->
        <span class="col-start-2 row-start-1 text-right lg:hidden">
          <span class="block text-display text-lg leading-none text-success">+₹\${(profit >= 1000 ? formatPrice(profit).replace('₹','') : profit.toLocaleString())}</span>
          <span class="mt-1 block text-xs text-subtle tabular-nums">\${roi}% margin</span>
        </span>

        <!-- 3. How Column -->
        <div class="col-span-2 min-w-0 lg:col-span-1">
          \${howMarkup}
        </div>

        <!-- 4 & 5. Spend & Pay Columns -->
        <div class="col-span-2 grid grid-cols-2 gap-3 text-[13px] lg:contents">
          <span class="min-w-0 lg:text-right">
            <span class="block font-medium text-fg tabular-nums">\${formatPrice(youSpend)}</span>
            <span class="block truncate text-xs text-subtle tabular-nums">\${listingsCountText}</span>
          </span>
          <span class="min-w-0 text-right">
            <span class="block font-medium text-fg tabular-nums">\${formatPrice(ordersPay)}</span>
            <span class="block truncate text-xs text-subtle tabular-nums">\${ordersCountText}</span>
          </span>
        </div>

        <!-- 6. Profit Column (desktop) -->
        <span class="hidden text-right lg:block">
          <span class="block text-display text-xl leading-none text-success">+₹\${(profit >= 1000 ? formatPrice(profit).replace('₹','') : profit.toLocaleString())}</span>
          <span class="mt-1 block text-xs text-subtle tabular-nums">\${roi}% · <time>just now</time></span>
        </span>
      </div>
    \`;
  }).join('');
}
`;

// Locate start of Section 14
const flipsHeader = '// 14. VIEW: FLIPS';
const flipsStart = content.indexOf(flipsHeader);
const calcHeader = '// 15. VIEW: SKELETON SPAWNER CALCULATOR';
const calcStart = content.indexOf(calcHeader);

if (flipsStart !== -1 && calcStart !== -1) {
  content = content.slice(0, flipsStart) + flipsCode + '\n// --------------------------------------------------------------------------\n' + content.slice(calcStart);
  fs.writeFileSync(path, content, 'utf8');
  console.log('Successfully updated flips logic in app.js');
} else {
  console.error('Could not find flips section boundaries', { flipsStart, calcStart });
}
