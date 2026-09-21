import fs from 'fs';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const pdfPath = 'book-sources/term-1/01-pdf-document/Programming-ArtificialIntelligence-Ar-EB-Assessments-1.pdf';
const data = new Uint8Array(fs.readFileSync(pdfPath));
const doc = await pdfjs.getDocument({ data }).promise;

console.log('Total pages:', doc.numPages);

const pagesData = [];

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const textContent = await page.getTextContent();
  const items = textContent.items;

  // Sort items by Y descending (top to bottom), then X descending (RTL: right to left)
  items.sort((a, b) => {
    if (Math.abs(a.transform[5] - b.transform[5]) > 4) {
      return b.transform[5] - a.transform[5];
    }
    return b.transform[4] - a.transform[4];
  });

  const lines = [];
  let currentY = null;
  let currentLine = '';

  for (const item of items) {
    if (currentY === null || Math.abs(item.transform[5] - currentY) > 4) {
      if (currentLine.trim()) lines.push(currentLine.trim());
      currentLine = item.str;
      currentY = item.transform[5];
    } else {
      currentLine += ' ' + item.str;
    }
  }
  if (currentLine.trim()) lines.push(currentLine.trim());

  pagesData.push({
    page: p,
    lines: lines
  });
}

// Dump all pages text to scratch/extracted_raw_pages.json for examination
fs.writeFileSync('scratch/extracted_raw_pages.json', JSON.stringify(pagesData, null, 2), 'utf8');

// Find headings and structure
const headings = [];
pagesData.forEach(({ page, lines }) => {
  lines.forEach((line) => {
    if (/الوحدة|الدرس|التقييم|المهام|أداءات|أسبوع/i.test(line)) {
      headings.push({ page, line });
    }
  });
});

console.log('Found', headings.length, 'heading lines.');
fs.writeFileSync('scratch/extracted_headings.json', JSON.stringify(headings, null, 2), 'utf8');

// Let's also print unique units and lessons found
const unitLines = headings.filter(h => /الوحدة/i.test(h.line));
const lessonLines = headings.filter(h => /الدرس/i.test(h.line));

console.log('--- UNITS ---');
console.log(unitLines);
console.log('--- LESSONS ---');
console.log(lessonLines);
