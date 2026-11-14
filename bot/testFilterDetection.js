const ahHopperBooks = [
  '{"color":"white","underlined":false,"text":"⬝ ᴀʟʟ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ʙʟᴏᴄᴋѕ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ᴛᴏᴏʟѕ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ғᴏᴏᴅ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ᴄᴏᴍʙᴀᴛ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ᴘᴏᴛɪᴏɴs","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"green","underlined":false,"text":"⬝ ʙᴏᴏᴋѕ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ɪɴɢʀᴇᴅɪᴇɴᴛѕ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ᴜᴛɪʟɪᴛɪᴇѕ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}'
];

const ahHopperAll = [
  '{"color":"green","underlined":false,"text":"⬝ ᴀʟʟ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ʙʟᴏᴄᴋѕ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ᴛᴏᴏʟѕ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ғᴏᴏᴅ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ᴄᴏᴍʙᴀᴛ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ᴘᴏᴛɪᴏɴs","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ʙᴏᴏᴋѕ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ɪɴɢʀᴇᴅɪᴇɴᴛѕ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}',
  '{"color":"white","underlined":false,"text":"⬝ ᴜᴛɪʟɪᴛɪᴇѕ","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}'
];

const orderHopperAll = [
  '{"extra":[{"color":"#6bf18d","underlined":false,"text":"▪ All","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}],"text":""}',
  '{"extra":[{"color":"white","underlined":false,"text":"▪ Blocks","bold":false,"strikethrough":false,"obfuscated":false,"italic":false}],"text":""}'
];

function isFilterAllSelected(rawLore) {
  if (!rawLore || rawLore.length === 0) return false;

  for (const line of rawLore) {
    try {
      const p = typeof line === 'string' ? JSON.parse(line) : line;
      const color = p.color || (p.extra && p.extra[0] && p.extra[0].color);
      const txt = p.text || (p.extra && p.extra[0] && p.extra[0].text) || '';
      const isGreen = color === 'green' || color === '#6bf18d' || color === '#55FF55';
      if (isGreen) {
        return txt.includes('ᴀʟʟ') || txt.toLowerCase().includes('all');
      }
    } catch {
      if (line.includes('§a') || line.includes('#6bf18d') || line.includes('green')) {
        return line.includes('ᴀʟʟ') || line.toLowerCase().includes('all');
      }
    }
  }
  return false;
}

console.log('AH Hopper Books is ALL?', isFilterAllSelected(ahHopperBooks)); // false!
console.log('AH Hopper All is ALL?', isFilterAllSelected(ahHopperAll)); // true!
console.log('Order Hopper All is ALL?', isFilterAllSelected(orderHopperAll)); // true!
