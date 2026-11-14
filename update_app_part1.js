const fs = require('fs');
const path = 'C:/Users/Stebin_S/.gemini/antigravity/scratch/priyo-smp-tracker/client/app.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Assets list
const files = fs.readdirSync('C:/Users/Stebin_S/.gemini/antigravity/scratch/priyo-smp-tracker/client/donut-assets')
  .filter(f => f.endsWith('.png'))
  .map(f => f.replace('.png', ''))
  .sort();

const assetsSetCode = `// Available local textures extracted directly from DonutStats
const LOCAL_DONUT_ASSETS = new Set(${JSON.stringify(files, null, 2)});

const ITEM_SLUG_ALIASES = {
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
  'bottle o\\' enchanting': 'bottle_o_enchanting',
  'experience bottle': 'experience_bottle',
  'lapis lazuli block': 'block_of_lapis_lazuli',
  'block of lapis lazuli': 'block_of_lapis_lazuli',
  'lapis lazuli': 'lapis_lazuli',
  'redstone dust': 'redstone',
  'sugar cane': 'sugar_cane',
  'end crystal': 'end_crystal',
  'gilded blackstone': 'gilded_blackstone',
  'wet sponge': 'wet_sponge',
  'bone meal': 'bone_meal'
};`;

// Replace from `// Available local textures extracted from DonutStats` to `// 1. CURRENCY & FORMATTING`
const assetStart = content.indexOf('// Available local textures extracted from DonutStats');
const assetEnd = content.indexOf('// 1. CURRENCY & FORMATTING');

if (assetStart !== -1 && assetEnd !== -1) {
  content = content.slice(0, assetStart) + assetsSetCode + '\n\n// --------------------------------------------------------------------------\n' + content.slice(assetEnd);
  console.log('Successfully updated LOCAL_DONUT_ASSETS and ITEM_SLUG_ALIASES');
} else {
  console.error('Could not find assets boundaries');
}

// Ensure state has flipsKind, flipsSearch, flipsSort
if (!content.includes('flipsKind:')) {
  content = content.replace("flipsFilter: 'All',", "flipsFilter: 'all',\n  flipsKind: 'all',\n  flipsSearch: '',\n  flipsSort: 'profit',");
  console.log('Added flips state properties');
}

fs.writeFileSync(path, content, 'utf8');
console.log('App.js part 1 written.');
