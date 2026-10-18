/**
 * Extracts textbook figures from a part's PDF (01-pdf-document) into 04-extracted-diagrams/.
 *
 * Specs live next to the output in 04-extracted-diagrams/figures*.json, one entry per figure:
 *   { "file": "mfa-factors.webp", "pdfPage": 34, "image": "1800x1200", "caption": "…" }
 *       An embedded raster image, taken at its native resolution. "WxH" is its pixel size
 *       (as printed by --list); "WxH#2" picks the second image of that size on the page.
 *   { "file": "https-tls-handshake.webp", "pdfPage": 34, "box": { "left": 300, "top": 68, "width": 514, "height": 333 } }
 *       A vector drawing, rendered at RENDER_SCALE and cropped. The box is in pixels of the
 *       1.5× page scan (892 × 1262, as in 02-page-scans/page_NN.png); white margins inside it
 *       are trimmed, so keep the box clear of the printed caption and surrounding text.
 *
 * Output is at most MAX_WIDTH px wide. WebP is lossy for photos/illustrations (native width
 * ≥ PHOTO_MIN_WIDTH) and lossless for diagrams, so text inside them stays sharp.
 *
 *   node scripts/crop-figures.mjs --part term-2 [--only <file>]
 *   node scripts/crop-figures.mjs --part term-2 --list <pdfPage>   # embedded images on a page
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import sharp from 'sharp';
import { pdf as pdfToImg } from 'pdf-to-img';
import { getSources, partArg, assertPartSources } from './sources-config.mjs';

// pdf.js refuses to run two versions in one process, so use the copy pdf-to-img renders with
const pdfToImgRequire = createRequire(createRequire(import.meta.url).resolve('pdf-to-img'));
const pdfjs = await import(pathToFileURL(pdfToImgRequire.resolve('pdfjs-dist/legacy/build/pdf.mjs')).href);

const SCAN_SCALE = 1.5;
const RENDER_SCALE = 4;
const MAX_WIDTH = 1600;
const PHOTO_MIN_WIDTH = 1000;
const TRIM_PAD = 24;

const sources = getSources(partArg());
assertPartSources(sources, ['pdfFile']);
const argValue = (flag) => {
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : null;
};
const only = argValue('--only');
const listPage = argValue('--list');

const pdfDoc = await pdfjs.getDocument({
  data: new Uint8Array(fs.readFileSync(sources.pdfFile)),
  isOffscreenCanvasSupported: false,
  verbosity: 0,
}).promise;

/** Embedded raster images of a PDF page in drawing order (each image once). */
async function pageImages(pageNumber) {
  const page = await pdfDoc.getPage(pageNumber);
  const ops = await page.getOperatorList();
  const ids = [];
  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] !== pdfjs.OPS.paintImageXObject) continue;
    const id = ops.argsArray[i][0];
    if (!ids.includes(id)) ids.push(id);
  }
  const images = [];
  for (const id of ids) {
    const obj = await new Promise((resolve) =>
      (page.objs.has(id) || !page.commonObjs.has(id) ? page.objs : page.commonObjs).get(id, resolve)
    );
    if (obj?.data) images.push({ id, ...obj, size: `${obj.width}x${obj.height}` });
  }
  return images;
}

async function embeddedImage(pageNumber, ref) {
  const [size, nth = '1'] = ref.split('#');
  const matches = (await pageImages(pageNumber)).filter((im) => im.size === size);
  const im = matches[Number(nth) - 1];
  if (!im) throw new Error(`no embedded image ${ref} (found ${matches.length} of size ${size})`);
  // pdf.js ImageKind: 1 = 1-bit grey, 2 = RGB, 3 = RGBA
  if (im.kind !== 2 && im.kind !== 3) throw new Error(`unsupported image kind ${im.kind} for ${ref}`);
  const channels = im.kind === 3 ? 4 : 3;
  const raw = Buffer.from(im.data.buffer, im.data.byteOffset, im.data.byteLength);
  return { input: sharp(raw, { raw: { width: im.width, height: im.height, channels } }), width: im.width };
}

let renderer = null;
const rendered = new Map();
async function renderedPage(pageNumber) {
  if (!rendered.has(pageNumber)) {
    renderer ??= await pdfToImg(sources.pdfFile, { scale: RENDER_SCALE });
    rendered.set(pageNumber, await renderer.getPage(pageNumber));
  }
  return rendered.get(pageNumber);
}

async function vectorCrop(pageNumber, box) {
  const page = sharp(await renderedPage(pageNumber));
  const meta = await page.metadata();
  const k = RENDER_SCALE / SCAN_SCALE;
  const left = Math.max(0, Math.round(box.left * k));
  const top = Math.max(0, Math.round(box.top * k));
  const width = Math.min(Math.round(box.width * k), meta.width - left);
  const height = Math.min(Math.round(box.height * k), meta.height - top);
  const cropped = await page.extract({ left, top, width, height }).flatten({ background: '#ffffff' }).png().toBuffer();
  const trimmed = await sharp(cropped).trim({ background: '#ffffff', threshold: 12 }).png().toBuffer();
  const input = sharp(trimmed).extend({ top: TRIM_PAD, bottom: TRIM_PAD, left: TRIM_PAD, right: TRIM_PAD, background: '#ffffff' });
  return { input, width: 0 };
}

async function writeFigure(spec) {
  const { input, width } = spec.image
    ? await embeddedImage(spec.pdfPage, spec.image)
    : await vectorCrop(spec.pdfPage, spec.box);
  const photo = width >= PHOTO_MIN_WIDTH;
  const out = path.join(sources.diagrams, spec.file);
  const pipeline = sharp(await input.flatten({ background: '#ffffff' }).png().toBuffer())
    .resize({ width: MAX_WIDTH, withoutEnlargement: true });
  if (spec.file.endsWith('.webp')) {
    await (photo ? pipeline.webp({ quality: 82 }) : pipeline.webp({ lossless: true, effort: 6 })).toFile(out);
  } else if (spec.file.endsWith('.jpg')) await pipeline.jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  else await pipeline.png({ compressionLevel: 9 }).toFile(out);
}

if (listPage) {
  for (const im of await pageImages(Number(listPage))) console.log(`${im.size}  (${im.id})`);
  process.exit(0);
}

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
    try {
      if (!spec.image === !spec.box) throw new Error('needs exactly one of "image" or "box"');
      await writeFigure(spec);
      count++;
    } catch (err) {
      console.error(`  ❌ ${spec.file} (page ${spec.pdfPage}): ${err.message}`);
      failed++;
    }
  }
}
await renderer?.destroy();
console.log(`✅ ${sources.key}: extracted ${count} figure(s) into ${path.relative(process.cwd(), sources.diagrams)}`);
process.exit(failed ? 1 : 0);
