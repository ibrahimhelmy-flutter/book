import fs from 'fs';
import path from 'path';

const pdfPath = 'C:\\Users\\devib\\Downloads\\Programming-ArtificialIntelligence-Ar-EB-part1.pdf';
const outputDir = path.resolve('public', 'images', 'extracted');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Reading PDF buffer...');
const buffer = fs.readFileSync(pdfPath);
console.log(`PDF size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`);

// Extract all raw JPEG images by finding SOI (0xFF, 0xD8) and EOI (0xFF, 0xD9)
const jpegMagicStart = Buffer.from([0xFF, 0xD8, 0xFF]);
const jpegMagicEnd = Buffer.from([0xFF, 0xD9]);

let count = 0;
let pos = 0;

while (pos < buffer.length - 4) {
  const startIdx = buffer.indexOf(jpegMagicStart, pos);
  if (startIdx === -1) break;

  const endIdx = buffer.indexOf(jpegMagicEnd, startIdx + 3);
  if (endIdx === -1) break;

  const imageBuffer = buffer.subarray(startIdx, endIdx + 2);

  // Only keep images larger than 5KB to filter out tiny icons or garbage
  if (imageBuffer.length > 5000) {
    count++;
    const outFilename = `image_${String(count).padStart(3, '0')}.jpg`;
    const outPath = path.join(outputDir, outFilename);
    fs.writeFileSync(outPath, imageBuffer);
    console.log(`Saved: ${outFilename} (${(imageBuffer.length / 1024).toFixed(1)} KB)`);
  }

  pos = endIdx + 2;
}

console.log(`Total JPEG images extracted: ${count}`);
