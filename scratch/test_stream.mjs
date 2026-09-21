import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('scratch/extracted_raw_pages.json', 'utf8'));

function cleanLine(l) {
  return l
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/\u0640/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parsePageLines(pageObj) {
  const lines = [];
  for (const raw of pageObj.lines) {
    const l = cleanLine(raw);
    if (!l) continue;
    if (/الفصل الدرا[يس]ى? األول|صطءا صطناال|^\d+\s*الفصل|^\s*\d+\s*$/i.test(l)) continue;
    if (/^\.{4,}$/.test(l)) continue;
    lines.push({ page: pageObj.page, line: l });
  }
  return lines;
}

// Test parsing page 3-5
const lines = [];
for (let p = 3; p <= 6; p++) {
  lines.push(...parsePageLines(pages[p - 1]));
}

console.log('Sample parsed stream:');
lines.slice(0, 30).forEach(x => console.log(`[P${x.page}] ${x.line}`));
