function stripColorOnly(text) {
  if (!text) return '';
  return text.replace(/[§&][0-9a-fk-or]/gi, '');
}

function extractTextFromComponent(comp) {
  if (!comp) return '';
  if (typeof comp === 'string') return stripColorOnly(comp);
  let res = comp.text || '';
  if (comp.extra && Array.isArray(comp.extra)) {
    res += comp.extra.map(extractTextFromComponent).join('');
  }
  return stripColorOnly(res);
}

const sampleJsonString = '{"extra":[{"color":"gray","text":"Click to deliver "},{"color":"green","text":"whynotshanks"},{"color":"gray","text":" "},{"color":"white","text":"Diamond"}],"text":""}';
const parsed = JSON.parse(sampleJsonString);
const fullText = extractTextFromComponent(parsed).trim();
console.log('Result:', JSON.stringify(fullText));
const m = fullText.match(/click to deliver\s+([^\s]+)/i);
console.log('Buyer match:', m ? m[1] : null);
