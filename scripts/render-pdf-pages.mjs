import { pdf } from 'pdf-to-img';
import path from 'path';
import fs from 'fs';

const pdfPath = 'C:\\Users\\devib\\Downloads\\Programming-ArtificialIntelligence-Ar-EB-part1.pdf';
const outputDir = path.resolve('public', 'images', 'pages');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Rendering all PDF pages from:', pdfPath);

async function renderAll() {
  let pageNumber = 1;
  const doc = await pdf(pdfPath, { scale: 1.5 });
  for await (const page of doc) {
    const filename = `page_${String(pageNumber).padStart(2, '0')}.png`;
    const outPath = path.join(outputDir, filename);
    fs.writeFileSync(outPath, page);
    console.log(`Rendered ${filename}`);
    pageNumber++;
  }
  console.log(`Successfully rendered ${pageNumber - 1} pages!`);
}

renderAll().catch(err => {
  console.error('Error rendering pages:', err);
});
