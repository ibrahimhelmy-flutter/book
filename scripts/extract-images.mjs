import { exportImages } from 'pdf-export-images';
import path from 'path';
import fs from 'fs';

const pdfPath = 'C:\\Users\\devib\\Downloads\\Programming-ArtificialIntelligence-Ar-EB-part1.pdf';
const outputDir = path.resolve('public', 'images', 'extracted');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Extracting images from PDF:', pdfPath);
console.log('Output directory:', outputDir);

try {
  const images = await exportImages(pdfPath, outputDir);
  console.log(`Successfully extracted ${images.length} images!`);
  console.log('First 10 images:', images.slice(0, 10));
} catch (err) {
  console.error('Error extracting images:', err);
}
