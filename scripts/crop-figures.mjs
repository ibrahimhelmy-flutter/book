/**
 * Crops textbook figures from a part's rendered page scans (02-page-scans/page_NN.png).
 *
 * Specs live next to the output in 04-extracted-diagrams/figures*.json:
 *   [{ "file": "sampling-population-sample.webp", "pdfPage": 8,
 *      "box": { "left": 40, "top": 300, "width": 520, "height": 260 }, "caption": "الشكل 5.1.1 — …" }]
 * Boxes are in pixels of the rendered page image (892 × 1262 for scale 1.5).
 *
 *   node scripts/crop-figures.mjs --part term-2 [--only <file>]
 */
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { getSources, partArg } from './sources-config.mjs';

const sources = getSources(partArg());
const onlyIdx = process.argv.indexOf('--only');
const only = onlyIdx >= 0 ? process.argv[onlyIdx + 1] : null;

const specFiles = fs.existsSync(sources.diagrams)
  ? fs.readdirSync(sources.diagrams).filter((f) => /^figures.*\.json$/.test(f)).sort()
  : [];
if (specFiles.length === 0) {
  console.log(`⏭️  ${sources.key}: no figures*.json in 04-extracted-diagrams`);
  process.exit(0);
}

let count = 0;
let failed = 0;
const seen = new Set();
for (const specFile of specFiles) {
  const specs = JSON.parse(fs.readFileSync(path.join(sources.diagrams, specFile), 'utf8'));
  for (const spec of specs) {
    if (seen.has(spec.file)) {
      console.error(`  ❌ duplicate figure file name ${spec.file} (${specFile})`);
      failed++;
      continue;
    }
    seen.add(spec.file);
    if (only && spec.file !== only) continue;
    const pagePath = path.join(sources.pages, `page_${String(spec.pdfPage).padStart(2, '0')}.png`);
    try {
      const img = sharp(pagePath);
      const meta = await img.metadata();
      const left = Math.max(0, Math.round(spec.box.left));
      const top = Math.max(0, Math.round(spec.box.top));
      const width = Math.min(Math.round(spec.box.width), meta.width - left);
      const height = Math.min(Math.round(spec.box.height), meta.height - top);
      const out = path.join(sources.diagrams, spec.file);
      const pipeline = img.extract({ left, top, width, height });
      if (spec.file.endsWith('.webp')) await pipeline.webp({ quality: 82 }).toFile(out);
      else if (spec.file.endsWith('.jpg')) await pipeline.jpeg({ quality: 82, mozjpeg: true }).toFile(out);
      else await pipeline.png({ compressionLevel: 9 }).toFile(out);
      count++;
    } catch (err) {
      console.error(`  ❌ ${spec.file} (page ${spec.pdfPage}): ${err.message}`);
      failed++;
    }
  }
}
console.log(`✅ ${sources.key}: cropped ${count} figure(s) into ${path.relative(process.cwd(), sources.diagrams)}`);
process.exit(failed ? 1 : 0);
