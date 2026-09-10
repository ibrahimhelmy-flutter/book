import { pdf } from 'pdf-to-img';
import path from 'path';
import fs from 'fs';
import { getSources } from './sources-config.mjs';

const sources = getSources('term-1');
const pdfPath = sources.pdfFile;
const outputDir = sources.pages;

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Rendering all PDF pages from immutable source:', pdfPath);

async function renderAll() {
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF file not found at: ${pdfPath}`);
    process.exit(1);
  }

  let pageNumber = 1;
  const doc = await pdf(pdfPath, { scale: 1.5 });
  for await (const page of doc) {
    const filename = `page_${String(pageNumber).padStart(2, '0')}.png`;
    const outPath = path.join(outputDir, filename);
    fs.writeFileSync(outPath, page);
    console.log(`Rendered ${filename}`);
    pageNumber++;
  }
  console.log(`Successfully rendered ${pageNumber - 1} pages to ${outputDir}!`);
}

renderAll().catch(err => {
  console.error('Error rendering pages:', err);
  process.exit(1);
});
