/**
 * Exports the embedded raster images of a part's PDF into 04-extracted-diagrams/_raw/
 * (img_p<page>_<n>.png, page = PDF page index). Figures used by lessons are then copied to
 * 04-extracted-diagrams/ with descriptive names and referenced from the build modules.
 *
 *   node scripts/extract-pdf-images.mjs --part term-2
 */
import fs from 'fs';
import path from 'path';
import { exportImages } from 'pdf-export-images';
import { getSources, partArg, assertPartSources } from './sources-config.mjs';

const sources = getSources(partArg());
assertPartSources(sources, ['pdfFile']);
const outDir = path.join(sources.diagrams, '_raw');
fs.mkdirSync(outDir, { recursive: true });
const images = await exportImages(sources.pdfFile, outDir);
console.log(`✅ ${sources.key}: exported ${images.length} images → ${path.relative(process.cwd(), outDir)}`);
