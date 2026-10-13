/**
 * Bundle budget check for the static export.
 *
 * For every app route it computes the first-load JS: Next's root main files plus the chunks of
 * the page entry and every ancestor layout (from .next/app-build-manifest.json), gzipped.
 * It also flags oversized individual chunks and generated data files under out/data/.
 *
 *   node scripts/check-bundle-budget.mjs            # enforce budgets.json (exit 1 on breach)
 *   node scripts/check-bundle-budget.mjs --report   # print only, never fail
 *   node scripts/check-bundle-budget.mjs --json out/bundle-report.json
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const args = process.argv.slice(2);
const reportOnly = args.includes('--report');
const jsonOutIdx = args.indexOf('--json');
const jsonOut = jsonOutIdx >= 0 ? args[jsonOutIdx + 1] : null;

const NEXT_DIR = path.resolve('.next');
const OUT_DATA_DIR = path.resolve('out', 'data');
const budgets = JSON.parse(fs.readFileSync(path.resolve('scripts', 'budgets.json'), 'utf8'));

const appManifest = JSON.parse(fs.readFileSync(path.join(NEXT_DIR, 'app-build-manifest.json'), 'utf8')).pages;
const buildManifest = JSON.parse(fs.readFileSync(path.join(NEXT_DIR, 'build-manifest.json'), 'utf8'));
const rootMain = buildManifest.rootMainFiles || [];

const sizeCache = new Map();
function sizes(rel) {
  if (sizeCache.has(rel)) return sizeCache.get(rel);
  const file = path.join(NEXT_DIR, rel);
  if (!fs.existsSync(file)) return { raw: 0, gzip: 0 };
  const buf = fs.readFileSync(file);
  const s = { raw: buf.length, gzip: zlib.gzipSync(buf, { level: 9 }).length };
  sizeCache.set(rel, s);
  return s;
}

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

function ancestorLayouts(entry) {
  // "/g/[gradeId]/[bookSlug]/page" -> ["/layout", "/g/layout", "/g/[gradeId]/layout", ...]
  const segs = entry.split('/').filter(Boolean).slice(0, -1);
  const layouts = ['/layout'];
  for (let i = 1; i <= segs.length; i++) layouts.push(`/${segs.slice(0, i).join('/')}/layout`);
  return layouts.filter((l) => appManifest[l]);
}

const routes = Object.keys(appManifest)
  .filter((k) => k.endsWith('/page'))
  .map((entry) => {
    const files = new Set([...rootMain]);
    for (const l of ancestorLayouts(entry)) appManifest[l].forEach((f) => files.add(f));
    appManifest[entry].forEach((f) => files.add(f));
    const js = [...files].filter((f) => f.endsWith('.js'));
    const total = js.reduce((acc, f) => acc + sizes(f).gzip, 0);
    const budget = budgets.routes?.[entry] ?? budgets.firstLoadGzip;
    return { entry, firstLoadGzip: total, budget, chunks: js.length };
  })
  .sort((a, b) => b.firstLoadGzip - a.firstLoadGzip);

const chunkDir = path.join(NEXT_DIR, 'static', 'chunks');
const chunks = fs.readdirSync(chunkDir, { recursive: true })
  .filter((f) => f.endsWith('.js'))
  .map((f) => {
    const rel = path.join('static', 'chunks', f).split(path.sep).join('/');
    return { file: rel, ...sizes(rel) };
  })
  .sort((a, b) => b.raw - a.raw);

const dataFiles = fs.existsSync(OUT_DATA_DIR)
  ? fs.readdirSync(OUT_DATA_DIR, { recursive: true })
      .map((f) => path.join(OUT_DATA_DIR, f))
      .filter((f) => fs.statSync(f).isFile())
      .map((f) => ({ file: path.relative(path.resolve('out'), f).split(path.sep).join('/'), raw: fs.statSync(f).size }))
      .sort((a, b) => b.raw - a.raw)
  : [];

const violations = [];
for (const r of routes) if (r.firstLoadGzip > r.budget) violations.push(`route ${r.entry}: ${kb(r.firstLoadGzip)} gzip > ${kb(r.budget)}`);
for (const c of chunks) if (c.raw > budgets.chunkRaw) violations.push(`chunk ${c.file}: ${kb(c.raw)} raw > ${kb(budgets.chunkRaw)}`);
for (const d of dataFiles) if (d.raw > budgets.dataFileRaw) violations.push(`data ${d.file}: ${kb(d.raw)} > ${kb(budgets.dataFileRaw)}`);

console.log('\n📊 First-load JS per route (gzip)');
for (const r of routes) {
  const flag = r.firstLoadGzip > r.budget ? '❌' : '✅';
  console.log(`  ${flag} ${kb(r.firstLoadGzip).padStart(10)}  ${r.entry}`);
}
console.log('\n📦 Largest chunks (raw / gzip)');
for (const c of chunks.slice(0, 8)) console.log(`  ${kb(c.raw).padStart(10)} / ${kb(c.gzip).padStart(9)}  ${c.file}`);
if (dataFiles.length) {
  const total = dataFiles.reduce((a, d) => a + d.raw, 0);
  console.log(`\n🗂️  Data files: ${dataFiles.length} (${kb(total)} total); largest:`);
  for (const d of dataFiles.slice(0, 5)) console.log(`  ${kb(d.raw).padStart(10)}  ${d.file}`);
}

if (jsonOut) {
  fs.writeFileSync(path.resolve(jsonOut), JSON.stringify({ routes, chunks: chunks.slice(0, 30), dataFiles: dataFiles.slice(0, 30), violations }, null, 2));
}

if (violations.length) {
  console.log(`\n${reportOnly ? '⚠️' : '❌'} ${violations.length} budget violation(s):`);
  violations.forEach((v) => console.log(`  - ${v}`));
  if (!reportOnly) process.exit(1);
} else {
  console.log('\n✅ All bundle budgets met.');
}
