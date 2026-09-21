import fs from 'fs';
import path from 'path';

const rawPages = JSON.parse(fs.readFileSync('scratch/extracted_raw_pages.json', 'utf8'));

// Helper to clean Arabic line
function clean(l) {
  return l
    .replace(/[\u064B-\u0652\u0670]/g, "")
    .replace(/\u0640/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLessonStream(startPage, endPage) {
  const lines = [];
  for (let p = startPage; p <= endPage; p++) {
    const pageObj = rawPages[p - 1];
    for (const raw of pageObj.lines) {
      const l = clean(raw);
      if (!l) continue;
      if (/الفصل الدرا[يس]ى? األول|صطءا صطناال|^\d+\s*الفصل|^\s*\d+\s*$/i.test(l)) continue;
      if (/^\.{4,}$/.test(l)) continue;
      lines.push({ page: p, text: l });
    }
  }
  return lines;
}

const l1Lines = parseLessonStream(3, 9);
console.log('Filtered lines count in Lesson 1-1:', l1Lines.length);

// Let's write out l1Lines to scratch/l1_stream.json
fs.writeFileSync('scratch/l1_stream.json', JSON.stringify(l1Lines, null, 2), 'utf8');
