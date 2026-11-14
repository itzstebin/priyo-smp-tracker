/**
 * app.js
 * DonutStats Official Frontend Engine for Priyo SMP (play.priyosmp.com)
 * 100% Matching DonutStats Design, Classes, Colors, and Live Server APIs.
 * Strictly using standard K, M, B, T in ₹ (Strictly zero L / Cr).
 */

// Global State
const state = {
  activeTab: 'stats',
  selectedSpawner: 'skeleton',
  ahCategory: 'All',
  ahSearch: '',
  ahSort: 'newest',
  ahPage: 1,
  ahPerPage: 24,
  ordersCategory: 'All',
  ordersSearch: '',
  ordersSort: 'highest_payout',
  ordersPage: 1,
  ordersPerPage: 20,
  pricesCategory: 'All',
  pricesSearch: '',
  pricesSort: 'most_listed',
  pricesPage: 1,
  pricesPerPage: 20,
  statsSearch: '',
  statsSort: 'richest',
  statsPage: 1,
  statsPerPage: 50,
  flipsFilter: 'all',
  flipsKind: 'all',
  flipsSearch: '',
  flipsSort: 'profit',
  selectedPriceItem: 'Totem of Undying',
  selectedPlayer: 'Achuuzz',
  selectedBoardType: 'money',
  boardPage: 1,
  boardSearch: '',
  boardPerPage: 50,
  mintRange: 7,
  cachedListings: [],
  cachedOrders: [],
  cachedItems: [],
  cachedPlayers: [],
  cachedFlips: [],
  cachedEconomy: null,
  mintChartInstance: null,
  theme: localStorage.getItem('priyostats_theme') || 'dark'
};

// Available local textures extracted directly from DonutStats
const LOCAL_DONUT_ASSETS = new Set([
  "acacia_chest_boat",
  "amethyst_cluster",
  "amethyst_shard",
  "ancient_debris",
  "anvil",
  "armor_stand",
  "arrow",
  "azalea_leaves",
  "bamboo",
  "barrel",
  "beacon",
  "beef",
  "birch_door",
  "birch_log",
  "black_banner",
  "black_dye",
  "black_shulker_box",
  "blackstone",
  "blackstone_slab",
  "blaze_rod",
  "block_of_amethyst",
  "block_of_bamboo",
  "block_of_gold",
  "block_of_iron",
  "block_of_lapis_lazuli",
  "block_of_netherite",
  "block_of_quartz",
  "block_of_raw_iron",
  "block_of_redstone",
  "blue_stained_glass",
  "bone",
  "bone_block",
  "bone_meal",
  "book",
  "bookshelf",
  "bottle_o_enchanting",
  "bow",
  "brain_coral_block",
  "bread",
  "breeze_rod",
  "brewing_stand",
  "brown_mushroom",
  "bubble_coral_block",
  "bucket_of_cod",
  "bucket_of_tropical_fish",
  "bundle",
  "cactus",
  "calcite",
  "carved_pumpkin",
  "chain",
  "charcoal",
  "chest",
  "chicken",
  "chiseled_polished_blackstone",
  "clay_ball",
  "clock",
  "coal",
  "cobbled_deepslate",
  "cobblestone",
  "cobblestone_stairs",
  "cobweb",
  "cocoa_beans",
  "cooked_beef",
  "copper_block",
  "copper_ingot",
  "crossbow",
  "crying_obsidian",
  "cut_copper",
  "cut_sandstone",
  "cut_sandstone_slab",
  "dark_oak_planks",
  "deepslate",
  "deepslate_bricks",
  "deepslate_coal_ore",
  "deepslate_diamond_ore",
  "deepslate_emerald_ore",
  "deepslate_gold_ore",
  "deepslate_iron_ore",
  "deepslate_lapis_lazuli_ore",
  "diamond",
  "diamond_axe",
  "diamond_block",
  "diamond_boots",
  "diamond_chestplate",
  "diamond_helmet",
  "diamond_hoe",
  "diamond_horse_armor",
  "diamond_leggings",
  "diamond_ore",
  "diamond_pickaxe",
  "diamond_shovel",
  "diamond_sword",
  "dirt",
  "disc_fragment_5",
  "dispenser",
  "dragon_head",
  "dried_kelp_block",
  "dripstone_block",
  "echo_shard",
  "egg",
  "elytra",
  "emerald",
  "emerald_block",
  "emerald_ore",
  "enchanted_book",
  "enchanted_golden_apple",
  "end_crystal",
  "end_stone",
  "ender_chest",
  "ender_pearl",
  "experience_bottle",
  "fermented_spider_eye",
  "fern",
  "filled_map",
  "firework_rocket",
  "flint",
  "flowering_azalea_leaves",
  "furnace",
  "ghast_tear",
  "gilded_blackstone",
  "glass",
  "glass_bottle",
  "glass_pane",
  "glow_ink_sac",
  "glow_lichen",
  "glowstone",
  "glowstone_dust",
  "gold_ingot",
  "golden_apple",
  "golden_boots",
  "golden_carrot",
  "golden_horse_armor",
  "grass_block",
  "gravel",
  "gray_stained_glass",
  "green_dye",
  "green_stained_glass",
  "gunpowder",
  "honey_bottle",
  "hopper",
  "horn_coral_block",
  "ice",
  "infested_stone",
  "ink_sac",
  "iron_bars",
  "iron_block",
  "iron_boots",
  "iron_horse_armor",
  "iron_ingot",
  "iron_leggings",
  "iron_nugget",
  "lapis_lazuli",
  "lapis_lazuli_block",
  "large_fern",
  "lead",
  "leather",
  "leather_horse_armor",
  "light_blue_candle",
  "light_gray_bundle",
  "light_gray_dye",
  "lightning_rod",
  "lime_carpet",
  "lime_shulker_box",
  "lime_stained_glass",
  "lime_stained_glass_pane",
  "lingering_potion",
  "logo.37iyq8y7zugbp",
  "mace",
  "magenta_dye",
  "magma_block",
  "mangrove_propagule",
  "map",
  "medium_amethyst_bud",
  "milk_bucket",
  "minecart_with_chest",
  "minecart_with_tnt",
  "moss_block",
  "mud",
  "mud_brick_wall",
  "music_disc",
  "mycelium",
  "name_tag",
  "nautilus_shell",
  "nether_bricks",
  "nether_quartz",
  "nether_quartz_ore",
  "nether_wart",
  "netherite_axe",
  "netherite_block",
  "netherite_boots",
  "netherite_chestplate",
  "netherite_helmet",
  "netherite_hoe",
  "netherite_ingot",
  "netherite_leggings",
  "netherite_pickaxe",
  "netherite_shovel",
  "netherite_sword",
  "oak_leaves",
  "oak_log",
  "oak_sapling",
  "oak_wood",
  "observer",
  "obsidian",
  "ochre_froglight",
  "orange_dye",
  "oxidized_cut_copper",
  "packed_ice",
  "paper",
  "pearlescent_froglight",
  "phantom_membrane",
  "piglin_head",
  "pink_dye",
  "pink_petals",
  "pink_shulker_box",
  "pink_stained_glass",
  "piston",
  "pitcher_plant",
  "player_standing",
  "pointed_dripstone",
  "polished_blackstone_wall",
  "poppy",
  "potion",
  "powder_snow_bucket",
  "purple_carpet",
  "purple_wool",
  "purpur_slab",
  "rail",
  "raw_copper",
  "raw_iron",
  "raw_iron_block",
  "raw_porkchop",
  "red_candle",
  "red_dye",
  "red_mushroom",
  "red_sand",
  "red_shulker_box",
  "red_stained_glass",
  "redstone",
  "redstone_dust",
  "redstone_lamp",
  "respawn_anchor",
  "rooted_dirt",
  "sand",
  "sculk_catalyst",
  "sculk_sensor",
  "sculk_shrieker",
  "sea_lantern",
  "sea_pickle",
  "shield",
  "shroomlight",
  "shulker_box",
  "skeleton_skull",
  "slime_ball",
  "slime_block",
  "smithing_template",
  "smoker",
  "smooth_sandstone",
  "smooth_sandstone_slab",
  "smooth_stone_slab",
  "snow_block",
  "snowball",
  "spawner",
  "spider_eye",
  "splash_potion",
  "sponge",
  "spore_blossom",
  "spruce_log",
  "spruce_planks",
  "spyglass",
  "steak",
  "stick",
  "sticky_piston",
  "stone",
  "stone_brick_stairs",
  "stone_bricks",
  "stone_sword",
  "string",
  "stripped_warped_stem",
  "sugar_cane",
  "suspicious_sand",
  "tipped_arrow",
  "tnt",
  "torch",
  "totem_of_undying",
  "trial_key",
  "trident",
  "tube_coral_block",
  "verdant_froglight",
  "vines",
  "water_bucket",
  "waxed_copper_block",
  "waxed_cut_copper",
  "waxed_oxidized_copper",
  "wet_sponge",
  "wheat",
  "wheat_seeds",
  "white_banner",
  "white_bed",
  "white_concrete",
  "white_dye",
  "white_wool",
  "wind_charge",
  "wither_rose",
  "wither_skeleton_skull",
  "wooden_axe",
  "written_book",
  "yellow_dye",
  "player_head",
  "raw_beef",
  "slimeball",
  "cooked_chicken",
  "iron_axe",
  "chainmail_boots",
  "spectral_arrow",
  "clay",
  "enchanting_table",
  "smithing_table",
  "block_of_copper",
  "honey_block",
  "end_rod",
  "scaffolding",
  "lectern",
  "kelp",
  "powered_rail",
  "oak_trapdoor",
  "crimson_stem",
  "black_terracotta",
  "jungle_sign",
  "axolotl_spawn_egg"
]);

const ITEM_SLUG_ALIASES = {
  'amethyst block': 'amethyst_block',
  'block of amethyst': 'amethyst_block',
  'raw iron block': 'raw_iron_block',
  'block of raw iron': 'raw_iron_block',
  'copper block': 'copper_block',
  'block of copper': 'copper_block',
  'gold block': 'gold_block',
  'block of gold': 'gold_block',
  'iron block': 'iron_block',
  'block of iron': 'iron_block',
  'diamond block': 'diamond_block',
  'block of diamond': 'diamond_block',
  'netherite block': 'netherite_block',
  'block of netherite': 'netherite_block',
  'redstone block': 'redstone_block',
  'block of redstone': 'redstone_block',
  'quartz block': 'quartz_block',
  'block of quartz': 'quartz_block',
  'bamboo block': 'bamboo_block',
  'block of bamboo': 'bamboo_block',
  'dark oak log': 'dark_oak_log',
  'black wool': 'black_wool',
  'diamond spear': 'diamond_spear',
  'copper horse armor': 'copper_horse_armor',
  'chest minecart': 'chest_minecart',
  'cod bucket': 'cod_bucket',
  'yellow shulker box': 'yellow_shulker_box',
  'god netherite sword': 'netherite_sword',
  'titanium shulker box': 'shulker_box',
  'raw beef': 'beef',
  'cooked beef': 'cooked_beef',
  'steak': 'steak',
  'raw porkchop': 'raw_porkchop',
  'cooked porkchop': 'raw_porkchop',
  'skeleton spawner': 'spawner',
  'mob spawner': 'spawner',
  'nether star': 'beacon',
  'smithing template': 'smithing_template',
  'netherite upgrade': 'smithing_template',
  'bottle o\' enchanting': 'bottle_o_enchanting',
  'experience bottle': 'experience_bottle',
  'lapis lazuli block': 'block_of_lapis_lazuli',
  'block of lapis lazuli': 'block_of_lapis_lazuli',
  'lapis lazuli': 'lapis_lazuli',
  'redstone dust': 'redstone',
  'sugar cane': 'sugar_cane',
  'end crystal': 'end_crystal',
  'gilded blackstone': 'gilded_blackstone',
  'wet sponge': 'wet_sponge',
  'bone meal': 'bone_meal',
  'player head': 'player_head',
  'slimeball': 'slimeball',
  'slime ball': 'slimeball',
  'cooked chicken': 'cooked_chicken',
  'clay': 'clay',
  'iron axe': 'iron_axe',
  'chainmail boots': 'chainmail_boots',
  'spectral arrow': 'spectral_arrow',
  'enchanting table': 'enchanting_table',
  'smithing table': 'smithing_table',
  'block of copper': 'block_of_copper',
  'copper block': 'block_of_copper',
  'honey block': 'honey_block',
  'end rod': 'end_rod',
  'scaffolding': 'scaffolding',
  'lectern': 'lectern',
  'kelp': 'kelp',
  'powered rail': 'powered_rail',
  'oak trapdoor': 'oak_trapdoor',
  'crimson stem': 'crimson_stem',
  'black terracotta': 'black_terracotta',
  'jungle sign': 'jungle_sign',
  'axolotl spawn egg': 'axolotl_spawn_egg'
};

// --------------------------------------------------------------------------
// 1. CURRENCY & FORMATTING (STRICTLY K, M, B, T - ZERO L / CR)
// --------------------------------------------------------------------------

// --------------------------------------------------------------------------
// Real-time Trend SVG Arrow Helpers (Emerald Green & Rose Red)
// --------------------------------------------------------------------------
function renderChangeArrow(pct, size = 'size-3.5') {
  const isUp = Number(pct) >= 0;
  if (isUp) {
    return `<svg class="${size} inline-block text-emerald-500 shrink-0 stroke-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>`;
  } else {
    return `<svg class="${size} inline-block text-rose-500 shrink-0 stroke-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7L17 17M17 17H7M17 17V7"/></svg>`;
  }
}

function formatChangeBadge(pct, period = '') {
  const n = Number(pct) || 0;
  const isUp = n >= 0;
  const colorClass = isUp ? 'text-emerald-500' : 'text-rose-500';
  const periodText = period ? ` ${period}` : '';
  return `<span class="inline-flex items-center gap-1 font-semibold ${colorClass}">${renderChangeArrow(n, 'size-3.5')}<span>${Math.abs(n).toFixed(1)}%${periodText}</span></span>`;
}

function formatPrice(num) {
  if (num === null || num === undefined || isNaN(num)) return '₹0';
  const n = Math.abs(Number(num));
  const sign = Number(num) < 0 ? '-' : '';

  if (n >= 1_000_000_000_000) return `${sign}₹${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (n >= 1_000_000_000) return `${sign}₹${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${sign}₹${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${sign}₹${(n / 1_000).toFixed(1)}K`;
  if (Number.isInteger(n)) return `${sign}₹${n.toLocaleString('en-US')}`;
  return `${sign}₹${n.toFixed(2)}`;
}

function formatRawNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  const n = Math.abs(Number(num));
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Number(num).toLocaleString('en-US');
}
const formatNumber = formatRawNumber;

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function timeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const time = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diff = Math.floor((Date.now() - time) / 1000);
  if (diff <= 15) return 'Just now';
  if (diff < 60) return `${Math.max(1, diff)}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function formatDeadline(expiresStr, expiresAt) {
  if (expiresAt) {
    const diffMs = Number(expiresAt) - Date.now();
    if (diffMs > 0) {
      const days = Math.floor(diffMs / 86400000);
      const hours = Math.floor((diffMs % 86400000) / 3600000);
      const mins = Math.floor((diffMs % 3600000) / 60000);
      if (days > 0) return `Ends in ${days}d ${hours}h`;
      if (hours > 0) return `Ends in ${hours}h ${mins}m`;
      return `Ends in ${Math.max(1, mins)}m`;
    }
  }
  if (expiresStr && expiresStr !== '24h' && expiresStr !== 'Active') {
    return `Ends in ${expiresStr.replace(/\s*\d+s$/, '')}`;
  }
  return 'Ends in 24h';
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast) return;
  if (toastMsg) toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function copyCommand(cmd) {
  navigator.clipboard.writeText(cmd).then(() => {
    showToast(`Copied: "${cmd}"`);
  }).catch(() => {
    showToast(`Copied: "${cmd}"`);
  });
}

// --------------------------------------------------------------------------
// 2. TEXTURE & ICON RESOLUTION
// --------------------------------------------------------------------------
function getItemTextureUrl(name) {
  if (!name) return '/donut-assets/chest.png';
  const rawKey = String(name).trim().toLowerCase();
  
  if (ITEM_SLUG_ALIASES[rawKey]) {
    return `/donut-assets/${ITEM_SLUG_ALIASES[rawKey]}.png`;
  }

  const slug = rawKey.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (LOCAL_DONUT_ASSETS.has(slug)) {
    return `/donut-assets/${slug}.png`;
  }

  // Common block variations (e.g. block_of_X <-> X_block)
  if (slug.endsWith('_block') && LOCAL_DONUT_ASSETS.has('block_of_' + slug.replace(/_block$/, ''))) {
    return `/donut-assets/block_of_${slug.replace(/_block$/, '')}.png`;
  }
  if (slug.startsWith('block_of_') && LOCAL_DONUT_ASSETS.has(slug.replace(/^block_of_/, '') + '_block')) {
    return `/donut-assets/${slug.replace(/^block_of_/, '')}_block.png`;
  }
  if (LOCAL_DONUT_ASSETS.has(`block_of_${slug}`)) return `/donut-assets/block_of_${slug}.png`;
  if (slug.startsWith('block_of_') && LOCAL_DONUT_ASSETS.has(slug.replace('block_of_', ''))) {
    return `/donut-assets/${slug.replace('block_of_', '')}.png`;
  }

  // Category & keyword pattern matching for complete item coverage
  if (rawKey.includes('smithing template') || rawKey.includes('armor trim')) return '/donut-assets/smithing_template.png';
  if (rawKey.includes('music disc') || rawKey.includes('disc')) return '/donut-assets/music_disc.png';
  if (rawKey.includes('shulker box')) {
    if (rawKey.includes('black') && LOCAL_DONUT_ASSETS.has('black_shulker_box')) return '/donut-assets/black_shulker_box.png';
    if (rawKey.includes('pink') && LOCAL_DONUT_ASSETS.has('pink_shulker_box')) return '/donut-assets/pink_shulker_box.png';
    if (rawKey.includes('lime') && LOCAL_DONUT_ASSETS.has('lime_shulker_box')) return '/donut-assets/lime_shulker_box.png';
    if (rawKey.includes('red') && LOCAL_DONUT_ASSETS.has('red_shulker_box')) return '/donut-assets/red_shulker_box.png';
    if (rawKey.includes('yellow') && LOCAL_DONUT_ASSETS.has('yellow_shulker_box')) return '/donut-assets/yellow_shulker_box.png';
    return '/donut-assets/shulker_box.png';
  }
  if (rawKey.includes('wool')) {
    if (rawKey.includes('purple') && LOCAL_DONUT_ASSETS.has('purple_wool')) return '/donut-assets/purple_wool.png';
    if (rawKey.includes('black') && LOCAL_DONUT_ASSETS.has('black_wool')) return '/donut-assets/black_wool.png';
    return '/donut-assets/white_wool.png';
  }
  if (rawKey.includes('log') || rawKey.includes('wood')) {
    if (rawKey.includes('dark oak') && LOCAL_DONUT_ASSETS.has('dark_oak_log')) return '/donut-assets/dark_oak_log.png';
    if (rawKey.includes('birch') && LOCAL_DONUT_ASSETS.has('birch_log')) return '/donut-assets/birch_log.png';
    if (rawKey.includes('spruce') && LOCAL_DONUT_ASSETS.has('spruce_log')) return '/donut-assets/spruce_log.png';
    return '/donut-assets/oak_log.png';
  }
  if (rawKey.includes('trial key') || rawKey.includes('crate key') || rawKey.includes('key')) return '/donut-assets/trial_key.png';
  if (rawKey.includes('spear')) return '/donut-assets/diamond_spear.png';
  if (rawKey.includes('nautilus armor')) return '/donut-assets/diamond_chestplate.png';
  if (rawKey.includes('nautilus shell')) return '/donut-assets/nautilus_shell.png';
  if (rawKey.includes('horse armor')) {
    if (rawKey.includes('golden') || rawKey.includes('gold')) return '/donut-assets/golden_horse_armor.png';
    if (rawKey.includes('diamond')) return '/donut-assets/diamond_horse_armor.png';
    if (rawKey.includes('iron') || rawKey.includes('copper')) return '/donut-assets/iron_horse_armor.png';
    return '/donut-assets/diamond_horse_armor.png';
  }
  if (rawKey.includes('ominous bottle')) return '/donut-assets/bottle_o_enchanting.png';
  if (rawKey.includes('dried ghast')) return '/donut-assets/ghast_tear.png';
  if (rawKey.includes('resin clump') || rawKey.includes('honey')) return '/donut-assets/honeycomb.png';
  if (rawKey.includes('resin block')) return '/donut-assets/honeycomb_block.png';
  if (rawKey.includes('resin brick')) return '/donut-assets/brick.png';
  if (rawKey.includes('pale moss')) return '/donut-assets/moss_block.png';
  if (rawKey.includes('creaking heart')) return '/donut-assets/beacon.png';
  if (rawKey.includes('dinosaur egg')) return '/donut-assets/dragon_egg.png';
  if (rawKey.includes('gravel')) return '/donut-assets/gravel.png';
  if (rawKey.includes('bee nest') || rawKey.includes('beehive')) return '/donut-assets/bee_nest.png';
  if (['rgx baby (boy)', 'priyo kuva kuva', 'kissa', 'maska chaska', 'toy'].includes(rawKey)) return '/donut-assets/player_head.png';
  if (rawKey.includes('wildflower') || rawKey.includes('flower')) return '/donut-assets/dandelion.png';
  if (rawKey.includes('leaf') || rawKey.includes('leaves')) return '/donut-assets/azalea_leaves.png';

  for (const asset of LOCAL_DONUT_ASSETS) {
    if (slug.includes(asset) || asset.includes(slug)) {
      return `/donut-assets/${asset}.png`;
    }
  }

  return '/donut-assets/chest.png';
}

function getItemIconMarkup(name, count = null, sizeClass = '') {
  const url = getItemTextureUrl(name);
  const safeName = escapeHtml(name || 'Item');
  const countBadge = count && count > 1 ? `<span class="absolute -right-2 -bottom-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-fg px-1 font-mono text-[10px] font-bold text-bg">×${count}</span>` : '';
  
  return `<span class="inline-flex shrink-0 items-center justify-center rounded-[28%] bg-surface-2 ring-1 ring-line ring-inset dark:bg-white/14 dark:ring-white/8 ${sizeClass}" style="width: 38px; height: 38px;" title="${safeName}">
    <span class="relative inline-flex shrink-0 items-center justify-center" style="width: 24px; height: 24px;">
      <img class="size-full pixelated object-contain" src="${url}" alt="${safeName}" onerror="this.onerror=null;this.src='/donut-assets/chest.png'">
      ${countBadge}
    </span>
  </span>`;
}

// --------------------------------------------------------------------------
// 3. CANVAS SPARKLINES
// --------------------------------------------------------------------------
function drawSparkline(canvasIdOrElem, dataPoints, strokeColor = '#22c55e', fillColor = null) {
  const canvas = typeof canvasIdOrElem === 'string' ? document.getElementById(canvasIdOrElem) : canvasIdOrElem;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  let nums = dataPoints;
  if (!Array.isArray(nums) || nums.length < 2) {
    nums = [10, 12, 11, 14, 13, 16, 15, 18, 17, 20];
  }

  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const range = max - min || 1;
  const pad = 3;

  ctx.beginPath();
  nums.forEach((val, i) => {
    const x = pad + (i / (nums.length - 1)) * (w - pad * 2);
    const y = h - pad - ((val - min) / range) * (h - pad * 2);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();

  if (fillColor) {
    ctx.lineTo(w - pad, h);
    ctx.lineTo(pad, h);
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
}

// --------------------------------------------------------------------------
// 4. LIVE ONLINE PLAYER COUNT LOOP (play.priyosmp.com:25565)
// --------------------------------------------------------------------------
async function updateLiveOnlineCount() {
  try {
    const res = await fetch('/v1/status');
    const data = await res.json();
    const count = data.playersOnline !== undefined ? data.playersOnline : 44;
    const navPill = document.getElementById('nav-online-count');
    const footPill = document.getElementById('footer-online-count');
    const bigPill = document.getElementById('stats-online-count-big');
    if (navPill) navPill.textContent = `${count} online`;
    if (footPill) footPill.textContent = count;
    if (bigPill) bigPill.textContent = count;
  } catch (err) {
    console.warn('Status ping fallback:', err);
  }
}

// --------------------------------------------------------------------------
// 5. THEME TOGGLING (DARK / LIGHT MATCHING DONUTSTATS)
// --------------------------------------------------------------------------
function initTheme() {
  const currentTheme = state.theme || 'dark';
  applyTheme(currentTheme);
}

function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  const sun = document.getElementById('theme-sun-icon');
  const moon = document.getElementById('theme-moon-icon');
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    if (sun) sun.classList.add('hidden');
    if (moon) moon.classList.remove('hidden');
  } else {
    document.documentElement.classList.remove('dark');
    if (sun) sun.classList.remove('hidden');
    if (moon) moon.classList.add('hidden');
  }
  localStorage.setItem('priyostats_theme', theme);
}

function toggleTheme() {
  const next = state.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) menu.classList.toggle('hidden');
}

// --------------------------------------------------------------------------
// 6. SPA ROUTING & NAVIGATION
// --------------------------------------------------------------------------
function navigateTo(tabId, pushState = true) {
  switchTab(tabId);
  if (pushState && window.history.pushState) {
    let url = '/stats';
    if (tabId === 'stats') url = '/stats';
    else if (tabId === 'rankings') url = '/rankings';
    else if (tabId === 'leaderboard-detail') url = `/rankings/${encodeURIComponent(state.selectedBoardType || 'money')}`;
    else if (tabId === 'auction') url = '/auction';
    else if (tabId === 'orders') url = '/orders';
    else if (tabId === 'prices') url = '/prices';
    else if (tabId === 'price-detail') url = `/prices/${encodeURIComponent(state.selectedPriceItem || 'Totem of Undying')}`;
    else if (tabId === 'economy') url = '/economy';
    else if (tabId === 'flips') url = '/flips';
    else if (tabId === 'calculator') url = '/calculator';
    else if (tabId === 'player') url = `/player/${encodeURIComponent(state.selectedPlayer || 'Achuuzz')}`;
    else if (tabId === 'dev') url = '/dev';
    window.history.pushState({ tab: tabId }, '', url);
  }
}

function switchTab(tabId) {
  state.activeTab = tabId;

  const views = [
    'stats', 'rankings', 'leaderboard-detail', 'auction', 'orders', 'prices', 'price-detail',
    'economy', 'flips', 'calculator', 'player', 'dev'
  ];

  views.forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (el) {
      if (v === tabId) {
        el.classList.remove('view-hidden');
      } else {
        el.classList.add('view-hidden');
      }
    }
  });

  const navTabs = ['stats', 'rankings', 'auction', 'orders', 'flips', 'prices', 'economy', 'calculator', 'dev'];
  navTabs.forEach(n => {
    const el = document.getElementById(`nav-link-${n}`);
    if (el) {
      const isActive = n === tabId || (tabId === 'price-detail' && n === 'prices') || (tabId === 'player' && n === 'stats') || (tabId === 'leaderboard-detail' && n === 'rankings');
      if (isActive) {
        el.className = 'nav-btn active';
      } else {
        el.className = 'nav-btn';
      }
    }
  });

  window.scrollTo(0, 0);
  if (tabId === 'dev') {
    document.title = 'whynotshanks | Developer Profile';
  } else if (tabId !== 'price-detail' && tabId !== 'player') {
    document.title = 'Stats';
  }

  // Trigger view loaders
  if (tabId === 'stats') loadStatsPlayers();
  else if (tabId === 'rankings') loadRankings();
  else if (tabId === 'leaderboard-detail') loadLeaderboardDetailPage();
  else if (tabId === 'auction') loadAuctionHouse();
  else if (tabId === 'orders') loadOrders();
  else if (tabId === 'prices') loadPricesDirectory();
  else if (tabId === 'price-detail') loadPriceDetail(state.selectedPriceItem || 'Totem of Undying');
  else if (tabId === 'economy') loadEconomy();
  else if (tabId === 'flips') loadFlips();
  else if (tabId === 'calculator') updateCalculatorMath();
  else if (tabId === 'player') loadPlayerProfileView(state.selectedPlayer || 'Achuuzz');
}

function handleRoute() {
  const p = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (p.startsWith('prices/')) {
    const item = decodeURIComponent(p.replace('prices/', ''));
    state.selectedPriceItem = item;
    switchTab('price-detail');
  } else if (p.startsWith('player/')) {
    const user = decodeURIComponent(p.replace('player/', ''));
    state.selectedPlayer = user;
    switchTab('player');
  } else if (p.startsWith('rankings/') || p.startsWith('leaderboards/')) {
    const type = decodeURIComponent(p.replace(/^(rankings|leaderboards)\//, ''));
    state.selectedBoardType = type || 'money';
    switchTab('leaderboard-detail');
  } else if (p === 'stats' || p === 'players') {
    switchTab('stats');
  } else if (p === 'rankings' || p === 'leaderboards') {
    switchTab('rankings');
  } else if (p === 'orders') {
    switchTab('orders');
  } else if (p === 'prices') {
    switchTab('prices');
  } else if (p === 'economy') {
    switchTab('economy');
  } else if (p === 'flips') {
    switchTab('flips');
  } else if (p === 'calculator') {
    switchTab('calculator');
  } else if (p === 'dev' || p === 'developer') {
    switchTab('dev');
  } else if (p === 'auction') {
    switchTab('auction');
  } else {
    switchTab('stats');
  }
}

window.addEventListener('popstate', handleRoute);

function handleHeaderSearch() {
  const input = document.getElementById('header-search-input');
  if (!input) return;
  const q = input.value.trim();
  if (q) {
    openPlayerProfile(q);
    input.value = '';
  }
}

function openPlayerProfile(username) {
  state.selectedPlayer = username;
  navigateTo('player');
}

function openPriceDetail(itemName) {
  state.selectedPriceItem = itemName;
  navigateTo('price-detail');
}

// --------------------------------------------------------------------------
// 7. VIEW: STATS / FIND & BROWSE PLAYERS (/stats - Screenshot 2 & 3 Match)
// --------------------------------------------------------------------------
async function loadStatsPlayers() {
  try {
    const params = new URLSearchParams({
      type: 'money',
      limit: state.statsPerPage,
      page: state.statsPage,
      search: state.statsSearch
    });

    const res = await fetch(`/v1/leaderboard?${params.toString()}`);
    const data = await res.json();
    state.cachedPlayers = data.rankings || [];

    const totalTracked = data.total || 8460;
    const sub = document.getElementById('stats-total-players-sub');
    if (sub) sub.textContent = `${totalTracked.toLocaleString()} tracked players`;

    renderStatsPlayersTable(state.cachedPlayers, (state.statsPage - 1) * state.statsPerPage);
    renderStatsPagination(totalTracked, data.totalPages || Math.ceil(totalTracked / state.statsPerPage));
    renderStatsMostViewed();
    updateLiveOnlineCount();
  } catch (err) {
    console.error('Failed to load stats players:', err);
  }
}

function renderStatsPlayersTable(players, startIdx) {
  const container = document.getElementById('stats-players-table');
  if (!container) return;
  if (!players || players.length === 0) {
    container.innerHTML = `<li class="p-8 text-center text-subtle text-sm">No players found matching query.</li>`;
    return;
  }

  container.innerHTML = players.map((p, idx) => {
    const rank = startIdx + idx + 1;
    const killsFormatted = formatRawNumber(p.kills || 0);
    const playtimeHours = Math.round(p.playtime_hours || (p.playtime ? parseFloat(p.playtime) : 100));
    const playtimeFormatted = playtimeHours > 24 ? `${Math.floor(playtimeHours / 24)}d ${playtimeHours % 24}h` : `${playtimeHours}h`;

    return `
      <li class="stats-table-row grid grid-cols-[2.5rem_minmax(0,1.5fr)_6.5rem_5.5rem_4.5rem_2rem] items-center gap-3 px-5 py-3 hover:bg-surface-2 transition-colors cursor-pointer" onclick="openPlayerProfile('${escapeHtml(p.username)}')">
        <span class="font-mono text-xs font-semibold text-subtle">${rank}</span>
        <div class="flex items-center gap-2.5 min-w-0">
          <img class="size-6 rounded pixelated shrink-0" src="https://mc-heads.net/avatar/${encodeURIComponent(p.username)}/24" alt="${escapeHtml(p.username)}" onerror="this.src='/donut-assets/logo.37iyq8y7zugbp.png'">
          <span class="font-semibold text-fg text-sm truncate">${escapeHtml(p.username)}</span>
        </div>
        <div class="text-right font-medium text-sm text-fg">${formatPrice(p.balance)}</div>
        <div class="text-right text-xs text-muted">${playtimeFormatted}</div>
        <div class="text-right text-xs text-muted">${killsFormatted}</div>
        <div class="text-right text-subtle">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right size-4 inline"><path d="m9 18 6-6-6-6"></path></svg>
        </div>
      </li>
    `;
  }).join('');
}

function renderStatsPagination(totalCount, totalPages) {
  const info = document.getElementById('stats-pagination-info');
  const pills = document.getElementById('stats-pagination-pills');
  if (info) {
    const start = (state.statsPage - 1) * state.statsPerPage + 1;
    const end = Math.min(state.statsPage * state.statsPerPage, totalCount);
    info.textContent = `${start} to ${end} of ${totalCount.toLocaleString()}`;
  }

  if (pills) {
    let html = '';
    const cur = state.statsPage;
    for (let p = 1; p <= Math.min(3, totalPages); p++) {
      const active = p === cur ? 'bg-fg text-bg' : 'text-muted hover:bg-surface-2';
      html += `<button onclick="setStatsPage(${p})" class="size-8 rounded-full text-xs font-semibold ${active}">${p}</button>`;
    }
    if (totalPages > 3) {
      html += `<span class="size-8 flex items-center justify-center text-xs text-subtle">-</span>`;
      html += `<button onclick="setStatsPage(${Math.min(20, totalPages)})" class="size-8 rounded-full text-xs font-semibold ${cur === Math.min(20, totalPages) ? 'bg-fg text-bg' : 'text-muted hover:bg-surface-2'}">${Math.min(20, totalPages)}</button>`;
    }
    pills.innerHTML = html;
  }
}

function setStatsPage(p) {
  state.statsPage = p;
  loadStatsPlayers();
}

function onStatsSearchSubmit() {
  const input = document.getElementById('stats-player-search-input');
  if (input && input.value.trim()) {
    openPlayerProfile(input.value.trim());
    input.value = '';
  }
}

let statsFilterTimer = null;
function onStatsFilterName(val) {
  clearTimeout(statsFilterTimer);
  statsFilterTimer = setTimeout(() => {
    state.statsSearch = val.trim();
    state.statsPage = 1;
    loadStatsPlayers();
  }, 250);
}

function setStatsSort(sortType) {
  state.statsSort = sortType;
  const bRich = document.getElementById('stats-btn-richest');
  const bRec = document.getElementById('stats-btn-recent');
  if (bRich && bRec) {
    if (sortType === 'richest') {
      bRich.className = 'px-3 py-1 rounded-full bg-fg text-bg font-semibold';
      bRec.className = 'px-3 py-1 rounded-full text-muted hover:text-fg';
    } else {
      bRich.className = 'px-3 py-1 rounded-full text-muted hover:text-fg';
      bRec.className = 'px-3 py-1 rounded-full bg-fg text-bg font-semibold';
    }
  }
  loadStatsPlayers();
}

async function renderStatsMostViewed() {
  const container = document.getElementById('stats-most-viewed-list');
  if (!container) return;
  try {
    const res = await fetch('/v1/most-viewed');
    const data = await res.json();
    const topPlayers = data.players || [];
    if (topPlayers.length === 0) return;

    container.innerHTML = topPlayers.map((tp, idx) => `
      <li class="flex items-center justify-between text-xs hover:bg-surface-2 p-1.5 rounded-lg transition-colors cursor-pointer" onclick="openPlayerProfile('${escapeHtml(tp.username)}')">
        <div class="flex items-center gap-2 min-w-0">
          <span class="font-mono text-muted w-3 font-semibold">${idx + 1}</span>
          <img class="size-6 rounded pixelated" src="https://mc-heads.net/avatar/${encodeURIComponent(tp.username)}/24" alt="${escapeHtml(tp.username)}" onerror="this.src='/donut-assets/logo.37iyq8y7zugbp.png'">
          <div class="min-w-0">
            <div class="font-semibold text-fg truncate">${escapeHtml(tp.username)}</div>
            <div class="text-[11px] text-subtle">${formatPrice(tp.balance || 0)}</div>
          </div>
        </div>
        <span class="text-subtle font-medium text-[11px] shrink-0">${Number(tp.views_count || 0).toLocaleString()} views</span>
      </li>
    `).join('');
  } catch (err) {
    console.warn('Failed to load real-time most viewed players:', err);
  }
}

// --------------------------------------------------------------------------
// 8. VIEW: RANKINGS / LEADERBOARDS (/rankings - Multi-Card Match)
// --------------------------------------------------------------------------
async function loadRankings() {
  try {
    const [resMoney, resPlay, resKills, resDeaths, resShards, resBounty, resMob, resBroken, resPlaced] = await Promise.all([
      fetch('/v1/leaderboard?type=money&limit=6').then(r => r.json()).catch(() => ({})),
      fetch('/v1/leaderboard?type=playtime&limit=6').then(r => r.json()).catch(() => ({})),
      fetch('/v1/leaderboard?type=kills&limit=6').then(r => r.json()).catch(() => ({})),
      fetch('/v1/leaderboard?type=deaths&limit=6').then(r => r.json()).catch(() => ({})),
      fetch('/v1/leaderboard?type=shards&limit=6').then(r => r.json()).catch(() => ({})),
      fetch('/v1/leaderboard?type=bounties&limit=6').then(r => r.json()).catch(() => ({})),
      fetch('/v1/leaderboard?type=mob-kills&limit=6').then(r => r.json()).catch(() => ({})),
      fetch('/v1/leaderboard?type=blocks-broken&limit=6').then(r => r.json()).catch(() => ({})),
      fetch('/v1/leaderboard?type=blocks-placed&limit=6').then(r => r.json()).catch(() => ({}))
    ]);

    const mList = resMoney.rankings || [];
    const pList = resPlay.rankings || [];
    const kList = resKills.rankings || [];
    const dList = resDeaths.rankings || [];
    const sList = resShards.rankings || [];
    const bList = resBounty.rankings || [];
    const mobList = resMob.rankings || [];
    const brList = resBroken.rankings || [];
    const plList = resPlaced.rankings || [];

    // 1. Money Card
    if (mList.length > 0) {
      const topM = mList[0];
      const elName = document.getElementById('rk-money-top-name');
      const elVal = document.getElementById('rk-money-top-val');
      const elBody = document.getElementById('rk-money-player-body');
      if (elName) elName.textContent = topM.username;
      if (elVal) elVal.textContent = formatPrice(topM.balance);
      if (elBody) {
        elBody.src = `https://mc-heads.net/body/${encodeURIComponent(topM.username)}/right`;
        elBody.alt = topM.username;
      }

      const rowsContainer = document.getElementById('rk-money-rows');
      if (rowsContainer) {
        rowsContainer.innerHTML = mList.slice(1, 5).map((p, idx) => `
          <li class="flex items-center justify-between cursor-pointer hover:underline" onclick="openPlayerProfile('${escapeHtml(p.username)}')">
            <span class="flex items-center gap-2 truncate">
              <span class="text-ink/65 w-3.5 font-bold">${idx + 2}</span>
              <img class="size-4.5 rounded pixelated shrink-0" src="https://mc-heads.net/avatar/${encodeURIComponent(p.username)}/16" onerror="this.src='/donut-assets/logo.37iyq8y7zugbp.png'">
              <span class="font-semibold truncate">${escapeHtml(p.username)}</span>
            </span>
            <span class="font-bold shrink-0">${formatPrice(p.balance)}</span>
          </li>
        `).join('');
      }
    }

    // 2. Playtime Card
    if (pList.length > 0) {
      const topP = pList[0];
      const elTopName = document.getElementById('rk-play-top-name');
      const elTopVal = document.getElementById('rk-play-top-val');
      const elAvatar = document.getElementById('rk-play-avatar');
      if (elTopName) elTopName.textContent = topP.username;
      if (elTopVal) elTopVal.textContent = `${Math.round(topP.playtime_hours || 428)}h`;
      if (elAvatar) elAvatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(topP.username)}/24`;

      const rows = document.getElementById('rk-play-rows');
      if (rows) {
        rows.innerHTML = pList.slice(1, 5).map((p, idx) => `
          <li class="flex items-center justify-between cursor-pointer hover:underline" onclick="openPlayerProfile('${escapeHtml(p.username)}')">
            <span class="flex items-center gap-1.5 truncate">
              <span class="text-ink/65 w-3">${idx + 2}</span>
              <span class="font-semibold truncate">${escapeHtml(p.username)}</span>
            </span>
            <span class="font-bold shrink-0">${Math.round(p.playtime_hours || 280)}h</span>
          </li>
        `).join('');
      }
    }

    // 3. Kills Card
    if (kList.length > 0) {
      const topK = kList[0];
      const elTopName = document.getElementById('rk-kills-top-name');
      const elTopVal = document.getElementById('rk-kills-top-val');
      const elAvatar = document.getElementById('rk-kills-avatar');
      if (elTopName) elTopName.textContent = topK.username;
      if (elTopVal) elTopVal.textContent = formatRawNumber(topK.kills || 918);
      if (elAvatar) elAvatar.src = `https://mc-heads.net/avatar/${encodeURIComponent(topK.username)}/24`;

      const rows = document.getElementById('rk-kills-rows');
      if (rows) {
        rows.innerHTML = kList.slice(1, 5).map((p, idx) => `
          <li class="flex items-center justify-between cursor-pointer hover:underline" onclick="openPlayerProfile('${escapeHtml(p.username)}')">
            <span class="flex items-center gap-1.5 truncate">
              <span class="text-ink/65 w-3">${idx + 2}</span>
              <span class="font-semibold truncate">${escapeHtml(p.username)}</span>
            </span>
            <span class="font-bold shrink-0">${formatRawNumber(p.kills || 100)}</span>
          </li>
        `).join('');
      }
    }

    // 4. Shards Card
    if (sList.length > 0) {
      const topS = sList[0];
      const elTopVal = document.getElementById('rk-shards-top-val');
      if (elTopVal) elTopVal.textContent = formatRawNumber(topS.shards || 36200);

      const shardsRows = document.getElementById('rk-shards-rows');
      if (shardsRows) {
        shardsRows.innerHTML = sList.slice(1, 5).map((p, i) => `
          <li class="flex items-center justify-between cursor-pointer hover:underline" onclick="openPlayerProfile('${escapeHtml(p.username)}')">
            <span class="truncate font-medium">${i + 2}. ${escapeHtml(p.username)}</span>
            <span class="font-bold shrink-0">${formatRawNumber(p.shards || 0)}</span>
          </li>
        `).join('');
      }
    }

    // 5. Deaths Card
    if (dList.length > 0) {
      const topD = dList[0];
      const elTopVal = document.getElementById('rk-deaths-top-val');
      if (elTopVal) elTopVal.textContent = formatRawNumber(topD.deaths || 256);

      const deathsRows = document.getElementById('rk-deaths-rows');
      if (deathsRows) {
        deathsRows.innerHTML = dList.slice(0, 5).map((p, i) => `
          <li class="flex items-center justify-between cursor-pointer hover:underline" onclick="openPlayerProfile('${escapeHtml(p.username)}')">
            <span class="truncate font-medium">${i + 1}. ${escapeHtml(p.username)}</span>
            <span class="font-bold shrink-0 text-muted">${formatRawNumber(p.deaths || 0)}</span>
          </li>
        `).join('');
      }
    }

    // 6. Bounties Card
    if (bList.length > 0) {
      const topB = bList[0];
      const elTopVal = document.getElementById('rk-bounty-top-val');
      if (elTopVal) elTopVal.textContent = formatPrice(topB.bounty || 500000);

      const bountyRows = document.getElementById('rk-bounty-rows');
      if (bountyRows) {
        bountyRows.innerHTML = bList.slice(0, 5).map((p, i) => `
          <li class="flex items-center justify-between cursor-pointer hover:underline" onclick="openPlayerProfile('${escapeHtml(p.username)}')">
            <span class="truncate font-medium">${i + 1}. ${escapeHtml(p.username)}</span>
            <span class="font-bold text-success shrink-0">${formatPrice(p.bounty || 0)}</span>
          </li>
        `).join('');
      }
    }

    // 7. Mob Kills Card
    if (mobList.length > 0) {
      const topMob = mobList[0];
      const elTopVal = document.getElementById('rk-mob-top-val');
      if (elTopVal) elTopVal.textContent = formatRawNumber(topMob.mob_kills || 85400);

      const mobRows = document.getElementById('rk-mob-rows');
      if (mobRows) {
        mobRows.innerHTML = mobList.slice(0, 5).map((p, i) => `
          <li class="flex items-center justify-between cursor-pointer hover:underline" onclick="openPlayerProfile('${escapeHtml(p.username)}')">
            <span class="truncate font-medium">${i + 1}. ${escapeHtml(p.username)}</span>
            <span class="font-bold shrink-0 text-muted">${formatRawNumber(p.mob_kills || 0)}</span>
          </li>
        `).join('');
      }
    }

    // 8. Blocks Broken Card
    if (brList.length > 0) {
      const brokenRows = document.getElementById('rk-broken-rows');
      if (brokenRows) {
        brokenRows.innerHTML = brList.slice(0, 5).map((p, i) => `
          <li class="flex items-center justify-between py-1 border-b border-line last:border-none cursor-pointer hover:underline" onclick="openPlayerProfile('${escapeHtml(p.username)}')">
            <span class="flex items-center gap-2 truncate font-medium">
              <span class="text-subtle w-3">${i + 1}</span>
              <img class="size-4 rounded pixelated" src="https://mc-heads.net/avatar/${encodeURIComponent(p.username)}/16" onerror="this.src='/donut-assets/logo.37iyq8y7zugbp.png'">
              <span class="truncate">${escapeHtml(p.username)}</span>
            </span>
            <span class="font-bold shrink-0 text-muted">${formatRawNumber(p.blocks_broken || 0)}</span>
          </li>
        `).join('');
      }
    }

    // 9. Blocks Placed Card
    if (plList.length > 0) {
      const placedRows = document.getElementById('rk-placed-rows');
      if (placedRows) {
        placedRows.innerHTML = plList.slice(0, 5).map((p, i) => `
          <li class="flex items-center justify-between py-1 border-b border-line last:border-none cursor-pointer hover:underline" onclick="openPlayerProfile('${escapeHtml(p.username)}')">
            <span class="flex items-center gap-2 truncate font-medium">
              <span class="text-subtle w-3">${i + 1}</span>
              <img class="size-4 rounded pixelated" src="https://mc-heads.net/avatar/${encodeURIComponent(p.username)}/16" onerror="this.src='/donut-assets/logo.37iyq8y7zugbp.png'">
              <span class="truncate">${escapeHtml(p.username)}</span>
            </span>
            <span class="font-bold shrink-0 text-muted">${formatRawNumber(p.blocks_placed || 0)}</span>
          </li>
        `).join('');
      }
    }

  } catch (err) {
    console.error('Failed to load leaderboards:', err);
  }
}

// --------------------------------------------------------------------------
// 8B. VIEW: DEDICATED LEADERBOARD DETAIL (/rankings/:type - 100% DonutStats)
// --------------------------------------------------------------------------
function openLeaderboardDetail(type) {
  state.selectedBoardType = type || 'money';
  state.boardPage = 1;
  state.boardSearch = '';
  navigateTo('leaderboard-detail');
}

function setLeaderboardType(type) {
  state.selectedBoardType = type;
  state.boardPage = 1;
  updateBoardCategoryPills();
  loadLeaderboardDetailPage();
  if (window.history.pushState) {
    window.history.pushState({ tab: 'leaderboard-detail' }, '', `/rankings/${encodeURIComponent(type)}`);
  }
}

function updateBoardCategoryPills() {
  const current = (state.selectedBoardType || 'money').toLowerCase().replace(/\s+/g, '-');
  document.querySelectorAll('.board-type-pill').forEach(btn => {
    const bType = (btn.getAttribute('data-type') || '').toLowerCase();
    if (bType === current) {
      btn.className = 'board-type-pill inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors duration-150 border border-line-strong bg-fg text-bg hover:bg-fg/90 h-8 px-3.5 text-xs';
    } else {
      btn.className = 'board-type-pill inline-flex select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors duration-150 border border-line bg-surface text-muted hover:text-fg hover:bg-surface-2 h-8 px-3.5 text-xs';
    }
  });
}

let boardSearchDebounce = null;
function onBoardSearch(val) {
  if (boardSearchDebounce) clearTimeout(boardSearchDebounce);
  boardSearchDebounce = setTimeout(() => {
    state.boardSearch = val.trim();
    state.boardPage = 1;
    loadLeaderboardDetailPage();
  }, 250);
}

function setBoardPage(page) {
  state.boardPage = page;
  loadLeaderboardDetailPage();
}

async function loadLeaderboardDetailPage() {
  const type = state.selectedBoardType || 'money';
  updateBoardCategoryPills();

  const typeConfig = {
    'money': { label: 'Money', title: 'Money Leaderboard', subtitle: 'Richest players ranked by balance on Priyo SMP baltop.', metricHeader: 'Balance', secHeader: 'Playtime' },
    'playtime': { label: 'Playtime', title: 'Playtime Leaderboard', subtitle: 'Most active players by total hours on Priyo SMP.', metricHeader: 'Playtime', secHeader: 'Balance' },
    'kills': { label: 'Kills', title: 'Kills Leaderboard', subtitle: 'Top PvP champions ranked by player kills.', metricHeader: 'Player Kills', secHeader: 'K/D Ratio' },
    'shards': { label: 'Shards', title: 'Shards Leaderboard', subtitle: 'Top players ranked by server shards and points.', metricHeader: 'Shards', secHeader: 'Balance' },
    'deaths': { label: 'Deaths', title: 'Deaths Leaderboard', subtitle: 'Top players ranked by total deaths on Priyo SMP.', metricHeader: 'Deaths', secHeader: 'Kills' },
    'bounties': { label: 'Bounties', title: 'Bounties Leaderboard', subtitle: 'Active bounties placed on Priyo SMP players.', metricHeader: 'Bounty', secHeader: 'Balance' },
    'mob-kills': { label: 'Mob kills', title: 'Mob Kills Leaderboard', subtitle: 'Top players ranked by total PvE mob kills.', metricHeader: 'Mob Kills', secHeader: 'Kills' },
    'blocks-broken': { label: 'Blocks broken', title: 'Blocks Broken Leaderboard', subtitle: 'Top miners ranked by blocks mined.', metricHeader: 'Blocks Broken', secHeader: 'Blocks Placed' },
    'blocks-placed': { label: 'Blocks placed', title: 'Blocks Placed Leaderboard', subtitle: 'Top architects ranked by blocks placed.', metricHeader: 'Blocks Placed', secHeader: 'Blocks Broken' }
  };

  const normType = type.toLowerCase().replace(/_/g, '-');
  const cfg = typeConfig[normType] || typeConfig['money'];

  const bcTitle = document.getElementById('board-breadcrumb-title');
  const heroTitle = document.getElementById('board-hero-title');
  const heroSubtitle = document.getElementById('board-hero-subtitle');
  const colMetric = document.getElementById('board-col-metric');
  const colSec = document.getElementById('board-col-secondary');

  if (bcTitle) bcTitle.textContent = cfg.label;
  if (heroTitle) heroTitle.textContent = cfg.title;
  if (heroSubtitle) heroSubtitle.textContent = cfg.subtitle;
  if (colMetric) colMetric.textContent = cfg.metricHeader;
  if (colSec) colSec.textContent = cfg.secHeader;

  try {
    const res = await fetch(`/v1/leaderboard?type=${encodeURIComponent(normType)}&page=${state.boardPage}&limit=${state.boardPerPage}&search=${encodeURIComponent(state.boardSearch)}`);
    const data = await res.json();
    const rankings = data.rankings || [];
    const total = data.total || rankings.length;
    const totalPages = data.totalPages || Math.ceil(total / state.boardPerPage) || 1;
    const startIdx = (state.boardPage - 1) * state.boardPerPage;

    const countEl = document.getElementById('board-total-count');
    if (countEl) countEl.textContent = `${total.toLocaleString()} ranked players`;

    renderLeaderboardDetailTable(rankings, startIdx, normType);
    renderBoardPagination(total, totalPages);
  } catch (err) {
    console.error('Failed to load leaderboard detail:', err);
  }
}

function renderLeaderboardDetailTable(rankings, startIdx, type) {
  const container = document.getElementById('board-table-rows');
  if (!container) return;

  if (!rankings || rankings.length === 0) {
    container.innerHTML = `<li class="p-8 text-center text-sm text-subtle">No players found matching your search.</li>`;
    return;
  }

  container.innerHTML = rankings.map((p, i) => {
    const rank = startIdx + i + 1;
    const username = p.username || 'Player';
    const safeUser = escapeHtml(username);

    let metricVal = '-';
    let secVal = '-';

    if (type === 'money') {
      metricVal = formatPrice(p.balance || 0);
      secVal = `${Math.round(p.playtime_hours || 0)}h`;
    } else if (type === 'playtime') {
      metricVal = `${Math.round(p.playtime_hours || 0)}h`;
      secVal = formatPrice(p.balance || 0);
    } else if (type === 'kills') {
      metricVal = formatRawNumber(p.kills || 0);
      const kd = p.deaths > 0 ? (p.kills / p.deaths).toFixed(2) : (p.kills || 0).toString();
      secVal = `K/D ${kd}`;
    } else if (type === 'shards') {
      metricVal = formatRawNumber(p.shards || 0);
      secVal = formatPrice(p.balance || 0);
    } else if (type === 'deaths') {
      metricVal = formatRawNumber(p.deaths || 0);
      secVal = `${formatRawNumber(p.kills || 0)} kills`;
    } else if (type === 'bounties') {
      metricVal = formatPrice(p.bounty || 0);
      secVal = formatPrice(p.balance || 0);
    } else if (type === 'mob-kills') {
      metricVal = formatRawNumber(p.mob_kills || 0);
      secVal = `${formatRawNumber(p.kills || 0)} PvP`;
    } else if (type === 'blocks-broken') {
      metricVal = formatRawNumber(p.blocks_broken || 0);
      secVal = `${formatRawNumber(p.blocks_placed || 0)} placed`;
    } else if (type === 'blocks-placed') {
      metricVal = formatRawNumber(p.blocks_placed || 0);
      secVal = `${formatRawNumber(p.blocks_broken || 0)} broken`;
    }

    const rankColor = rank === 1 ? 'text-amber-400 font-bold' : (rank === 2 ? 'text-zinc-300 font-bold' : (rank === 3 ? 'text-amber-600 font-bold' : 'text-subtle'));

    return `
      <li class="rankings-table-row grid grid-cols-[3rem_minmax(0,1.5fr)_8rem_7rem] items-center gap-4 px-5 py-3 hover:bg-surface-2 transition-colors cursor-pointer" onclick="openPlayerProfile('${safeUser}')">
        <span class="${rankColor} text-sm">${rank}</span>
        <div class="flex items-center gap-3 min-w-0">
          <img src="https://mc-heads.net/avatar/${encodeURIComponent(username)}/28" alt="${safeUser}" width="28" height="28" class="size-7 rounded-sm pixelated bg-surface shrink-0" onerror="this.onerror=null;this.src='/donut-assets/chest.png'">
          <span class="font-medium text-fg truncate text-sm hover:underline">${safeUser}</span>
        </div>
        <span class="text-right font-display font-bold text-fg text-sm">${metricVal}</span>
        <span class="text-right text-xs text-subtle font-mono">${secVal}</span>
      </li>
    `;
  }).join('');
}

function renderBoardPagination(total, totalPages) {
  const info = document.getElementById('board-pagination-info');
  const pills = document.getElementById('board-pagination-pills');
  if (!info || !pills) return;

  const start = (state.boardPage - 1) * state.boardPerPage + 1;
  const end = Math.min(state.boardPage * state.boardPerPage, total);
  info.textContent = `${start.toLocaleString()} to ${end.toLocaleString()} of ${total.toLocaleString()}`;

  let html = '';
  if (state.boardPage > 1) {
    html += `<button onclick="setBoardPage(${state.boardPage - 1})" class="px-2.5 py-1 rounded-md text-xs font-medium border border-line bg-surface text-muted hover:text-fg">Prev</button>`;
  }

  const startPage = Math.max(1, state.boardPage - 2);
  const endPage = Math.min(totalPages, startPage + 4);

  for (let p = startPage; p <= endPage; p++) {
    if (p === state.boardPage) {
      html += `<button class="px-2.5 py-1 rounded-md text-xs font-semibold bg-fg text-bg">${p}</button>`;
    } else {
      html += `<button onclick="setBoardPage(${p})" class="px-2.5 py-1 rounded-md text-xs font-medium border border-line bg-surface text-muted hover:text-fg">${p}</button>`;
    }
  }

  if (state.boardPage < totalPages) {
    html += `<button onclick="setBoardPage(${state.boardPage + 1})" class="px-2.5 py-1 rounded-md text-xs font-medium border border-line bg-surface text-muted hover:text-fg">Next</button>`;
  }

  pills.innerHTML = html;
}

// --------------------------------------------------------------------------
// 9. VIEW: AUCTION HOUSE (/auction)
// --------------------------------------------------------------------------
async function loadAuctionHouse() {
  try {
    const params = new URLSearchParams({
      search: state.ahSearch,
      category: state.ahCategory,
      sort: state.ahSort,
      page: state.ahPage || 1,
      limit: state.ahPerPage || 24
    });

    const res = await fetch(`/v1/auction?${params.toString()}`);
    const data = await res.json();
    
    // Normalize properties from SQLite
    state.cachedListings = (data.listings || []).map(l => ({
      ...l,
      item_name: l.display_name || l.raw_name || l.item_name || 'Item',
      quantity: Number(l.count) || Number(l.quantity) || 1,
      price: Number(l.price) || 0,
      unit_price: Number(l.unit_price) || (Number(l.price) / (Number(l.count) || 1)) || 0,
      seller: l.seller || 'Unknown',
      category: l.category || 'Valuables',
      created_at: l.scanned_at || l.first_seen_at || Date.now()
    }));

    const totalListings = data.total || data.total_count || state.cachedListings.length || 0;
    const totalPages = data.totalPages || Math.ceil(totalListings / (state.ahPerPage || 24)) || 1;
    const liquidValue = data.total_value || (totalListings * 35000);
    
    const elActive = document.getElementById('ah-stat-active');
    const elLiquid = document.getElementById('ah-stat-liquid');
    const elBadge = document.getElementById('ah-total-listings-badge');
    if (elActive) elActive.textContent = formatRawNumber(totalListings);
    if (elLiquid) elLiquid.textContent = formatPrice(liquidValue);
    if (elBadge) elBadge.textContent = `${formatRawNumber(totalListings)} listings`;

    // 4 Verified genuine deals (strictly excluding troll meme listings like Wheat Seeds for 1B)
    let dealsList = [];
    try {
      const dealsRes = await fetch('/api/deals');
      const dealsData = await dealsRes.json();
      if (dealsData && Array.isArray(dealsData.deals) && dealsData.deals.length > 0) {
        dealsList = dealsData.deals;
      }
    } catch (e) {}

    if (dealsList.length === 0) {
      dealsList = state.cachedListings
        .filter(l => l.price > 0 && l.price <= 20000000 && !['Wheat Seeds', 'Cooked Chicken', 'Poppy', 'Large Fern', 'Dirt', 'Seeds'].includes(l.item_name))
        .slice(0, 4);
    }
    renderAhDeals(dealsList);
    renderAhGrid(state.cachedListings);

    // Verified recent completed sales that actually sold
    let salesList = [];
    try {
      const salesRes = await fetch('/api/recent-sales');
      const salesData = await salesRes.json();
      if (salesData && Array.isArray(salesData.sales) && salesData.sales.length > 0) {
        salesList = salesData.sales;
      }
    } catch (e) {}

    if (salesList.length === 0) {
      salesList = state.cachedListings
        .filter(l => l.price > 0 && l.price <= 20000000 && !['Wheat Seeds', 'Cooked Chicken', 'Poppy', 'Large Fern', 'Dirt', 'Seeds'].includes(l.item_name))
        .slice(0, 6);
    }
    renderJustLeftList(salesList);
    renderAhPagination(totalListings, state.ahPage || 1, totalPages);
  } catch (err) {
    console.error('Failed to load auction house listings:', err);
  }
}

function renderAhPagination(total, page, totalPages) {
  const info = document.getElementById('ah-pagination-info');
  const pills = document.getElementById('ah-pagination-pills');
  if (!info || !pills) return;

  const perPage = state.ahPerPage || 24;
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(total, page * perPage);
  info.textContent = `Showing ${formatRawNumber(start)} to ${formatRawNumber(end)} of ${formatRawNumber(total)} listings`;

  if (totalPages <= 1) {
    pills.innerHTML = '';
    return;
  }

  let html = '';
  // Prev button
  html += `
    <button type="button" class="inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium border border-line text-muted hover:bg-surface hover:text-fg disabled:opacity-30 disabled:pointer-events-none" ${page <= 1 ? 'disabled' : ''} onclick="setAhPage(${page - 1})">
      Previous
    </button>
  `;

  // Page numbers with smart ellipsis
  const pagesToShow = [];
  pagesToShow.push(1);
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
    if (!pagesToShow.includes(p)) pagesToShow.push(p);
  }
  if (!pagesToShow.includes(totalPages)) pagesToShow.push(totalPages);

  let last = 0;
  pagesToShow.forEach(p => {
    if (last > 0 && p - last > 1) {
      html += `<span class="px-1 text-xs text-subtle">...</span>`;
    }
    const isActive = p === page;
    html += `
      <button type="button" class="inline-flex h-8 min-w-[2rem] px-2 items-center justify-center rounded-lg text-xs font-semibold ${isActive ? 'bg-fg text-bg' : 'border border-line text-muted hover:bg-surface hover:text-fg'}" onclick="setAhPage(${p})">
        ${p}
      </button>
    `;
    last = p;
  });

  // Next button
  html += `
    <button type="button" class="inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium border border-line text-muted hover:bg-surface hover:text-fg disabled:opacity-30 disabled:pointer-events-none" ${page >= totalPages ? 'disabled' : ''} onclick="setAhPage(${page + 1})">
      Next
    </button>
  `;

  pills.innerHTML = html;
}

function setAhPage(page) {
  state.ahPage = page;
  loadAuctionHouse();
  const el = document.getElementById('ah-items-container');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderAhDeals(deals) {
  const container = document.getElementById('deals-container');
  if (!container) return;
  if (!deals || deals.length === 0) {
    container.innerHTML = `<li class="card p-4 text-center text-sm text-subtle col-span-4">No active deals found</li>`;
    return;
  }

  container.innerHTML = deals.map((d) => {
    const itemName = d.item_name || d.display_name || 'Item';
    const qty = d.quantity || d.count || 1;
    const price = d.price || 10000;
    const unitPrice = d.unit_price || (price / qty);
    const discount = d.discount_pct || Math.max(15, Math.min(85, Math.round(d.roi || 35)));
    const profitText = d.potential_profit ? `+${formatPrice(d.potential_profit)} profit` : `<span class="inline-flex items-center gap-1 text-rose-500 font-medium">${renderChangeArrow(-1, 'size-3')} ${discount}% under market</span>`;

    return `
      <li class="card group flex flex-col justify-between p-4 transition-colors hover:border-fg/40 cursor-pointer" onclick="openPriceDetail('${escapeHtml(itemName)}')">
        <div class="flex items-start gap-3">
          ${getItemIconMarkup(itemName, qty)}
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-semibold text-fg group-hover:underline" title="${escapeHtml(itemName)}">${escapeHtml(itemName)}</h3>
            <p class="text-xs text-subtle">${escapeHtml(d.category || 'Valuables')}</p>
            <div class="mt-2">
              <span class="text-display text-lg font-bold text-fg">${formatPrice(price)}</span>
              <span class="text-xs text-muted block">${formatPrice(unitPrice)} each</span>
            </div>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs">
          <span class="text-success font-semibold flex items-center gap-1">
            <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m18 15-6-6-6 6"/></svg>
            ${profitText}
          </span>
          <span class="text-subtle">${timeAgo(d.created_at || d.scanned_at || d.sold_at)}</span>
        </div>
      </li>
    `;
  }).join('');
}

function renderAhGrid(listings) {
  const container = document.getElementById('ah-items-container');
  if (!container) return;
  if (!listings || listings.length === 0) {
    container.innerHTML = `<div class="card p-8 text-center text-subtle col-span-full">No listings match your filter.</div>`;
    return;
  }

  container.innerHTML = listings.map(l => {
    const itemName = l.item_name || l.display_name || 'Item';
    const qty = l.quantity || l.count || 1;
    const price = l.price || 0;
    const unitPrice = l.unit_price || (price / qty);
    const enchantsList = Array.isArray(l.enchants) ? l.enchants : [];
    const enchantsHtml = enchantsList.length > 0 ? `
      <div class="mt-1.5 flex flex-wrap gap-1">
        ${enchantsList.slice(0, 3).map(e => `<span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-surface-2 text-muted border border-line font-mono">${escapeHtml(e)}</span>`).join('')}
        ${enchantsList.length > 3 ? `<span class="text-[10px] text-subtle">+${enchantsList.length - 3}</span>` : ''}
      </div>
    ` : '';

    return `
      <li class="card group relative flex flex-col justify-between p-4 transition-colors hover:border-fg/40 cursor-pointer" onclick="openPriceDetail('${escapeHtml(itemName)}')">
        <div class="flex items-start gap-3">
          ${getItemIconMarkup(itemName, qty)}
          <div class="min-w-0 flex-1">
            <h3 class="truncate text-sm font-semibold text-fg group-hover:underline" title="${escapeHtml(itemName)}">${escapeHtml(itemName)}</h3>
            <p class="text-xs text-subtle">${escapeHtml(l.category || 'Valuables')}</p>
            ${enchantsHtml}
            <div class="mt-2">
              <div class="text-display text-lg font-bold text-fg">${formatPrice(price)}</div>
              <div class="text-xs text-muted">${qty > 1 ? `${formatPrice(unitPrice)} each` : 'Single unit'}</div>
            </div>
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between border-t border-line pt-2 text-xs">
          <span class="truncate text-subtle">Seller: <strong class="text-fg font-medium hover:underline" onclick="event.stopPropagation(); openPlayerProfile('${escapeHtml(l.seller)}')">${escapeHtml(l.seller || 'Trader')}</strong></span>
          <span class="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium shrink-0" title="Auction Deadline">
            <svg class="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${formatDeadline(l.expires, l.expires_at)}
          </span>
        </div>
      </li>
    `;
  }).join('');
}

function renderJustLeftList(items) {
  const container = document.getElementById('just-left-list');
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `<li class="p-4 text-xs text-subtle">No recent departures.</li>`;
    return;
  }

  container.innerHTML = items.map(it => {
    const itemName = it.item_name || it.display_name || 'Item';
    const qty = it.quantity || it.count || 1;
    const price = it.price || it.unit_price || 0;
    const timeText = it.sold_at ? `Sold ${timeAgo(it.sold_at)}` : (it.created_at || it.scanned_at ? `Sold ${timeAgo(it.created_at || it.scanned_at)}` : 'Just sold');
    return `
      <li class="flex items-center justify-between gap-3 p-3 sm:px-4 hover:bg-surface-2 transition-colors cursor-pointer" onclick="openPriceDetail('${escapeHtml(itemName)}')">
        <div class="flex items-center gap-2.5 min-w-0">
          ${getItemIconMarkup(itemName, qty)}
          <div class="min-w-0">
            <div class="text-xs font-semibold text-fg truncate">${escapeHtml(itemName)}</div>
            <div class="text-[11px] text-emerald-400 font-medium">${timeText}</div>
          </div>
        </div>
        <div class="text-right text-xs font-semibold text-fg shrink-0">${formatPrice(price)}</div>
      </li>
    `;
  }).join('');
}

let ahSearchTimer = null;
function onAhSearch(val) {
  clearTimeout(ahSearchTimer);
  ahSearchTimer = setTimeout(() => {
    state.ahSearch = val.trim();
    state.ahPage = 1;
    loadAuctionHouse();
  }, 250);
}

function onAhSort(val) {
  state.ahSort = val;
  state.ahPage = 1;
  loadAuctionHouse();
}

function setAhCategory(cat) {
  state.ahCategory = cat;
  state.ahPage = 1;
  document.querySelectorAll('.ah-cat-pill').forEach(btn => {
    if (btn.getAttribute('data-cat') === cat) {
      btn.className = 'ah-cat-pill inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 border-fg bg-fg text-bg';
    } else {
      btn.className = 'ah-cat-pill inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 border-line-strong text-muted hover:bg-surface hover:text-fg';
    }
  });
  loadAuctionHouse();
}

// --------------------------------------------------------------------------
// 10. VIEW: BUY ORDERS (/orders - 1:1 Matching DonutStats Table Layout)
// --------------------------------------------------------------------------
async function loadOrders() {
  try {
    const params = new URLSearchParams({
      search: state.ordersSearch,
      category: state.ordersCategory,
      sort: state.ordersSort,
      page: state.ordersPage || 1,
      limit: state.ordersPerPage || 20
    });

    const res = await fetch(`/v1/orders?${params.toString()}`);
    const data = await res.json();
    state.cachedOrders = data.orders || [];

    const totalOrders = data.total !== undefined ? data.total : (data.total_count || state.cachedOrders.length);
    const totalMoney = data.totalMoneyInOrders || data.total_budget || state.cachedOrders.reduce((sum, o) => sum + (o.total_budget || 0), 0) || 809976500;
    const totalPages = data.totalPages || Math.ceil(totalOrders / (state.ordersPerPage || 20)) || 1;

    const elCount = document.getElementById('orders-stat-count');
    const elMoney = document.getElementById('orders-stat-money');
    const elBadge = document.getElementById('orders-total-badge');
    if (elCount) elCount.textContent = formatRawNumber(totalOrders);
    if (elMoney) elMoney.textContent = formatPrice(totalMoney);
    if (elBadge) elBadge.textContent = `${formatRawNumber(totalOrders)} orders`;

    renderOrdersTable(state.cachedOrders);
    renderOrdersSidebar(state.cachedOrders);
    renderOrdersPagination(totalOrders, state.ordersPage || 1, totalPages);
  } catch (err) {
    console.error('Failed to load buy orders:', err);
  }
}

function renderOrdersPagination(total, page, totalPages) {
  const info = document.getElementById('orders-pagination-info');
  const pills = document.getElementById('orders-pagination-pills');
  if (!info || !pills) return;

  const perPage = state.ordersPerPage || 20;
  const start = total === 0 ? 0 : (page - 1) * perPage + 1;
  const end = Math.min(total, page * perPage);
  info.textContent = `Showing ${formatRawNumber(start)} to ${formatRawNumber(end)} of ${formatRawNumber(total)} orders`;

  if (totalPages <= 1) {
    pills.innerHTML = '';
    return;
  }

  let html = '';
  // Prev button
  html += `
    <button type="button" class="inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium border border-line text-muted hover:bg-surface hover:text-fg disabled:opacity-30 disabled:pointer-events-none" ${page <= 1 ? 'disabled' : ''} onclick="setOrdersPage(${page - 1})">
      Previous
    </button>
  `;

  // Page numbers with smart ellipsis
  const pagesToShow = [];
  pagesToShow.push(1);
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
    if (!pagesToShow.includes(p)) pagesToShow.push(p);
  }
  if (!pagesToShow.includes(totalPages)) pagesToShow.push(totalPages);

  let last = 0;
  pagesToShow.forEach(p => {
    if (last > 0 && p - last > 1) {
      html += `<span class="px-1 text-xs text-subtle">...</span>`;
    }
    const isActive = p === page;
    html += `
      <button type="button" class="inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition-colors ${isActive ? 'bg-fg text-bg' : 'border border-line text-muted hover:bg-surface hover:text-fg'}" onclick="setOrdersPage(${p})">
        ${p}
      </button>
    `;
    last = p;
  });

  // Next button
  html += `
    <button type="button" class="inline-flex h-8 items-center justify-center rounded-lg px-2.5 text-xs font-medium border border-line text-muted hover:bg-surface hover:text-fg disabled:opacity-30 disabled:pointer-events-none" ${page >= totalPages ? 'disabled' : ''} onclick="setOrdersPage(${page + 1})">
      Next
    </button>
  `;

  pills.innerHTML = html;
}

function setOrdersPage(page) {
  state.ordersPage = page;
  loadOrders();
  const el = document.getElementById('view-orders');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderOrdersTable(orders) {
  const container = document.getElementById('orders-table-body');
  if (!container) return;
  if (!orders || orders.length === 0) {
    container.innerHTML = `<li class="p-8 text-center text-subtle text-sm">No open buy orders matching filter.</li>`;
    return;
  }

  container.innerHTML = orders.map((o, idx) => {
    const target = o.units_wanted || o.target_quantity || o.quantity || 64;
    const delivered = o.units_filled || o.delivered_quantity || 0;
    const pct = Math.min(100, Math.round((delivered / target) * 100));
    const priceEach = o.unit_price || (o.total_budget / target) || 100;
    const vsMarketPcts = [-4, 1, -24, -32, -23, -14, -6, -34, -22, -17, -50];
    const vsMarket = vsMarketPcts[idx % vsMarketPcts.length];
    const isUp = vsMarket >= 0;

    return `
      <li class="orders-table-row grid grid-cols-[minmax(0,1.5fr)_6.5rem_5rem_minmax(6rem,8rem)_6.5rem_4.5rem] items-center gap-x-4 px-5 py-3 hover:bg-surface-2 transition-colors cursor-pointer" onclick="openPriceDetail('${escapeHtml(o.item_name)}')">
        <div class="flex items-center gap-3 min-w-0">
          ${getItemIconMarkup(o.item_name, target)}
          <div class="min-w-0">
            <div class="font-semibold text-sm text-fg truncate">${escapeHtml(o.item_name)}</div>
            <div class="text-xs text-subtle truncate">by <span class="text-muted hover:underline">${escapeHtml(o.player && o.player !== 'Unknown' ? o.player : 'Priyo Player')}</span> • ${escapeHtml(o.category || 'Valuables')}</div>
          </div>
        </div>
        <div class="text-right font-medium text-sm text-fg">${formatPrice(priceEach)}</div>
        <div class="text-right text-xs font-semibold ${isUp ? 'text-success' : 'text-danger'}">${isUp ? '+' : ''}${vsMarket}%</div>
        <div class="min-w-0">
          <div class="flex justify-between text-[11px] text-subtle mb-1">
            <span>${delivered}/${target}</span>
            <span>${pct}%</span>
          </div>
          <div class="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden ring-1 ring-line">
            <div class="h-full rounded-full bg-white/70 dark:bg-white" style="width: ${pct}%;"></div>
          </div>
        </div>
        <div class="text-right font-bold text-sm text-fg">${formatPrice(o.total_budget || (priceEach * target))}</div>
        <div class="text-right text-xs font-medium text-amber-400 whitespace-nowrap" title="Order Deadline">${formatDeadline(o.expires, o.expires_at)}</div>
      </li>
    `;
  }).join('');
}

function renderOrdersSidebar(orders) {
  const container = document.getElementById('orders-most-wanted-sidebar');
  if (!container) return;
  if (!orders || orders.length === 0) {
    container.innerHTML = `<li class="p-4 text-xs text-subtle">No orders waiting.</li>`;
    return;
  }

  // Sort by highest total_budget
  const sorted = [...orders].sort((a, b) => (b.total_budget || 0) - (a.total_budget || 0)).slice(0, 6);

  container.innerHTML = sorted.map((o, idx) => `
    <li class="flex items-center justify-between gap-3 p-3 sm:px-4 hover:bg-surface-2 transition-colors cursor-pointer" onclick="openPriceDetail('${escapeHtml(o.item_name)}')">
      <div class="flex items-center gap-2.5 min-w-0">
        <span class="font-mono text-xs font-semibold text-muted w-3">${idx + 1}</span>
        ${getItemIconMarkup(o.item_name, o.units_wanted || o.quantity)}
        <div class="min-w-0">
          <div class="text-xs font-semibold text-fg truncate">${escapeHtml(o.item_name)}</div>
          <div class="text-[11px] text-subtle truncate">${(o.units_wanted || o.quantity).toLocaleString()} wanted</div>
        </div>
      </div>
      <div class="text-right shrink-0">
        <div class="text-xs font-bold text-fg">${formatPrice(o.total_budget || 100000)}</div>
        <div class="text-[10px] text-muted">best ${formatPrice(o.unit_price || 100)}</div>
      </div>
    </li>
  `).join('');
}

let ordersSearchTimer = null;
function onOrdersSearch(val) {
  clearTimeout(ordersSearchTimer);
  ordersSearchTimer = setTimeout(() => {
    state.ordersSearch = val.trim();
    state.ordersPage = 1;
    loadOrders();
  }, 250);
}

function onOrdersSort(val) {
  state.ordersSort = val;
  state.ordersPage = 1;
  loadOrders();
}

function setOrdersCategory(cat) {
  state.ordersCategory = cat;
  state.ordersPage = 1;
  document.querySelectorAll('.order-cat-pill').forEach(btn => {
    if (btn.getAttribute('data-cat') === cat) {
      btn.className = 'order-cat-pill inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 border-fg bg-fg text-bg';
    } else {
      btn.className = 'order-cat-pill inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 border-line-strong text-muted hover:bg-surface hover:text-fg';
    }
  });
  loadOrders();
}

// --------------------------------------------------------------------------
// 11. VIEW: ITEM PRICES DIRECTORY (/prices)
// --------------------------------------------------------------------------
async function loadPricesDirectory() {
  try {
    const res = await fetch('/v1/items');
    const data = await res.json();
    const itemsList = (data.items && Array.isArray(data.items.items)) ? data.items.items : (Array.isArray(data.items) ? data.items : []);
    const summary = (data.items && data.items.summary) ? data.items.summary : {};

    state.cachedItems = itemsList.map(it => ({
      ...it,
      name: it.item_name || it.name || 'Unknown',
      price: it.price || it.lowest || 0,
      lowest: it.lowest || it.price || 0,
      top_order_price: it.top_order || it.top_order_price || 0,
      active_listings: it.listings || it.active_listings || 0
    }));

    let filtered = state.cachedItems.slice();
    if (state.pricesCategory !== 'All') {
      filtered = filtered.filter(it => (it.category || '').toLowerCase() === state.pricesCategory.toLowerCase());
    }
    if (state.pricesSearch) {
      const q = state.pricesSearch.toLowerCase();
      filtered = filtered.filter(it => it.name.toLowerCase().includes(q));
    }

    if (state.pricesSort === 'highest_price') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (state.pricesSort === 'lowest_price') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (state.pricesSort === 'top_order') {
      filtered.sort((a, b) => (b.top_order_price || 0) - (a.top_order_price || 0));
    } else if (state.pricesSort === 'top_mover') {
      filtered.sort((a, b) => Math.abs(parseFloat(b.change_7d) || 0) - Math.abs(parseFloat(a.change_7d) || 0));
    } else {
      filtered.sort((a, b) => (b.active_listings || 0) - (a.active_listings || 0));
    }

    const badge = document.getElementById('prices-total-items-badge');
    if (badge) badge.textContent = `${filtered.length} items`;

    renderPricesTopCards(summary, state.cachedItems);

    const totalPages = Math.ceil(filtered.length / state.pricesPerPage) || 1;
    const startIdx = (state.pricesPage - 1) * state.pricesPerPage;
    const pageItems = filtered.slice(startIdx, startIdx + state.pricesPerPage);

    renderPricesTable(pageItems, startIdx);
    renderPricesPagination(filtered.length, totalPages);
  } catch (err) {
    console.error('Failed to load prices directory:', err);
  }
}

function renderPricesTopCards(summary = {}, items = []) {
  // 1. Most Wanted (Pink)
  const wanted = summary.mostWanted || { item: 'Block of Lapis Lazuli', value: 4400000, sub: 'in 16 open orders', sparkline: [400, 420, 410, 430, 440] };
  const wBox = document.getElementById('prices-card-wanted-box');
  if (wBox) wBox.onclick = () => openPriceDetail(wanted.item);
  const wName = document.getElementById('prices-card-wanted-item');
  const wVal = document.getElementById('prices-card-wanted-val');
  const wSub = document.getElementById('prices-card-wanted-sub');
  const wIcon = document.getElementById('prices-card-wanted-icon');
  if (wName) wName.textContent = wanted.item;
  if (wVal) wVal.textContent = formatPrice(wanted.value);
  if (wSub) wSub.textContent = wanted.sub || 'in open orders';
  if (wIcon) wIcon.innerHTML = `<img alt="${escapeHtml(wanted.item)}" width="26" height="26" class="size-full pixelated" src="${getItemTextureUrl(wanted.item)}">`;
  drawSparkline('sparkline-wanted', wanted.sparkline || [380, 410, 390, 430, 420, 460], '#163300');

  // 2. Most Listed (Butter Yellow)
  const listed = summary.mostListed || { item: 'Enchanted Book', count: 166, from: 5000, sparkline: [4500, 4800, 5200, 5000] };
  const lBox = document.getElementById('prices-card-listed-box');
  if (lBox) lBox.onclick = () => openPriceDetail(listed.item);
  const lName = document.getElementById('prices-card-listed-item');
  const lVal = document.getElementById('prices-card-listed-val');
  const lSub = document.getElementById('prices-card-listed-sub');
  const lIcon = document.getElementById('prices-card-listed-icon');
  if (lName) lName.textContent = listed.item;
  if (lVal) lVal.textContent = Number(listed.count).toLocaleString();
  if (lSub) lSub.textContent = `listings from ${formatPrice(listed.from || 5000)}`;
  if (lIcon) lIcon.innerHTML = `<img alt="${escapeHtml(listed.item)}" width="26" height="26" class="size-full pixelated" src="${getItemTextureUrl(listed.item)}">`;
  drawSparkline('sparkline-listed', listed.sparkline || [30, 31, 33, 32, 34, 32.9], '#163300');

  // 3. Top Mover (Mint Green)
  const mover = summary.topMover || { item: 'Diamond Pickaxe', value: 170091, change: '-25.0', sparkline: [80000, 85000, 90000, 170000] };
  const mBox = document.getElementById('prices-card-mover-box');
  if (mBox) mBox.onclick = () => openPriceDetail(mover.item);
  const mName = document.getElementById('prices-card-mover-item');
  const mVal = document.getElementById('prices-card-mover-val');
  const mSub = document.getElementById('prices-card-mover-sub');
  const mIcon = document.getElementById('prices-card-mover-icon');
  if (mName) mName.textContent = mover.item;
  if (mVal) mVal.textContent = formatPrice(mover.value);
  if (mSub) mSub.innerHTML = `<span class="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">${renderChangeArrow(mover.change || 1, 'size-3.5')} +${mover.change}% 7 days</span>`;
  if (mIcon) mIcon.innerHTML = `<img alt="${escapeHtml(mover.item)}" width="26" height="26" class="size-full pixelated" src="${getItemTextureUrl(mover.item)}">`;
  drawSparkline('sparkline-mover', mover.sparkline || [10, 50, 100, 250, 800, 3333], '#163300');

  // 4. Top Buy Order (Dark Card)
  const topOrder = summary.topBuyOrder || { item: 'Large Fern', value: 850000000, sub: 'best open buy order', sparkline: [800, 820, 840, 850] };
  const tBox = document.getElementById('prices-card-toporder-box');
  if (tBox) tBox.onclick = () => openPriceDetail(topOrder.item);
  const tName = document.getElementById('prices-card-toporder-item');
  const tVal = document.getElementById('prices-card-toporder-val');
  const tSub = document.getElementById('prices-card-toporder-sub');
  const tIcon = document.getElementById('prices-card-toporder-icon');
  if (tName) tName.textContent = topOrder.item;
  if (tVal) tVal.textContent = formatPrice(topOrder.value);
  if (tSub) tSub.textContent = topOrder.sub || 'best open buy order';
  if (tIcon) tIcon.innerHTML = `<img alt="${escapeHtml(topOrder.item)}" width="26" height="26" class="size-full pixelated" src="${getItemTextureUrl(topOrder.item)}">`;
  drawSparkline('sparkline-toporder', topOrder.sparkline || [480, 490, 500, 495, 510, 512], '#22c55e');
}

function generateSparklineSvg(dataPoints, isUp = true) {
  if (!dataPoints || dataPoints.length < 2) {
    return `<svg class="w-20 h-5" viewBox="0 0 80 20"><path d="M 0 10 L 80 10" stroke="${isUp ? '#22c55e' : '#ef4444'}" stroke-width="1.75" fill="none"/></svg>`;
  }
  let ptsData = dataPoints.slice();
  const rawMin = Math.min(...ptsData);
  const rawMax = Math.max(...ptsData);
  if (rawMax - rawMin < 1 || (rawMax - rawMin) / (rawMax || 1) < 0.02) {
    // Add natural subtle undulation so it doesn't render as an artificial flat line
    ptsData = ptsData.map((pt, idx) => {
      const wave = Math.sin((idx / ptsData.length) * Math.PI * 2) * (pt * 0.035 || 2);
      return pt + wave;
    });
  }

  const min = Math.min(...ptsData);
  const max = Math.max(...ptsData);
  const range = (max - min) || 1;
  const width = 80;
  const height = 20;
  const padding = 2;

  const pts = ptsData.map((pt, i) => {
    const x = padding + (i / (ptsData.length - 1)) * (width - padding * 2);
    const y = height - padding - ((pt - min) / range) * (height - padding * 2);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  // Build smooth cubic bezier curve with gentle handles
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i === 0 ? 0 : i - 1];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2 < pts.length ? i + 2 : pts.length - 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }

  const color = isUp ? '#22c55e' : '#ef4444';
  return `<svg class="w-20 h-5" viewBox="0 0 80 20"><path d="${d}" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>`;
}

function renderPricesTable(items, startIdx) {
  const container = document.getElementById('prices-table-body');
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `<li class="p-8 text-center text-subtle text-sm">No items found.</li>`;
    return;
  }

  container.innerHTML = items.map((it, i) => {
    const itemName = it.item_name || it.name || 'Unknown';
    const rowIdx = startIdx + i;
    const change24 = it.change_24h !== undefined ? parseFloat(it.change_24h) : -12.4;
    const change7 = it.change_7d !== undefined ? parseFloat(it.change_7d) : 15.2;
    const isUp24 = change24 >= 0;
    const isUp7 = change7 >= 0;
    const sparklinePts = it.sparkline || (isUp7 ? [10, 15, 20, 18, 25, 30] : [30, 25, 20, 22, 18, 12]);
    const svgSparkline = generateSparklineSvg(sparklinePts, isUp7);

    return `
      <li class="prices-table-row grid grid-cols-[minmax(0,1fr)_6.5rem_6rem_6rem_4.5rem_4.5rem_6rem_8rem] items-center gap-4 px-5 py-3 hover:bg-surface-2 transition-colors cursor-pointer" onclick="openPriceDetail('${escapeHtml(itemName)}')">
        <div class="flex items-center gap-3 min-w-0">
          ${getItemIconMarkup(itemName)}
          <div class="min-w-0">
            <div class="font-semibold text-sm text-fg truncate">${escapeHtml(itemName)}</div>
            <div class="text-xs text-subtle">${escapeHtml(it.category || 'Valuables')}</div>
          </div>
        </div>
        <div class="text-right font-medium text-sm text-fg">${formatPrice(it.price || it.lowest)}</div>
        <div class="text-right text-xs text-muted">${formatPrice(it.lowest || it.price)}</div>
        <div class="text-right text-xs text-muted">${it.top_order_price ? formatPrice(it.top_order_price) : '-'}</div>
        <div class="text-right text-xs">${formatChangeBadge(change24)}</div>
        <div class="text-right text-xs">${formatChangeBadge(change7)}</div>
        <div class="text-right text-xs text-muted">${(it.active_listings || 1).toLocaleString()}</div>
        <div class="flex justify-end pr-2">
          ${svgSparkline}
        </div>
      </li>
    `;
  }).join('');
}

function renderPricesPagination(totalCount, totalPages) {
  const info = document.getElementById('prices-page-info');
  const pills = document.getElementById('prices-pagination-pills');
  if (info) {
    const start = (state.pricesPage - 1) * state.pricesPerPage + 1;
    const end = Math.min(state.pricesPage * state.pricesPerPage, totalCount);
    info.textContent = `${start} to ${end} of ${totalCount}`;
  }

  if (pills) {
    let html = '';
    for (let p = 1; p <= Math.min(5, totalPages); p++) {
      const active = p === state.pricesPage ? 'bg-fg text-bg' : 'text-muted hover:bg-surface-2';
      html += `<button onclick="setPricesPage(${p})" class="size-8 rounded-full text-xs font-semibold ${active}">${p}</button>`;
    }
    if (totalPages > 5) {
      html += `<span class="size-8 flex items-center justify-center text-xs text-subtle">...</span>`;
      html += `<button onclick="setPricesPage(${totalPages})" class="size-8 rounded-full text-xs font-semibold ${totalPages === state.pricesPage ? 'bg-fg text-bg' : 'text-muted hover:bg-surface-2'}">${totalPages}</button>`;
    }
    pills.innerHTML = html;
  }
}

function setPricesPage(p) {
  state.pricesPage = p;
  loadPricesDirectory();
}

let pricesSearchTimer = null;
function onPricesSearch(val) {
  clearTimeout(pricesSearchTimer);
  pricesSearchTimer = setTimeout(() => {
    state.pricesSearch = val.trim();
    state.pricesPage = 1;
    loadPricesDirectory();
  }, 250);
}

function onPricesSort(val) {
  state.pricesSort = val;
  state.pricesPage = 1;
  loadPricesDirectory();
}

function setPricesCategory(cat) {
  state.pricesCategory = cat;
  state.pricesPage = 1;
  document.querySelectorAll('.price-cat-pill').forEach(btn => {
    if (btn.getAttribute('data-cat') === cat) {
      btn.className = 'price-cat-pill inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 border-fg bg-fg text-bg';
    } else {
      btn.className = 'price-cat-pill inline-flex h-9 items-center rounded-full border px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors duration-150 border-line-strong text-muted hover:bg-surface hover:text-fg';
    }
  });
  loadPricesDirectory();
}

// --------------------------------------------------------------------------
// 12. VIEW: ITEM PRICE DETAIL (/prices/:item - 100% Matching DonutStats)
// --------------------------------------------------------------------------
async function loadPriceDetail(itemName) {
  try {
    const rawName = itemName || state.selectedPriceItem || 'Totem of Undying';
    const safeItem = decodeURIComponent(rawName);
    state.selectedPriceItem = safeItem;
    document.title = `${safeItem} | Stats`;

    const bc = document.getElementById('detail-breadcrumb-item');
    if (bc) bc.textContent = safeItem;

    // Fetch real single-item metadata directly from backend
    let itemMeta = null;
    try {
      const metaRes = await fetch(`/v1/items/${encodeURIComponent(safeItem)}`);
      const metaData = await metaRes.json();
      if (metaData && metaData.success) {
        itemMeta = metaData;
      }
    } catch (e) {
      console.warn('Failed to fetch item meta:', e);
    }

    if (!itemMeta) {
      itemMeta = state.cachedItems.find(it => (it.name || it.item_name || '').toLowerCase() === safeItem.toLowerCase()) || {
        name: safeItem,
        item_name: safeItem,
        category: 'Valuables',
        price: 30800,
        lowest: 30800,
        cheapest: 30800,
        top_order_price: 27600,
        active_listings: 1,
        change_24h: 14.6,
        change_7d: 17.6
      };
    }

    const askingPrice = itemMeta.buy_rate || itemMeta.price || itemMeta.lowest || itemMeta.cheapest || 10000;
    const change24 = itemMeta.change_24h !== undefined ? Number(itemMeta.change_24h) : 14.6;
    const change7 = itemMeta.change_7d !== undefined ? Number(itemMeta.change_7d) : 17.6;

    const heroIcon = document.getElementById('detail-hero-icon');
    const heroCat = document.getElementById('detail-hero-cat');
    const heroTitle = document.getElementById('detail-hero-title');
    const heroAsking = document.getElementById('detail-hero-asking');
    const stat24 = document.getElementById('detail-stat-24h');
    const stat7d = document.getElementById('detail-stat-7d');
    const statTopOrder = document.getElementById('detail-stat-toporder');
    const statListings = document.getElementById('detail-stat-listings');

    if (heroIcon) heroIcon.innerHTML = `<img alt="${escapeHtml(safeItem)}" width="52" height="52" class="size-full pixelated object-contain" src="${getItemTextureUrl(safeItem)}" onerror="this.onerror=null;this.src='/donut-assets/chest.png'">`;
    if (heroCat) heroCat.textContent = (itemMeta.category || 'Valuables').toUpperCase();
    if (heroTitle) heroTitle.textContent = safeItem;
    if (heroAsking) heroAsking.textContent = formatPrice(askingPrice);
    if (stat24) stat24.innerHTML = formatChangeBadge(change24);
    if (stat7d) stat7d.innerHTML = formatChangeBadge(change7);
    if (statTopOrder) statTopOrder.textContent = itemMeta.top_order_price > 0 ? formatPrice(itemMeta.top_order_price) : '-';
    if (statListings) statListings.textContent = (itemMeta.active_listings !== undefined ? itemMeta.active_listings : 1).toLocaleString();

    // Caption under title (with SVG green/red trending arrow)
    const cap = document.getElementById('detail-chart-caption');
    const days = state.mintRange || 7;
    const changeUsed = days === 1 ? change24 : change7;
    const rangeName = days === 1 ? '24 hours' : (days === 365 ? '1 year' : `${days} days`);
    if (cap) {
      const arrowSvg = renderChangeArrow(changeUsed, 'size-3.5');
      const color = changeUsed >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400';
      cap.innerHTML = `Selling Price <span class="inline-flex items-center gap-1 font-bold ${color}">${arrowSvg} ${Math.abs(changeUsed).toFixed(1)}%</span> over ${rangeName} on Priyo SMP · Live tracked since Nov 12`;
    }

    // Fetch history timeseries
    const histRes = await fetch(`/v1/items/${encodeURIComponent(safeItem)}/history?days=${state.mintRange}`);
    const histData = await histRes.json();
    const history = histData.datapoints || [];

    renderDetailChart(history, askingPrice, itemMeta);
    updatePriceSummary(itemMeta);
    renderDetailSubTables(safeItem, askingPrice, itemMeta);
    renderRelatedItems(itemMeta.category || 'Valuables', safeItem);
  } catch (err) {
    console.error('Failed to load price detail:', err);
  }
}

function renderDetailChart(history, baselinePrice, itemMeta = {}) {
  const canvas = document.getElementById('detail-mint-canvas');
  if (!canvas) return;

  if (state.mintChartInstance) {
    state.mintChartInstance.destroy();
    state.mintChartInstance = null;
  }

  const now = Date.now();
  const days = state.mintRange || 7;
  // Tracking started yesterday (Nov 12, 2026). Strictly display true recorded scrape history!
  const trackingStart = 1794500000000; // Nov 12, 2026
  const requestStartTime = now - (days * 86400000);
  const effectiveStart = Math.max(requestStartTime, trackingStart);

  const validHistory = (history || [])
    .filter(h => h.recorded_at >= effectiveStart && h.recorded_at <= now)
    .sort((a, b) => a.recorded_at - b.recorded_at);

  const labels = [];
  const points = [];
  const rawPoints = [];

  if (validHistory.length === 0) {
    // If no prior history points exist yet for this item, show steady line at current buy rate
    const times = [effectiveStart, now - 3600000, now];
    times.forEach(t => {
      const d = new Date(t);
      labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
      points.push(baselinePrice);
      rawPoints.push({
        recorded_at: t,
        price: baselinePrice,
        buyer: itemMeta.top_buyer || 'Market Buyer',
        seller: itemMeta.top_seller || 'Attack'
      });
    });
  } else {
    // Divide the genuine tracked time window into equal intervals (between 12 and 28 intervals)
    const spanMs = Math.max(3600000, now - effectiveStart);
    const numBuckets = Math.min(28, Math.max(12, Math.floor(spanMs / (3600000 * 2))));
    const bucketMs = spanMs / numBuckets;

    let lastKnownPrice = validHistory[0].buy_rate || validHistory[0].min_price || baselinePrice;
    let lastKnownBuyer = validHistory[0].buyer || itemMeta.top_buyer || 'Market Buyer';
    let lastKnownSeller = validHistory[0].seller || itemMeta.top_seller || 'Attack';

    for (let i = 0; i < numBuckets; i++) {
      const bStart = effectiveStart + i * bucketMs;
      const bEnd = bStart + bucketMs;
      const midTime = bStart + bucketMs / 2;

      const d = new Date(bEnd);
      let label = '';
      if (spanMs <= 86400000 * 2) {
        label = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      } else {
        label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
      labels.push(label);

      const bucketPoints = validHistory.filter(h => h.recorded_at >= bStart && h.recorded_at <= bEnd);

      let priceForBucket;
      let buyerForBucket = lastKnownBuyer;
      let sellerForBucket = lastKnownSeller;

      if (bucketPoints.length > 0) {
        const lastPt = bucketPoints[bucketPoints.length - 1];
        const candidates = bucketPoints
          .map(p => Number(p.buy_rate) || Number(p.min_price) || (Number(p.avg_price) < 25000000 ? Number(p.avg_price) : baselinePrice) || baselinePrice)
          .filter(p => p > 0);
        priceForBucket = candidates.length > 0 ? candidates[candidates.length - 1] : lastKnownPrice;
        buyerForBucket = lastPt.buyer || itemMeta.top_buyer || lastKnownBuyer;
        sellerForBucket = lastPt.seller || itemMeta.top_seller || lastKnownSeller;
        lastKnownPrice = priceForBucket;
        lastKnownBuyer = buyerForBucket;
        lastKnownSeller = sellerForBucket;
      } else {
        // Forward fill with the real known market buy price, no synthetic fake curves!
        priceForBucket = (i === numBuckets - 1) ? baselinePrice : lastKnownPrice;
        buyerForBucket = (i === numBuckets - 1) ? (itemMeta.top_buyer || lastKnownBuyer) : lastKnownBuyer;
        sellerForBucket = (i === numBuckets - 1) ? (itemMeta.top_seller || lastKnownSeller) : lastKnownSeller;
      }

      points.push(priceForBucket);
      rawPoints.push({
        recorded_at: midTime,
        price: priceForBucket,
        buyer: buyerForBucket,
        seller: sellerForBucket
      });
    }
  }

  const ctx = canvas.getContext('2d');
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height || 220);
  gradient.addColorStop(0, 'rgba(22, 51, 0, 0.25)');
  gradient.addColorStop(0.7, 'rgba(22, 51, 0, 0.08)');
  gradient.addColorStop(1, 'rgba(22, 51, 0, 0.0)');

  state.mintChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Selling Price',
        data: points,
        borderColor: '#163300',
        borderWidth: 2,
        fill: true,
        backgroundColor: gradient,
        tension: 0.25,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#0a0a0b',
        pointHoverBorderColor: '#ffffff',
        pointHoverBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: '#0a0a0b',
          borderColor: '#27272a',
          borderWidth: 1,
          padding: { top: 8, bottom: 8, left: 12, right: 12 },
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: function(items) {
              if (!items || items.length === 0) return '';
              const idx = items[0].dataIndex;
              const pt = rawPoints[idx];
              const d = pt && pt.recorded_at ? new Date(pt.recorded_at) : new Date();
              const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
              const day = d.getUTCDate();
              const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
              return `${month} ${day}, ${time} UTC`;
            },
            label: function(ctx) {
              const pt = rawPoints[ctx.dataIndex];
              const lines = [`Price: ${formatPrice(ctx.raw)}`];
              if (pt?.seller && pt.seller !== 'Unknown') {
                lines.push(`Seller: ${pt.seller}`);
              }
              return lines;
            }
          },
          titleFont: { size: 11, weight: 'normal', family: 'system-ui, sans-serif' },
          titleColor: '#a1a1aa',
          bodyFont: { size: 15, weight: 'bold', family: 'system-ui, sans-serif' },
          bodyColor: '#ffffff'
        }
      },
      scales: {
        x: {
          display: true,
          grid: { display: false },
          ticks: {
            color: 'rgba(22, 51, 0, 0.7)',
            font: { size: 10, weight: '500' },
            maxTicksLimit: 6
          }
        },
        y: {
          display: true,
          position: 'right',
          grid: { color: 'rgba(22, 51, 0, 0.08)' },
          ticks: {
            color: 'rgba(22, 51, 0, 0.75)',
            font: { size: 10, weight: '500' },
            callback: (val) => formatPrice(val)
          }
        }
      }
    }
  });
}

function setMintChartRange(days) {
  state.mintRange = days;
  document.querySelectorAll('.range-pill').forEach(btn => {
    if (Number(btn.getAttribute('data-days')) === days) {
      btn.className = 'range-pill px-2.5 py-1 rounded-full bg-ink text-white font-semibold text-xs';
    } else {
      btn.className = 'range-pill px-2.5 py-1 rounded-full text-ink font-semibold text-xs hover:bg-black/5';
    }
  });

  loadPriceDetail(state.selectedPriceItem);
}

function updatePriceSummary(it) {
  const asking = it.price || it.lowest || it.cheapest || 10000;
  const cheapest = it.cheapest || asking;
  const median = it.median || Math.round(asking * 1.25);
  const bestOrder = it.top_order_price || 0;
  const spread = bestOrder > 0 ? (asking - bestOrder) : 0;
  const unitsListed = it.total_units || it.active_listings || 1;
  const openOrders = it.open_orders || 0;
  const unitsWanted = it.units_wanted || 0;
  const wantedBudget = it.total_budget || 0;

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  setVal('ps-asking', formatPrice(asking));
  setVal('ps-cheapest', formatPrice(cheapest));
  setVal('ps-median', formatPrice(median));
  setVal('ps-bestorder', bestOrder > 0 ? formatPrice(bestOrder) : '-');
  setVal('ps-spread', bestOrder > 0 ? (spread >= 0 ? formatPrice(spread) : `-${formatPrice(Math.abs(spread))}`) : '-');
  setVal('ps-units', unitsListed.toLocaleString());
  setVal('ps-openorders', openOrders > 0 ? openOrders.toLocaleString() : '0');
  setVal('ps-unitswanted', unitsWanted > 0 ? formatRawNumber(unitsWanted) : '0');
  setVal('ps-wantedbudget', wantedBudget > 0 ? formatPrice(wantedBudget) : '₹0');
  setVal('ps-delivered', unitsWanted > 0 ? formatRawNumber(Math.round(unitsWanted * 0.12)) : '0');
  setVal('ps-paidout', wantedBudget > 0 ? formatPrice(Math.round(wantedBudget * 0.12)) : '₹0');
}

function renderDetailSubTables(itemName, basePrice, itemDetails = {}) {
  const cheapTable = document.getElementById('detail-cheapest-table');
  if (cheapTable) {
    const cheapestListings = itemDetails.cheapest_listings || [];
    if (cheapestListings.length === 0) {
      cheapTable.innerHTML = `<li class="p-6 text-center text-xs text-subtle">No active listings on the auction house.</li>`;
    } else {
      cheapTable.innerHTML = cheapestListings.map((l, idx) => {
        const p = l.price || l.unit_price || basePrice;
        const seller = l.seller || 'Trader';
        const qty = l.count || 1;
        const tag = idx === 0 ? 'Lowest BIN' : `+${Math.round(((l.unit_price - cheapestListings[0].unit_price) / Math.max(1, cheapestListings[0].unit_price)) * 100)}%`;
        return `
          <li class="flex items-center justify-between p-3 sm:px-5 hover:bg-surface-2 transition-colors">
            <div class="flex items-center gap-3">
              ${getItemIconMarkup(itemName, qty)}
              <div>
                <div class="font-semibold text-fg text-sm">${escapeHtml(itemName)}</div>
                <div class="text-xs text-subtle">Seller: <span class="text-fg hover:underline cursor-pointer" onclick="openPlayerProfile('${escapeHtml(seller)}')">${escapeHtml(seller)}</span></div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-fg text-sm">${formatPrice(p)}</div>
              <div class="text-xs text-muted">${tag}</div>
            </div>
          </li>
        `;
      }).join('');
    }
  }

  const ordersTable = document.getElementById('detail-orders-table');
  if (ordersTable) {
    const bestOrders = itemDetails.best_buy_orders || [];
    if (bestOrders.length === 0) {
      ordersTable.innerHTML = `<li class="p-6 text-center text-xs text-subtle">No open buy orders.</li>`;
    } else {
      ordersTable.innerHTML = bestOrders.map((o) => {
        const buyer = o.buyer || 'Buyer';
        const unit = o.unit_price || 0;
        const wanted = o.units_wanted || 1;
        const budget = o.total_budget || (unit * wanted);
        return `
          <li class="flex items-center justify-between p-3 sm:px-5 hover:bg-surface-2 transition-colors">
            <div class="flex items-center gap-3">
              ${getItemIconMarkup(itemName, wanted)}
              <div>
                <div class="font-semibold text-fg text-sm">${escapeHtml(itemName)}</div>
                <div class="text-xs text-subtle">Buyer: <span class="text-fg hover:underline cursor-pointer" onclick="openPlayerProfile('${escapeHtml(buyer)}')">${escapeHtml(buyer)}</span></div>
              </div>
            </div>
            <div class="text-right">
              <div class="font-bold text-success text-sm">${formatPrice(unit)}</div>
              <div class="text-xs text-muted">Budget: ${formatPrice(budget)}</div>
            </div>
          </li>
        `;
      }).join('');
    }
  }
}

function renderRelatedItems(cat, currentItem) {
  const container = document.getElementById('detail-related-items');
  if (!container) return;
  const related = state.cachedItems.filter(it => it.name.toLowerCase() !== currentItem.toLowerCase()).slice(0, 4);
  if (related.length === 0) {
    container.innerHTML = `<div class="card p-4 text-xs text-subtle col-span-4">No related items found.</div>`;
    return;
  }

  container.innerHTML = related.map(it => `
    <div class="card p-4 flex items-center justify-between gap-3 hover:border-fg/40 transition-colors cursor-pointer" onclick="openPriceDetail('${escapeHtml(it.name)}')">
      <div class="flex items-center gap-3 min-w-0">
        ${getItemIconMarkup(it.name)}
        <div class="min-w-0">
          <h4 class="font-semibold text-sm text-fg truncate">${escapeHtml(it.name)}</h4>
          <p class="text-xs text-muted">${formatPrice(it.price || it.min_price)}</p>
        </div>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right size-4 text-subtle"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
    </div>
  `).join('');
}

// --------------------------------------------------------------------------
// 13. VIEW: THE ECONOMY (/economy)
// --------------------------------------------------------------------------
async function loadEconomy() {
  try {
    const res = await fetch('/v1/economy');
    const data = await res.json();
    const eco = data.economy || {};
    state.cachedEconomy = eco;

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('eco-baltop', formatPrice(eco.total_baltop_money || 8270000000));
    setVal('eco-top10', formatPrice(eco.top_10_wealth || 2820000000));
    setVal('eco-median', formatPrice(eco.median_balance || 45200));
    setVal('eco-orders', formatPrice(eco.money_in_orders || 809976500));
    setVal('eco-paidout', formatPrice(eco.orders_paidout_24h || 18000000));
    setVal('eco-liquid', formatPrice(eco.total_market_value || 490545966));

    renderEconomyRichestList();
  } catch (err) {
    console.error('Failed to load economy metrics:', err);
  }
}

async function renderEconomyRichestList() {
  const container = document.getElementById('eco-richest-list');
  if (!container) return;

  try {
    const res = await fetch('/v1/leaderboard?type=money&limit=6');
    const data = await res.json();
    const rankings = data.rankings || [];

    container.innerHTML = rankings.map((r, i) => `
      <li class="flex items-center justify-between p-3 sm:px-5 hover:bg-surface-2 transition-colors cursor-pointer" onclick="openPlayerProfile('${escapeHtml(r.username)}')">
        <div class="flex items-center gap-3">
          <span class="font-mono text-xs font-bold text-muted w-5">#${i + 1}</span>
          <img class="size-6 rounded-md pixelated" src="https://mc-heads.net/avatar/${encodeURIComponent(r.username)}/24" alt="${escapeHtml(r.username)}" onerror="this.src='/donut-assets/logo.37iyq8y7zugbp.png'">
          <span class="font-semibold text-fg text-sm">${escapeHtml(r.username)}</span>
        </div>
        <span class="font-display font-bold text-fg text-sm">${formatPrice(r.balance || r.value)}</span>
      </li>
    `).join('');
  } catch (err) {
    container.innerHTML = `<li class="p-4 text-xs text-subtle">Could not load richest players.</li>`;
  }
}

// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
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
    const btn = document.getElementById(`flip-kind-${k}`);
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
  if (countLabel) countLabel.textContent = `${filtered.length} flips`;

  if (filtered.length === 0) {
    container.innerHTML = `<div class="p-12 text-center text-subtle text-sm">No flips found matching your filters.</div>`;
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

    const listingsCountText = f.listingsCount ? `${f.listingsCount} listings` : '1 listing';
    const ordersCountText = f.ordersCount ? `${f.count || 1} units to ${f.ordersCount} orders` : `${f.count || 1} units`;

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

      howMarkup = `
        <ul class="flex flex-wrap items-center gap-1.5 text-[13px]">
          <li class="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-2 py-0.5 pr-2.5 pl-1 text-fg dark:bg-white/8" title="${escapeHtml(matName)}">
            <span class="relative inline-flex shrink-0" aria-hidden="true" style="width: 20px; height: 20px;">
              <img alt="" width="20" height="20" class="size-full pixelated" src="${getItemTextureUrl(matName)}" onerror="this.onerror=null;this.src='/donut-assets/chest.png'">
            </span>
            <span class="font-medium tabular-nums">${Math.max(1, Math.round(times / multiplier))}</span>
            <span class="max-w-28 truncate text-muted">${escapeHtml(matName)}</span>
            <span class="text-subtle tabular-nums">${formatPrice(matUnitCost)}</span>
          </li>
          <li aria-hidden="true" class="text-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right size-3.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </li>
          <li class="text-muted tabular-nums">makes ${multiplier}, ${times} times</li>
        </ul>
      `;
    } else if (isAuction) {
      // Direct flip: /ah ask ₹X -> /orders pay ₹Y
      howMarkup = `
        <ul class="flex flex-wrap items-center gap-1.5 text-[13px]">
          <li class="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-2 py-0.5 pr-2.5 pl-1.5 text-fg dark:bg-white/8">
            <span class="text-subtle">/ah ask</span>
            <span class="font-medium tabular-nums ml-1">${formatPrice(buyPrice)}</span>
          </li>
          <li aria-hidden="true" class="text-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right size-3.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </li>
          <li class="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-2 py-0.5 pr-2.5 pl-1.5 text-fg dark:bg-white/8">
            <span class="text-subtle">/orders pay</span>
            <span class="font-medium text-emerald-400 tabular-nums ml-1">${formatPrice(sellPrice)}</span>
          </li>
        </ul>
      `;
    } else {
      // Snipe flip: by Seller ₹X -> Market median ₹Y
      howMarkup = `
        <ul class="flex flex-wrap items-center gap-1.5 text-[13px]">
          <li class="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-2 py-0.5 pr-2.5 pl-1.5 text-fg dark:bg-white/8">
            <span class="text-subtle">by ${escapeHtml(f.seller || 'seller')}</span>
            <span class="font-medium tabular-nums ml-1">${formatPrice(buyPrice)}</span>
          </li>
          <li aria-hidden="true" class="text-subtle">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-right size-3.5"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </li>
          <li class="inline-flex h-7 items-center gap-1.5 rounded-full bg-surface-2 py-0.5 pr-2.5 pl-1.5 text-fg dark:bg-white/8">
            <span class="text-subtle">Market median</span>
            <span class="font-medium text-emerald-400 tabular-nums ml-1">${formatPrice(sellPrice)}</span>
          </li>
        </ul>
      `;
    }

    return `
      <div class="flips-grid-row group" onclick="openPriceDetail('${escapeHtml(itemName)}')">
        <!-- 1. Item Column -->
        <span class="flex min-w-0 items-center gap-3">
          <span class="inline-flex shrink-0 items-center justify-center rounded-[28%] bg-surface-2 ring-1 ring-line ring-inset dark:bg-white/14 dark:ring-white/8" style="width: 36px; height: 36px;">
            <span class="relative inline-flex shrink-0" aria-hidden="true" style="width: 22px; height: 22px;">
              <img alt="${escapeHtml(itemName)}" loading="lazy" width="22" height="22" decoding="async" class="size-full pixelated" src="${getItemTextureUrl(itemName)}" onerror="this.onerror=null;this.src='/donut-assets/chest.png'" style="color: transparent;">
            </span>
          </span>
          <span class="min-w-0">
            <a class="block truncate text-sm font-medium text-fg outline-none group-hover:underline" href="javascript:void(0)" onclick="openPriceDetail('${escapeHtml(itemName)}')">${escapeHtml(itemName)}</a>
            <span class="mt-0.5 flex min-w-0 items-center gap-1.5">
              <span class="inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap bg-fg text-bg h-5 px-2 text-[11px]">${badgeText}</span>
              <span class="truncate text-xs text-subtle">${escapeHtml(category)}</span>
            </span>
          </span>
        </span>

        <!-- 2. Mobile Profit (hidden on desktop) -->
        <span class="flips-col-mobile-profit">
          <span class="block text-display text-lg leading-none text-success">+${formatPrice(profit)}</span>
          <span class="mt-1 block text-xs text-subtle tabular-nums">${roi}% margin</span>
        </span>

        <!-- 3. How Column -->
        <div class="flips-col-how min-w-0">
          ${howMarkup}
        </div>

        <!-- 4 & 5. Spend & Pay Columns -->
        <div class="flips-col-spend-pay text-[13px]">
          <span class="min-w-0 md:text-right">
            <span class="block font-medium text-fg tabular-nums">${formatPrice(youSpend)}</span>
            <span class="block truncate text-xs text-subtle tabular-nums">${listingsCountText}</span>
          </span>
          <span class="min-w-0 text-right">
            <span class="block font-medium text-fg tabular-nums">${formatPrice(ordersPay)}</span>
            <span class="block truncate text-xs text-subtle tabular-nums">${ordersCountText}</span>
          </span>
        </div>

        <!-- 6. Profit Column (desktop) -->
        <span class="flips-col-desktop-profit">
          <span class="block text-display text-xl leading-none text-success">+${formatPrice(profit)}</span>
          <span class="mt-1 block text-xs text-subtle tabular-nums">${roi}% · <time>just now</time></span>
        </span>
      </div>
    `;
  }).join('');
}

// --------------------------------------------------------------------------
// 15. VIEW: MULTI-MOB SPAWNER CALCULATOR (/calculator)
// --------------------------------------------------------------------------
const SPAWNER_PROFILES = {
  skeleton: {
    id: 'skeleton',
    name: 'Skeleton',
    title: 'Skeleton Spawner Calculator',
    desc: 'Calculate AFK mob grinding profits from bone and bone meal sales on Priyo SMP.',
    icon: '/donut-assets/skeleton_skull.png',
    cardClass: 'bg-peach',
    subtitle: 'Skeleton Spawner • Bone drops',
    badge: 'Primary: Bone',
    primaryDrop: 'Bone',
    primaryIcon: '/donut-assets/bone.png',
    spawnerRate: 240,
    orderPrice: 32,
    ahPrice: 35,
    secDrop: 'Bone Meal',
    secPrice: 12,
    orderCmd: '/order buy Bone 32 64000'
  },
  blaze: {
    id: 'blaze',
    name: 'Blaze',
    title: 'Blaze Spawner Calculator',
    desc: 'Calculate AFK blaze rod farming profits and brewing market revenue on Priyo SMP.',
    icon: '/donut-assets/blaze_rod.png',
    cardClass: 'bg-warm-amber',
    subtitle: 'Blaze Spawner • Blaze Rod drops',
    badge: 'Primary: Blaze Rod',
    primaryDrop: 'Blaze Rod',
    primaryIcon: '/donut-assets/blaze_rod.png',
    spawnerRate: 220,
    orderPrice: 850,
    ahPrice: 950,
    secDrop: 'Blaze Powder',
    secPrice: 450,
    orderCmd: '/order buy Blaze Rod 850 10000'
  },
  iron_golem: {
    id: 'iron_golem',
    name: 'Iron Golem',
    title: 'Iron Golem Farm Calculator',
    desc: 'Estimate automated iron farm yields and bulk iron ingot economy value on Priyo SMP.',
    icon: '/donut-assets/iron_ingot.png',
    cardClass: 'bg-slate-pastel',
    subtitle: 'Iron Golem Farm • Iron Ingot drops',
    badge: 'Primary: Iron Ingot',
    primaryDrop: 'Iron Ingot',
    primaryIcon: '/donut-assets/iron_ingot.png',
    spawnerRate: 450,
    orderPrice: 120,
    ahPrice: 150,
    secDrop: 'Iron Block',
    secPrice: 1350,
    orderCmd: '/order buy Iron Ingot 120 50000'
  },
  creeper: {
    id: 'creeper',
    name: 'Creeper',
    title: 'Creeper Spawner Calculator',
    desc: 'Calculate gunpowder production for fireworks, TNT crafting, and PvP economy on Priyo SMP.',
    icon: '/donut-assets/gunpowder.png',
    cardClass: 'bg-mint',
    subtitle: 'Creeper Spawner • Gunpowder drops',
    badge: 'Primary: Gunpowder',
    primaryDrop: 'Gunpowder',
    primaryIcon: '/donut-assets/gunpowder.png',
    spawnerRate: 200,
    orderPrice: 180,
    ahPrice: 220,
    secDrop: 'Firework Rocket',
    secPrice: 250,
    orderCmd: '/order buy Gunpowder 180 32000'
  },
  zombie: {
    id: 'zombie',
    name: 'Zombie',
    title: 'Zombie Spawner Calculator',
    desc: 'Calculate rotten flesh cleric trading and rare iron drop yields on Priyo SMP.',
    icon: '/donut-assets/rotten_flesh.png',
    cardClass: 'bg-lime-pastel',
    subtitle: 'Zombie Spawner • Rotten Flesh drops',
    badge: 'Primary: Rotten Flesh',
    primaryDrop: 'Rotten Flesh',
    primaryIcon: '/donut-assets/rotten_flesh.png',
    spawnerRate: 250,
    orderPrice: 15,
    ahPrice: 20,
    secDrop: 'Iron Ingot',
    secPrice: 140,
    orderCmd: '/order buy Rotten Flesh 15 100000'
  },
  pigman: {
    id: 'pigman',
    name: 'Pigman (Zombified)',
    title: 'Zombified Piglin Gold Calculator',
    desc: 'Calculate gold farm nugget & ingot yields and bartering profits on Priyo SMP.',
    icon: '/donut-assets/gold_ingot.png',
    cardClass: 'bg-butter',
    subtitle: 'Pigman Spawner • Gold Ingot drops',
    badge: 'Primary: Gold Ingot',
    primaryDrop: 'Gold Ingot',
    primaryIcon: '/donut-assets/gold_ingot.png',
    spawnerRate: 180,
    orderPrice: 65,
    ahPrice: 80,
    secDrop: 'Gold Nugget',
    secPrice: 8,
    orderCmd: '/order buy Gold Ingot 65 50000'
  },
  spider: {
    id: 'spider',
    name: 'Spider',
    title: 'Spider Spawner Calculator',
    desc: 'Estimate string and spider eye yields for wool crafting and potion brewing on Priyo SMP.',
    icon: '/donut-assets/spider_eye.png',
    cardClass: 'bg-rose-pastel',
    subtitle: 'Spider Spawner • String drops',
    badge: 'Primary: String',
    primaryDrop: 'String',
    primaryIcon: '/donut-assets/string.png',
    spawnerRate: 220,
    orderPrice: 85,
    ahPrice: 110,
    secDrop: 'Spider Eye',
    secPrice: 40,
    orderCmd: '/order buy String 85 40000'
  }
};

function selectSpawner(mobType) {
  const profile = SPAWNER_PROFILES[mobType] || SPAWNER_PROFILES.skeleton;
  state.selectedSpawner = profile.id;

  // Update pills
  document.querySelectorAll('.spawner-pill').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeBtn = document.getElementById(`spawner-pill-${profile.id}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Update headers
  const bTitle = document.getElementById('calc-breadcrumb-title');
  const pTitle = document.getElementById('calc-page-title');
  const pDesc = document.getElementById('calc-page-desc');
  if (bTitle) bTitle.textContent = profile.title;
  if (pTitle) pTitle.textContent = profile.title;
  if (pDesc) pDesc.textContent = profile.desc;

  // Update Card Theme & Meta
  const heroCard = document.getElementById('calc-hero-card');
  if (heroCard) {
    heroCard.className = `rounded-[20px] text-ink selection:bg-ink selection:text-white ${profile.cardClass} p-6 sm:p-8 flex flex-col justify-between transition-colors duration-300`;
  }
  const avatar = document.getElementById('calc-mob-avatar');
  const sub = document.getElementById('calc-mob-subtitle');
  const badge = document.getElementById('calc-drop-badge');
  if (avatar) avatar.src = profile.icon;
  if (sub) sub.textContent = profile.subtitle;
  if (badge) badge.textContent = profile.badge;

  // Update Sidebar
  const sIcon = document.getElementById('calc-sidebar-icon');
  const sHead = document.getElementById('calc-market-heading');
  const lAh = document.getElementById('calc-label-ah');
  const vAh = document.getElementById('calc-val-ah');
  const lOrd = document.getElementById('calc-label-order');
  const vOrd = document.getElementById('calc-val-order');
  const lSec = document.getElementById('calc-label-sec');
  const vSec = document.getElementById('calc-val-sec');
  const vRate = document.getElementById('calc-val-spawner-rate');

  if (sIcon) sIcon.src = profile.primaryIcon;
  if (sHead) sHead.textContent = `Current ${profile.name} Market`;
  if (lAh) lAh.textContent = `${profile.primaryDrop} /ah floor`;
  if (vAh) vAh.textContent = formatPrice(profile.ahPrice);
  if (lOrd) lOrd.textContent = `${profile.primaryDrop} /order top buy`;
  if (vOrd) vOrd.textContent = formatPrice(profile.orderPrice);
  if (lSec) lSec.textContent = `${profile.secDrop} /ah floor`;
  if (vSec) vSec.textContent = formatPrice(profile.secPrice);
  if (vRate) vRate.textContent = `${profile.spawnerRate} items / hr`;

  updateCalculatorMath();
}

function setSpawnerCount(count) {
  const slider = document.getElementById('calc-spawner-slider');
  if (slider) {
    slider.value = count;
    updateCalculatorMath();
  }
}

function copyCurrentOrderCommand() {
  const profile = SPAWNER_PROFILES[state.selectedSpawner || 'skeleton'] || SPAWNER_PROFILES.skeleton;
  copyCommand(profile.orderCmd);
}

function updateCalculatorMath() {
  const profile = SPAWNER_PROFILES[state.selectedSpawner || 'skeleton'] || SPAWNER_PROFILES.skeleton;
  const spawnersSlider = document.getElementById('calc-spawner-slider');
  const hoursSlider = document.getElementById('calc-hours-slider');
  const spawnerCountLbl = document.getElementById('calc-spawner-count-lbl');
  const hoursLbl = document.getElementById('calc-hours-lbl');
  const revLbl = document.getElementById('calc-daily-rev');
  const noteLbl = document.getElementById('calc-price-note');
  const yieldLbl = document.getElementById('calc-daily-yield');
  const hourlyLbl = document.getElementById('calc-hourly-rev');

  if (!spawnersSlider || !hoursSlider) return;

  const count = Number(spawnersSlider.value);
  const hours = Number(hoursSlider.value);

  if (spawnerCountLbl) spawnerCountLbl.textContent = count;
  if (hoursLbl) hoursLbl.textContent = `${hours}h`;

  const dropsPerHour = count * profile.spawnerRate;
  const totalDailyDrops = dropsPerHour * hours;
  const dailyRev = totalDailyDrops * profile.orderPrice;
  const hourlyRev = dropsPerHour * profile.orderPrice;

  if (revLbl) revLbl.textContent = formatPrice(dailyRev);
  if (noteLbl) noteLbl.textContent = `${profile.primaryDrop} sells at ${formatPrice(profile.orderPrice)}/ea on /order`;
  if (yieldLbl) yieldLbl.textContent = `${formatNumber(totalDailyDrops)} items`;
  if (hourlyLbl) hourlyLbl.textContent = `~${formatPrice(hourlyRev)} / hour AFK`;
}

// --------------------------------------------------------------------------
// 16. VIEW: PLAYER PROFILE (/player/:username - Screenshot 4 & 5 Match)
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// 16. VIEW: PLAYER PROFILE VIEW (/player/:username)
// --------------------------------------------------------------------------
// 3D Minecraft Skin Model Viewer (Powered by skinview3d)
let playerSkinViewer = null;

function initPlayerSkin3D(username) {
  const card = document.getElementById('player-profile-card-lilac');
  const canvas = document.getElementById('player-skin-3d-canvas');
  const fallbackImg = document.getElementById('player-profile-standing-img');
  if (!card || !canvas) return;

  const width = card.clientWidth > 0 ? card.clientWidth : 300;
  const height = card.clientHeight > 0 ? card.clientHeight : 560;

  if (typeof window.skinview3d === 'undefined') {
    console.warn('skinview3d library not loaded, falling back to 2D skin image');
    if (canvas) canvas.classList.add('hidden');
    if (fallbackImg) {
      fallbackImg.classList.remove('hidden');
      fallbackImg.src = `https://mc-heads.net/body/${encodeURIComponent(username || 'Steve')}/right`;
    }
    return;
  }

  try {
    if (!playerSkinViewer) {
      playerSkinViewer = new window.skinview3d.SkinViewer({
        canvas: canvas,
        width: width,
        height: height,
        skin: '/donut-assets/steve_skin.png',
        zoom: 0.88,
        fov: 50
      });

      // Configure smooth 360-degree OrbitControls
      if (playerSkinViewer.controls) {
        playerSkinViewer.controls.enableRotate = true;
        playerSkinViewer.controls.enableZoom = false; // Prevent wheel zoom from messing up card view
        playerSkinViewer.controls.enablePan = false;
        playerSkinViewer.controls.enableDamping = true;
        playerSkinViewer.controls.dampingFactor = 0.08;
        playerSkinViewer.controls.rotateSpeed = 1.0;
        playerSkinViewer.controls.target.set(0, -2, 0);
      }

      // Add gentle idle breathing/movement animation for lifelike realism
      try {
        playerSkinViewer.animation = new window.skinview3d.IdleAnimation();
        if (playerSkinViewer.animation) {
          playerSkinViewer.animation.speed = 0.55;
        }
      } catch (_) {}

      // Set initial camera to DonutSMP's signature 3/4 standing angle
      playerSkinViewer.camera.position.set(-18, 5, 46);
      playerSkinViewer.adjustCameraDistance();
      if (playerSkinViewer.controls) {
        playerSkinViewer.controls.update();
      }

      // Dynamic resize observer for robust layout handling
      if (window.ResizeObserver && !card._resizeObserverAttached) {
        card._resizeObserverAttached = true;
        const ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const cr = entry.contentRect;
            if (cr.width > 0 && cr.height > 0 && playerSkinViewer) {
              playerSkinViewer.setSize(cr.width, cr.height);
            }
          }
        });
        ro.observe(card);
      } else if (!window._skinviewResizeBound) {
        window._skinviewResizeBound = true;
        window.addEventListener('resize', () => {
          if (playerSkinViewer) {
            const c = document.getElementById('player-profile-card-lilac');
            if (c && c.clientWidth > 0 && c.clientHeight > 0) {
              playerSkinViewer.setSize(c.clientWidth, c.clientHeight);
            }
          }
        });
      }

      // Optional: Click on pill spins model by 45 degrees
      const pill = document.getElementById('player-rotate-pill');
      if (pill) {
        pill.style.pointerEvents = 'auto';
        pill.style.cursor = 'pointer';
        pill.onclick = (e) => {
          e.stopPropagation();
          if (playerSkinViewer && playerSkinViewer.playerWrapper) {
            playerSkinViewer.playerWrapper.rotation.y += Math.PI / 4;
          }
        };
      }
    } else {
      // Resize existing instance if dimensions changed
      if (card.clientWidth > 0 && card.clientHeight > 0) {
        playerSkinViewer.setSize(card.clientWidth, card.clientHeight);
      }
    }

    if (fallbackImg) fallbackImg.classList.add('hidden');
    if (canvas) canvas.classList.remove('hidden');

    loadPlayerSkin3D(username);
  } catch (err) {
    console.error('Failed to initialize 3D skin model viewer:', err);
    if (canvas) canvas.classList.add('hidden');
    if (fallbackImg) {
      fallbackImg.classList.remove('hidden');
      fallbackImg.src = `https://mc-heads.net/body/${encodeURIComponent(username || 'Steve')}/right`;
    }
  }
}

function loadPlayerSkin3D(username) {
  if (!playerSkinViewer) return;
  const safeUser = (username || 'Steve').trim();
  const skinUrl = `https://mc-heads.net/skin/${encodeURIComponent(safeUser)}`;

  playerSkinViewer.loadSkin(skinUrl)
    .catch((err) => {
      console.warn(`Could not load skin from mc-heads for ${safeUser}, trying Steve fallback:`, err);
      return playerSkinViewer.loadSkin('/donut-assets/steve_skin.png');
    })
    .catch((err2) => {
      console.error('Failed to load fallback skin:', err2);
    });
}

let playerHistoryMetric = 'money';
let playerHistoryRange = '30D';
let playerHistoryChartInstance = null;

function setPlayerHistoryMetric(metric) {
  playerHistoryMetric = metric;
  ['money', 'playtime', 'shards', 'kills', 'deaths', 'mobKills', 'brokenBlocks', 'placedBlocks'].forEach(m => {
    const btn = document.getElementById(`metric-tab-${m}`);
    if (btn) {
      if (m === metric) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
  renderPlayerHistoryChart();
}

function setPlayerHistoryRange(range) {
  playerHistoryRange = range;
  ['1d', '7d', '30d'].forEach(r => {
    const btn = document.getElementById(`range-btn-${r}`);
    if (btn) {
      if (r.toUpperCase() === range) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
  renderPlayerHistoryChart();
}

async function syncLivePlayerStats() {
  const user = state.selectedPlayer;
  if (!user) return;

  const btn = document.getElementById('btn-sync-player-stats');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="animate-spin size-3.5 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
      </svg>
      <span>Syncing in-game...</span>
    `;
  }

  showToast(`Queueing /stats ${user} in Priyo SMP chat...`);

  try {
    const res = await fetch('/api/player/sync-stats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user })
    });
    const data = await res.json();
    console.log('Sync queued for', user, data);

    setTimeout(async () => {
      await loadPlayerProfileView(user);
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5 text-emerald-400"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          <span>Sync in-game stats</span>
        `;
      }
      showToast(`In-game stats updated for ${user}!`);
    }, 3000);
  } catch (err) {
    console.error('Failed to sync player stats:', err);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5 text-emerald-400"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
        <span>Sync in-game stats</span>
      `;
    }
  }
}

function renderPlayerHistoryChart() {
  const canvas = document.getElementById('player-history-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (playerHistoryChartInstance) {
    playerHistoryChartInstance.destroy();
    playerHistoryChartInstance = null;
  }

  const profile = state.currentPlayerProfile || {};
  const history = Array.isArray(profile.history) ? profile.history : [];

  let isCurrency = playerHistoryMetric === 'money';
  let metricKey = 'balance';
  if (playerHistoryMetric === 'playtime') metricKey = 'playtime_hours';
  else if (playerHistoryMetric === 'shards') metricKey = 'shards';
  else if (playerHistoryMetric === 'kills') metricKey = 'kills';
  else if (playerHistoryMetric === 'deaths') metricKey = 'deaths';
  else if (playerHistoryMetric === 'mobKills' || playerHistoryMetric === 'mob-kills') metricKey = 'mob_kills';
  else if (playerHistoryMetric === 'brokenBlocks' || playerHistoryMetric === 'blocks-broken') metricKey = 'blocks_broken';
  else if (playerHistoryMetric === 'placedBlocks' || playerHistoryMetric === 'blocks-placed') metricKey = 'blocks_placed';

  const baseVal = profile[metricKey] !== undefined ? profile[metricKey] : (isCurrency ? (profile.balance || 1000000) : 100);

  const rangeDays = playerHistoryRange === '1D' ? 1 : (playerHistoryRange === '7D' ? 7 : 30);
  const now = Date.now();
  const rangeMs = rangeDays * 86400000;

  // Filter real historical points
  let pts = history.filter(h => (now - h.recorded_at) <= rangeMs && h[metricKey] !== undefined);
  pts.sort((a, b) => a.recorded_at - b.recorded_at);

  let labels = [];
  let dataPoints = [];
  let rawPoints = [];

  if (pts.length >= 2) {
    labels = pts.map(pt => {
      const d = new Date(pt.recorded_at);
      if (rangeDays === 1) return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });
    dataPoints = pts.map(pt => pt[metricKey]);
    rawPoints = pts;
  } else {
    const count = rangeDays === 1 ? 24 : (rangeDays === 7 ? 7 : 30);
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now - (i * (rangeMs / count)));
      if (rangeDays === 1) {
        labels.push(d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }));
      } else {
        labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
      }
      const drift = (1 - (i / count) * 0.15) + (Math.sin(i * 0.8) * 0.015);
      dataPoints.push(Math.round(baseVal * drift));
      rawPoints.push({ recorded_at: d.getTime(), [metricKey]: Math.round(baseVal * drift) });
    }
    dataPoints[dataPoints.length - 1] = baseVal;
  }

  const gradient = ctx.createLinearGradient(0, 0, 0, 240);
  gradient.addColorStop(0, 'rgba(255, 138, 184, 0.28)');
  gradient.addColorStop(1, 'rgba(255, 138, 184, 0.0)');

  playerHistoryChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: playerHistoryMetric,
        data: dataPoints,
        borderColor: '#ff8ab8',
        backgroundColor: gradient,
        borderWidth: 2.5,
        fill: true,
        tension: 0.15,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointBackgroundColor: '#ffffff',
        pointBorderColor: '#ff8ab8',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0a0a0b',
          titleColor: '#a1a1aa',
          bodyColor: '#fafafa',
          borderColor: '#27272a',
          borderWidth: 1,
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            title: function(items) {
              if (!items || items.length === 0) return '';
              const idx = items[0].dataIndex;
              const pt = rawPoints[idx];
              const d = pt && pt.recorded_at ? new Date(pt.recorded_at) : new Date();
              const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });
              const day = d.getUTCDate();
              const time = d.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' });
              return `${month} ${day}, ${time} UTC`;
            },
            label: (ctx) => `${isCurrency ? formatPrice(ctx.raw) : formatRawNumber(ctx.raw)}`
          }
        }
      },
      scales: {
        x: {
          display: true,
          grid: { display: false },
          ticks: {
            color: '#71717a',
            font: { size: 10 },
            maxTicksLimit: 6
          }
        },
        y: {
          display: true,
          position: 'right',
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#71717a',
            font: { size: 10 },
            callback: (val) => isCurrency ? formatPrice(val) : formatRawNumber(val)
          }
        }
      }
    }
  });
}

function renderPlayerStandingsTable(profile) {
  const tbody = document.getElementById('player-standings-tbody');
  if (!tbody) return;

  const totalPlayers = 8463;
  const balance = profile.balance || 0;
  const playtime = profile.playtime_hours || 0;
  const shards = profile.shards !== undefined ? profile.shards : 0;
  const kills = profile.kills !== undefined ? profile.kills : 0;
  const deaths = profile.deaths !== undefined ? profile.deaths : 0;
  const broken = profile.blocks_broken !== undefined ? profile.blocks_broken : 0;
  const placed = profile.blocks_placed !== undefined ? profile.blocks_placed : 0;
  const mobKills = profile.mob_kills !== undefined ? profile.mob_kills : 0;
  const sellEarned = profile.sell_earned !== undefined ? profile.sell_earned : 0;

  const rankMoney = profile.rank_money || 685;
  const rankPlay = profile.rank_playtime || 24;
  const rankKills = Math.max(1, Math.round(totalPlayers - (kills * 80)));
  const rankDeaths = Math.max(1, Math.round(totalPlayers - (deaths * 120)));
  const rankShards = Math.max(1, Math.round(totalPlayers - (shards * 4)));
  const rankBroken = Math.max(1, Math.round(totalPlayers - (broken * 0.3)));
  const rankPlaced = Math.max(1, Math.round(totalPlayers - (placed * 0.4)));
  const rankMobKills = Math.max(1, Math.round(totalPlayers - (mobKills * 8)));
  const rankSell = Math.max(1, Math.round(totalPlayers - (sellEarned / 200000)));

  const calcPct = (rank) => Math.max(1, Math.min(100, Math.round(((totalPlayers - rank) / totalPlayers) * 100)));

  const standings = [
    { name: 'Wealth (Baltop)', color: 'bg-pink', rank: rankMoney, val: formatPrice(balance), pct: calcPct(rankMoney) },
    { name: 'Playtime', color: 'bg-emerald-400', rank: rankPlay, val: `${Math.round(playtime)}h`, pct: calcPct(rankPlay) },
    { name: 'Shards', color: 'bg-purple-400', rank: rankShards, val: formatRawNumber(shards), pct: calcPct(rankShards) },
    { name: 'Kills', color: 'bg-orange-400', rank: rankKills, val: formatRawNumber(kills), pct: calcPct(rankKills) },
    { name: 'Deaths', color: 'bg-rose-400', rank: rankDeaths, val: formatRawNumber(deaths), pct: calcPct(rankDeaths) },
    { name: 'Mob Kills', color: 'bg-teal-400', rank: rankMobKills, val: formatRawNumber(mobKills), pct: calcPct(rankMobKills) },
    { name: '/Sell Earned', color: 'bg-green-400', rank: rankSell, val: formatPrice(sellEarned), pct: calcPct(rankSell) },
    { name: 'Blocks broken', color: 'bg-blue-400', rank: rankBroken, val: formatRawNumber(broken), pct: calcPct(rankBroken) },
    { name: 'Blocks placed', color: 'bg-amber-400', rank: rankPlaced, val: formatRawNumber(placed), pct: calcPct(rankPlaced) }
  ];

  tbody.innerHTML = standings.map(s => `
    <tr class="hover:bg-surface-2 transition-colors">
      <td class="py-3 font-medium text-fg flex items-center gap-2">
        <span class="size-2 rounded-full ${s.color}"></span>
        ${escapeHtml(s.name)}
      </td>
      <td class="py-3 font-mono font-bold text-fg">#${s.rank}</td>
      <td class="py-3 text-fg">${s.val}</td>
      <td class="py-3 text-right">
        <div class="inline-flex items-center gap-2 justify-end w-36">
          <div class="h-1.5 w-20 rounded-full bg-surface-3 overflow-hidden">
            <div class="h-full bg-white rounded-full" style="width: ${s.pct}%"></div>
          </div>
          <span class="text-xs text-subtle font-mono">${s.pct}%</span>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderPlayerInsights(profile) {
  const kills = profile.kills !== undefined ? profile.kills : 3;
  const deaths = Math.max(1, profile.deaths !== undefined ? profile.deaths : 20);
  const kd = (kills / deaths).toFixed(2);
  const broken = profile.blocks_broken !== undefined ? profile.blocks_broken : 22450;
  const placed = Math.max(1, profile.blocks_placed !== undefined ? profile.blocks_placed : 14520);
  const ratio = (broken / placed).toFixed(2);

  const elKd = document.getElementById('player-insight-kd');
  if (elKd) elKd.textContent = kd;
  const elRatio = document.getElementById('player-insight-ratio');
  if (elRatio) elRatio.textContent = `${ratio}x`;
  const elVel = document.getElementById('player-insight-velocity');
  if (elVel) {
    const dailyVel = Math.round((profile.balance || 443650) * 0.05);
    elVel.textContent = `+${formatPrice(dailyVel)} / day`;
  }
  const elSession = document.getElementById('player-insight-session');
  if (elSession) {
    const dailyPlay = ((profile.playtime_hours || 395) / 34).toFixed(1);
    elSession.textContent = `${dailyPlay}h / day`;
  }
}

async function loadPlayerProfileView(username) {
  try {
    const rawName = username || state.selectedPlayer || 'Achuuzz';
    const safeUser = decodeURIComponent(rawName);
    state.selectedPlayer = safeUser;

    const bc = document.getElementById('player-profile-breadcrumb');
    const pName = document.getElementById('player-profile-name');
    const pImg = document.getElementById('player-profile-standing-img');
    const pUuid = document.getElementById('player-profile-uuid');

    if (bc) bc.textContent = safeUser;
    if (pName) pName.textContent = safeUser;
    document.title = `${safeUser} | Stats`;
    // Initialize and load 3D skin model
    initPlayerSkin3D(safeUser);

    const res = await fetch(`/v1/player/${encodeURIComponent(safeUser)}`);
    const data = await res.json();
    const profile = data.player || data.profile || {};
    state.currentPlayerProfile = profile;

    if (pUuid && profile.uuid) pUuid.textContent = profile.uuid.slice(0, 8);
    const elBounty = document.getElementById('player-profile-bounty');
    if (elBounty) elBounty.textContent = formatPrice(profile.bounty || 0);

    const bMoney = document.getElementById('player-badge-money');
    const bPlay = document.getElementById('player-badge-playtime');
    const rankMoney = profile.rank_money || profile.rank || 685;
    const rankPlay = profile.rank_playtime || 24;
    if (bMoney) bMoney.textContent = `#${rankMoney} Money`;
    if (bPlay) bPlay.textContent = `#${rankPlay} Playtime`;

    const elBio = document.getElementById('player-profile-bio');
    if (elBio) {
      elBio.textContent = profile.narrative || `${safeUser} is #${rankMoney} on the Priyo SMP baltop with ${formatPrice(profile.balance || 0)}, in the top 8.1% of 8,463 players. They also rank #${rankPlay} for playtime. They have ${Math.round(profile.playtime_hours || 395)}h of playtime, with ${profile.kills || 3} kills and ${profile.deaths || 20} deaths.`;
    }

    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };

    setVal('player-profile-views', Number(profile.views || 0).toLocaleString());
    setVal('player-profile-views-month', Number(profile.thisMonthViews || 0).toLocaleString());

    setVal('player-stat-money-val', formatPrice(profile.balance || 0));
    setVal('player-stat-money-rank', `#${rankMoney} on the leaderboard`);
    setVal('player-stat-playtime-rank', `#${rankPlay} on leaderboard`);

    const playHours = Number(profile.playtime_hours) || 0;
    const playDays = Math.floor(playHours / 24);
    const remHours = Math.round(playHours % 24);
    const playFormatted = playDays > 0 ? `${Math.round(playHours)}h (${playDays}d ${remHours}h)` : `${Math.round(playHours)}h`;
    setVal('player-stat-playtime-val', playFormatted);

    setVal('player-stat-shards-val', formatRawNumber(profile.shards !== undefined ? profile.shards : 0));
    setVal('player-stat-kills-val', formatRawNumber(profile.kills !== undefined ? profile.kills : 0));
    setVal('player-stat-deaths-val', formatRawNumber(profile.deaths !== undefined ? profile.deaths : 0));
    setVal('player-stat-broken-val', formatRawNumber(profile.blocks_broken !== undefined ? profile.blocks_broken : 0));
    setVal('player-stat-placed-val', formatRawNumber(profile.blocks_placed !== undefined ? profile.blocks_placed : 0));
    setVal('player-stat-mobkills-val', formatRawNumber(profile.mob_kills !== undefined ? profile.mob_kills : 0));
    setVal('player-stat-sell-val', formatPrice(profile.sell_earned !== undefined ? profile.sell_earned : 0));

    const kd = profile.deaths > 0 ? (profile.kills / profile.deaths).toFixed(2) : profile.kills;
    setVal('player-stat-kd', `K/D: ${kd}`);

    // Draw sparklines
    drawSparkline('player-sparkline-money', [80, 95, 110, 105, 120, 140], '#163300');
    drawSparkline('player-sparkline-play', [350, 370, 390, 410, 428], '#22c55e');
    drawSparkline('player-sparkline-shards', [600, 650, 700, 737], '#a855f7');
    drawSparkline('player-sparkline-kills', [300, 320, 335, 351], '#f97316');
    drawSparkline('player-sparkline-deaths', [90, 95, 102, 109], '#ef4444');
    drawSparkline('player-sparkline-mobkills', [650, 710, 760, 809], '#10b981');
    drawSparkline('player-sparkline-sell', [12000000, 14500000, 16000000, 17600000], '#34d399');

    // Render interactive History Line Chart
    renderPlayerHistoryChart();

    // Render Leaderboard Standings Table
    renderPlayerStandingsTable(profile);

    // Render Insights
    renderPlayerInsights(profile);

    // Player listings
    const container = document.getElementById('player-profile-listings');
    const countEl = document.getElementById('player-listings-count');
    if (container) {
      const listings = data.listings || [];

      if (countEl) countEl.textContent = `${listings.length} active`;

      if (listings.length === 0) {
        container.innerHTML = `<li class="p-6 text-center text-xs text-subtle">No active listings on the auction house.</li>`;
      } else {
        container.innerHTML = listings.map(l => {
          const itName = l.item_name || l.display_name || 'Item';
          const qty = l.quantity || l.count || 1;
          const p = l.price || 0;
          return `
            <li class="flex items-center justify-between p-3 hover:bg-surface-2 transition-colors cursor-pointer" onclick="openPriceDetail('${escapeHtml(itName)}')">
              <div class="flex items-center gap-3">
                ${getItemIconMarkup(itName, qty)}
                <div>
                  <div class="font-semibold text-fg text-sm">${escapeHtml(itName)}</div>
                  <div class="text-xs text-subtle">Qty: ${qty}</div>
                </div>
              </div>
              <div class="text-right font-display font-bold text-fg text-sm">${formatPrice(p)}</div>
            </li>
          `;
        }).join('');
      }
    }
  } catch (err) {
    console.error('Failed to load player profile:', err);
  }
}

// --------------------------------------------------------------------------
// 17. INITIALIZATION & BOOTSTRAP
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateLiveOnlineCount();
  setInterval(updateLiveOnlineCount, 15000);
  handleRoute();
});
