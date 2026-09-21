import fs from 'fs';

const rawPages = JSON.parse(fs.readFileSync('scratch/extracted_raw_pages.json', 'utf8'));

function clean(l) {
  return l
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/\u0640/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseOptionsRobust(rawLines) {
  const combined = rawLines.join(" ");

  // Check if this is the inverted LTR format: e.g. "200 )أ 404 )ب" or "POST )أ GET )ب"
  if (/([^\s()]+)\s*[)）]\s*أ/.test(combined)) {
    const opts = ['', '', '', ''];
    // Inverted format regex: (text) )letter
    const invRegex = /([^\s()]+(?:\s+[^\s()]+)*?)\s*[)）]\s*([أبجد])/g;
    let m;
    while ((m = invRegex.exec(combined)) !== null) {
      const text = m[1].replace(/^\./, '').trim();
      const letter = m[2];
      const idx = letter === 'أ' ? 0 : letter === 'ب' ? 1 : letter === 'ج' ? 2 : 3;
      opts[idx] = text;
    }
    if (opts.filter(o => o).length >= 3) {
      return opts;
    }
  }

  // Standard format: [أبجد] followed by delimiter -, ), ., or bracketed (أ)
  const optRegex = /(?:^|\s+)(?:[([（]?([أبجد])[\s)\]）\-–.]|([أبجد])[\s)\]）\-–.])\s*([\s\S]*?)(?=(?:\s+(?:[([（]?[أبجد][\s)\]）\-–.]|[أبجد][\s)\]）\-–.]))|$)/g;
  const matches = [];
  let match;
  while ((match = optRegex.exec(combined)) !== null) {
    const letter = match[1] || match[2];
    matches.push({ letter, text: match[3].trim() });
  }

  const opts = ['', '', '', ''];
  matches.forEach(m => {
    const idx = m.letter === 'أ' ? 0 : m.letter === 'ب' ? 1 : m.letter === 'ج' ? 2 : 3;
    opts[idx] = m.text;
  });

  return opts;
}

// Let's test on page 53 and 56
console.log('Test page 53 inverted options:');
console.log(parseOptionsRobust(['GET )أ    POST )ب', '200 )ج   404 )د']));

console.log('Test page 56 inverted options:');
console.log(parseOptionsRobust(['200 )أ    404 )ب', '500 )ج    302 )د']));

console.log('Test normal options:');
console.log(parseOptionsRobust(['أ) اختبار قابلية الاستخدام . ب) تحليلات الويب.', 'ج) اختبار B/A د) معدل التحويل (CVR)']));
