import fs from 'fs';
const pages = JSON.parse(fs.readFileSync('scratch/extracted_raw_pages.json', 'utf8'));

for (const p of pages) {
  const topLines = p.lines.slice(0, 5).join(' | ');
  if (/الدرس|الوحدة/i.test(topLines)) {
    console.log(`Page ${p.page}: ${topLines}`);
  }
}
