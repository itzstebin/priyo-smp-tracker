/**
 * loreParser.js
 * Extracts economy details (price, seller, unit price, expiration, enchants)
 * from Minecraft Auction House item lores and NBT on Priyo SMP.
 */

function stripColorCodes(text) {
  if (!text) return '';
  return text.replace(/[§&][0-9a-fk-or]/gi, '').trim();
}

function parsePrice(text) {
  if (!text) return null;
  const clean = stripColorCodes(text).replace(/,/g, '');
  
  // Format matches: ₹1.5M, $1.5M, 800K, ₹100,000, 50k, 1.2Cr, etc.
  const crMatch = clean.match(/[₹$]?\s*([\d.]+)\s*(?:cr|crore)\b/i);
  if (crMatch) return parseFloat(crMatch[1]) * 10_000_000;

  const lMatch = clean.match(/[₹$]?\s*([\d.]+)\s*(?:l|lakh)\b/i);
  if (lMatch) return parseFloat(lMatch[1]) * 100_000;

  const bMatch = clean.match(/[₹$]?\s*([\d.]+)\s*[bB]\b/);
  if (bMatch) return parseFloat(bMatch[1]) * 1_000_000_000;

  const mMatch = clean.match(/[₹$]?\s*([\d.]+)\s*[mM]\b/);
  if (mMatch) return parseFloat(mMatch[1]) * 1_000_000;

  const kMatch = clean.match(/[₹$]?\s*([\d.]+)\s*[kK]\b/);
  if (kMatch) return parseFloat(kMatch[1]) * 1_000;

  const numMatch = clean.match(/(?:price|cost|buy)?\s*:?\s*[₹$]?\s*([\d]+(?:\.\d+)?)/i);
  if (numMatch) return parseFloat(numMatch[1]);

  return null;
}

function parseItemLore(rawItem) {
  if (!rawItem) return null;

  let itemName = rawItem.displayName || rawItem.name || 'Unknown Item';
  if (rawItem.customName) {
    try {
      const parsed = JSON.parse(rawItem.customName);
      const text = (parsed.extra ? parsed.extra.map(e => e.text).join('') : (parsed.text || '')).replace(/§[0-9a-fk-or]/gi, '').trim();
      if (text) itemName = text;
    } catch {
      const text = String(rawItem.customName).replace(/§[0-9a-fk-or]/gi, '').trim();
      if (text) itemName = text;
    }
  } else if (rawItem.nbt && rawItem.nbt.value && rawItem.nbt.value.display && rawItem.nbt.value.display.value.Name) {
    try {
      const rawNameVal = rawItem.nbt.value.display.value.Name.value;
      const parsed = JSON.parse(rawNameVal);
      const text = (parsed.extra ? parsed.extra.map(e => e.text).join('') : (parsed.text || '')).replace(/§[0-9a-fk-or]/gi, '').trim();
      if (text) itemName = text;
    } catch {
      const text = stripColorCodes(rawItem.nbt.value.display.value.Name.value);
      if (text) itemName = text;
    }
  }

  const count = rawItem.count || 1;
  const loreLines = [];

  if (rawItem.nbt && rawItem.nbt.value && rawItem.nbt.value.display && rawItem.nbt.value.display.value.Lore) {
    const rawLore = rawItem.nbt.value.display.value.Lore.value.value;
    if (Array.isArray(rawLore)) {
      rawLore.forEach(line => {
        try {
          const parsed = JSON.parse(line);
          loreLines.push(extractTextFromComponent(parsed).trim());
        } catch {
          loreLines.push(stripColorCodes(line));
        }
      });
    }
  } else if (rawItem.lore && Array.isArray(rawItem.lore)) {
    rawItem.lore.forEach(l => loreLines.push(stripColorCodes(l)));
  }

  // Reject bounties and GUI navigation items
  const fullLoreText = loreLines.join(' ').toLowerCase();
  if (fullLoreText.includes('bounty:') || fullLoreText.includes('bounty') || fullLoreText.includes('click to collect') || fullLoreText.includes('holds liquids')) {
    return null;
  }

  let price = null;
  let seller = null;
  let expires = null;
  let isBin = true;
  const enchants = [];

  for (const line of loreLines) {
    const lower = line.toLowerCase();

    // Price detection
    if (lower.includes('price:') || lower.includes('cost:') || lower.includes('₹') || lower.includes('$') || lower.includes('buy for:')) {
      const extracted = parsePrice(line);
      if (extracted !== null && (price === null || lower.includes('price:'))) {
        price = extracted;
      }
    }

    // Seller detection (supports Bedrock players with '.' prefix from Geyser/Floodgate)
    const sellerMatch = line.match(/(?:seller|sold by|player|owner|by)\s*:?\s*([\.a-zA-Z0-9_*]{2,20})/i);
    if (sellerMatch) {
      seller = sellerMatch[1];
    }

    // Expiration detection
    const expireMatch = line.match(/(?:expires in|ends in|time left|time)\s*:?\s*(.+)/i);
    if (expireMatch) {
      expires = expireMatch[1].trim();
    }

    // Auction vs BIN
    if (lower.includes('starting bid') || lower.includes('top bid') || lower.includes('bid:')) {
      isBin = false;
    }

    // Enchants (ensure it is an enchantment line, not a seller or price line)
    if (!lower.includes('seller') && !lower.includes('price') && !lower.includes('cost') && !lower.includes('bid') && !lower.includes('expires') && !lower.includes('click')) {
      if (line.match(/\b(sharpness|unbreaking|protection|efficiency|mending|fortune|looting|power|flame|infinity|silk touch|thorns|feather falling|respiration|aqua affinity|depth strider|frost walker|soul speed|swift sneak|sweeping edge|knockback|fire aspect|punch|multishot|piercing|quick charge|impaling|riptide|loyalty|channeling)\b/i)) {
        enchants.push(line);
      }
    }
  }

  // A genuine auction listing in PriyoSMP MUST have a valid seller and price > 0
  if (!seller || seller === 'Unknown' || price === null || price <= 0) {
    return null;
  }

  const unitPrice = count > 0 ? Math.round((price / count) * 100) / 100 : price;
  const category = categorizeItem(rawItem.name || itemName);

  return {
    rawName: rawItem.name,
    displayName: stripColorCodes(itemName),
    count,
    price,
    unitPrice,
    seller,
    expires: expires || 'Active',
    isBin,
    enchants,
    category,
    lore: loreLines
  };
}

/**
 * Parses buy orders from /order (ORDERS GUI) on Priyo SMP
 */
function parseBuyOrderLore(rawItem) {
  if (!rawItem) return null;

  const rawDisplayName = rawItem.displayName || rawItem.name || 'Unknown Item';
  const itemName = stripColorCodes(rawDisplayName);
  const loreLines = [];

  if (rawItem.nbt && rawItem.nbt.value && rawItem.nbt.value.display && rawItem.nbt.value.display.value.Lore) {
    const rawLore = rawItem.nbt.value.display.value.Lore.value.value;
    if (Array.isArray(rawLore)) {
      rawLore.forEach(line => {
        try {
          const parsed = JSON.parse(line);
          loreLines.push(extractTextFromComponent(parsed).trim());
        } catch {
          loreLines.push(stripColorCodes(line));
        }
      });
    }
  } else if (rawItem.lore && Array.isArray(rawItem.lore)) {
    rawItem.lore.forEach(l => loreLines.push(stripColorCodes(l)));
  }

  let unitPrice = null;
  let buyer = 'Unknown';
  let unitsWanted = rawItem.count || 64;
  let unitsFilled = 0;
  let totalBudget = null;
  let expires = null;
  const enchants = [];

  for (const line of loreLines) {
    const lower = line.toLowerCase();

    // Buyer player detection (Priyo SMP format: "Click to deliver <player> <item>")
    const buyerDeliverMatch = line.match(/click to deliver\s+([^\s]+)/i);
    if (buyerDeliverMatch && (buyer === 'Unknown' || buyer === 'Server Player')) {
      buyer = buyerDeliverMatch[1].replace(/[^a-zA-Z0-9_.*]/g, '');
    } else {
      const buyerMatch = line.match(/(?:buyer|ordered by|by|order by|owner)\s*:?\s*([\.a-zA-Z0-9_*]{2,20})/i);
      if (buyerMatch && (buyer === 'Unknown' || buyer === 'Server Player')) {
        buyer = buyerMatch[1];
      }
    }

    // Unit price detection (Priyo SMP format: "₹500 each", "₹5.00K each")
    if (lower.includes('each') || lower.includes('paying') || lower.includes('unit price') || lower.includes('price/item') || lower.includes('price:')) {
      const p = parsePrice(line);
      if (p !== null) unitPrice = p;
    }

    // Progress and units detection (Priyo SMP format: "5/15 Delivered", "0/400 Delivered")
    const progMatch = line.match(/(\d+)\s*\/\s*(\d+)\s*(?:delivered|filled|progress)?/i);
    if (progMatch) {
      unitsFilled = parseInt(progMatch[1]);
      unitsWanted = parseInt(progMatch[2]);
    } else {
      const wantedMatch = line.match(/(?:wanted|amount|quantity|target)\s*:?\s*(\d+)/i);
      if (wantedMatch) unitsWanted = parseInt(wantedMatch[1]);
      const deliveredMatch = line.match(/(?:delivered|filled|completed)\s*:?\s*(\d+)/i);
      if (deliveredMatch) unitsFilled = parseInt(deliveredMatch[1]);
    }

    // Total budget detection (Priyo SMP format: "₹2.50K/₹7.50K Paid")
    const paidMatch = line.match(/([₹$]?[\d.]+[kKmMbB]?)\s*\/\s*([₹$]?[\d.]+[kKmMbB]?)\s*paid/i);
    if (paidMatch) {
      const b = parsePrice(paidMatch[2]);
      if (b !== null) totalBudget = b;
    } else if (lower.includes('total') || lower.includes('budget')) {
      const b = parsePrice(line);
      if (b !== null) totalBudget = b;
    }

    // Expiration detection ("6d 17h 0m Until Order expires")
    const expireMatch = line.match(/(.+?)\s*until order expires/i);
    if (expireMatch) {
      expires = expireMatch[1].trim();
    }

    // Enchants on order item
    if (line.match(/(sharpness|unbreaking|protection|efficiency|mending|fortune|looting|power|flame|infinity|silk touch|thorns|wind burst|breach|density)\b/i)) {
      enchants.push(line);
    }
  }

  // Fallback price extraction
  if (unitPrice === null) {
    for (const line of loreLines) {
      const p = parsePrice(line);
      if (p !== null) {
        unitPrice = p;
        break;
      }
    }
  }

  // A valid buy order MUST have a detected unit price and not be a UI button
  const rawName = (rawItem.name || '').toLowerCase();
  if (rawName.includes('button') || rawName.includes('barrier') || rawName.includes('stained_glass') || rawName === 'book_and_quill') {
    return null;
  }

  if (unitPrice === null || unitPrice <= 0) {
    return null;
  }

  if (!totalBudget) {
    totalBudget = Math.round(unitPrice * unitsWanted);
  }

  const category = categorizeItem(rawItem.name || itemName);

  return {
    rawName: rawItem.name,
    itemName,
    category,
    unitPrice,
    unitsWanted,
    unitsFilled,
    totalBudget,
    buyer: buyer || 'Server Player',
    expires: expires || 'Active',
    enchants: enchants || [],
    lore: loreLines
  };
}

function extractTextFromComponent(comp) {
  if (!comp) return '';
  if (typeof comp === 'string') return comp.replace(/[§&][0-9a-fk-or]/gi, '');
  let res = comp.text || '';
  if (comp.extra && Array.isArray(comp.extra)) {
    res += comp.extra.map(extractTextFromComponent).join('');
  }
  return res.replace(/[§&][0-9a-fk-or]/gi, '');
}

function categorizeItem(name) {
  const n = (name || '').toLowerCase();
  
  if (n.includes('sword') || (n.includes('axe') && !n.includes('pickaxe')) || n.includes('bow') || 
      n.includes('crossbow') || n.includes('trident') || n.includes('mace') || n.includes('helmet') || 
      n.includes('chestplate') || n.includes('leggings') || n.includes('boots') || n.includes('shield') || 
      n.includes('arrow')) {
    return 'Combat';
  }

  if (n.includes('netherite') || n.includes('diamond') || n.includes('emerald') || 
      n.includes('ancient debris') || n.includes('debris') || n.includes('totem') || 
      n.includes('beacon') || n.includes('nether star') || n.includes('dragon egg') || 
      n.includes('elytra') || n.includes('shulker') || n.includes('gold ingot') || 
      n.includes('gold block') || n.includes('iron block') || n.includes('blackstone')) {
    return 'Valuables';
  }

  if (n.includes('pickaxe') || n.includes('shovel') || n.includes('hoe') || 
      n.includes('fishing_rod') || n.includes('shears') || n.includes('flint and steel')) {
    return 'Tools';
  }

  if (n.includes('bone') || n.includes('gunpowder') || n.includes('pearl') || 
      n.includes('rotten flesh') || n.includes('string') || n.includes('spider eye') || 
      n.includes('blaze rod') || n.includes('slime') || n.includes('ghast tear') || 
      n.includes('skull') || n.includes('feather') || n.includes('leather')) {
    return 'Mob drops';
  }

  if (n.includes('book') || n.includes('potion') || n.includes('bottle o') || n.includes('enchant')) {
    return 'Potions and books';
  }

  if (n.includes('apple') || n.includes('carrot') || n.includes('potato') || 
      n.includes('beef') || n.includes('pork') || n.includes('mutton') || 
      n.includes('chicken') || n.includes('bread') || n.includes('cod') || 
      n.includes('salmon') || n.includes('cookie') || n.includes('cake') || 
      n.includes('pie') || n.includes('wheat') || n.includes('melon')) {
    return 'Food';
  }

  if (n.includes('log') || n.includes('wood') || n.includes('plank') || 
      n.includes('stone') || n.includes('cobble') || n.includes('deepslate') || 
      n.includes('sponge') || n.includes('froglight') || n.includes('obsidian') || 
      n.includes('glass') || n.includes('terracotta') || n.includes('concrete') || 
      n.includes('wool') || n.includes('dirt') || n.includes('sand') || 
      n.includes('gravel') || n.includes('brick') || n.includes('plant') || n.includes('flower')) {
    return 'Blocks';
  }

  return 'Other';
}

module.exports = {
  stripColorCodes,
  parsePrice,
  parseItemLore,
  parseBuyOrderLore,
  categorizeItem
};
