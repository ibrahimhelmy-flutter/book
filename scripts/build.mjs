import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';
import { pathToFileURL } from 'url';

const IMAGE_RE = /\.(png|jpe?g|gif|webp|svg|avif)$/i;
/** Shell files that every part needs offline (also precached by sw.js, listed here as a safety net). */
const SHELL_FILES = ['/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png'];

/** Every file under `dir` (recursively), as forward-slash paths relative to `dir`. */
function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { recursive: true })
    .map((rel) => String(rel))
    .filter((rel) => fs.statSync(path.join(dir, rel)).isFile())
    .map((rel) => rel.split(path.sep).join('/'))
    .sort();
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

/** "secondary-2/programming-ai/term-1" → "secondary-2__programming-ai__term-1" (offline list file name). */
export function offlineListName(partKey) {
  return `${partKey.split('/').join('__')}.json`;
}

/**
 * Writes out/offline-assets.json: every hashed static asset (JS chunks, CSS, fonts). Lazily loaded
 * chunks (next/dynamic) are not referenced in page HTML, so without this list they are never cached
 * and pages crash with ChunkLoadError when opened offline.
 */
export function writeOfflineAssets(outDir) {
  const staticDir = path.join(outDir, '_next', 'static');
  if (!fs.existsSync(staticDir)) return null;
  const assets = walkFiles(staticDir).map((rel) => `/_next/static/${rel}`);
  fs.writeFileSync(path.join(outDir, 'offline-assets.json'), JSON.stringify({ assets }, null, 2));
  return assets;
}

/**
 * Builds the offline list for one part by walking out/. URLs are root-relative WITHOUT the basePath
 * (the client prefixes them); pages use the trailing-slash directory form plus their RSC `index.txt`.
 */
export function buildPartOfflineList(outDir, partKey) {
  const manifestFile = path.join(outDir, 'data', ...partKey.split('/'), 'manifest.json');
  if (!fs.existsSync(manifestFile)) throw new Error(`Missing ${path.relative(outDir, manifestFile)}`);
  const manifest = readJson(manifestFile);
  const [gradeId, bookSlug] = partKey.split('/');

  const exists = (url) => fs.existsSync(path.join(outDir, ...url.split('/').filter(Boolean)));
  const pageUrls = new Set();
  const addRoute = (dirUrl) => {
    if (exists(`${dirUrl}index.html`)) pageUrls.add(dirUrl);
    if (exists(`${dirUrl}index.txt`)) pageUrls.add(`${dirUrl}index.txt`);
  };

  // Shell routes shared by every part
  for (const dirUrl of ['/', '/dashboard/', `/g/${gradeId}/`, `/g/${gradeId}/${bookSlug}/`]) addRoute(dirUrl);

  // Every page (and its RSC payload) under the part
  const partRoot = `/g/${partKey}/`;
  for (const rel of walkFiles(path.join(outDir, 'g', ...partKey.split('/')))) {
    const base = rel.split('/').pop();
    const dir = rel.slice(0, rel.length - base.length); // '' or 'chapters/x/'
    if (base === 'index.html') pageUrls.add(`${partRoot}${dir}`);
    else if (base === 'index.txt') pageUrls.add(`${partRoot}${rel}`);
  }

  const dataUrls = walkFiles(path.join(outDir, 'data', ...partKey.split('/'))).map((rel) => `/data/${partKey}/${rel}`);
  if (exists('/data/catalog.json')) dataUrls.unshift('/data/catalog.json');

  const assetsBase = `/${String(manifest.assetsBase || '/images/extracted').replace(/^\/+|\/+$/g, '')}`;
  const imageUrls = walkFiles(path.join(outDir, ...assetsBase.split('/').filter(Boolean)))
    .filter((rel) => IMAGE_RE.test(rel))
    .map((rel) => `${assetsBase}/${rel}`);

  const offlineAssetsFile = path.join(outDir, 'offline-assets.json');
  const staticAssets = fs.existsSync(offlineAssetsFile) ? readJson(offlineAssetsFile).assets || [] : [];
  const assetUrls = [...SHELL_FILES.filter(exists), ...staticAssets];

  const pages = [...pageUrls].sort();
  const groups = [pages, dataUrls, imageUrls, assetUrls];
  const urls = [...new Set(groups.flat())];
  const bytes = urls.reduce((sum, url) => {
    const file = path.join(outDir, ...url.split('/').filter(Boolean), ...(url.endsWith('/') ? ['index.html'] : []));
    return sum + (fs.existsSync(file) ? fs.statSync(file).size : 0);
  }, 0);

  return {
    partKey,
    contentHash: manifest.contentHash,
    urls,
    counts: { pages: pages.length, data: dataUrls.length, images: imageUrls.length, assets: assetUrls.length },
    bytes,
  };
}

/** Writes out/offline/<grade>__<book>__<part>.json for every available part in out/data/catalog.json. */
export function writeOfflineLists(outDir) {
  const catalogFile = path.join(outDir, 'data', 'catalog.json');
  if (!fs.existsSync(catalogFile)) return [];
  const catalog = readJson(catalogFile);
  const partKeys = catalog.grades.flatMap((g) =>
    g.books.flatMap((b) => b.parts.filter((p) => p.status === 'available').map((p) => p.key))
  );
  const offlineDir = path.join(outDir, 'offline');
  fs.mkdirSync(offlineDir, { recursive: true });
  return partKeys.map((partKey) => {
    const list = buildPartOfflineList(outDir, partKey);
    const file = path.join(offlineDir, offlineListName(partKey));
    fs.writeFileSync(file, JSON.stringify(list, null, 2));
    return { file, list };
  });
}

function writeOfflineArtifacts(outDir) {
  const assets = writeOfflineAssets(outDir);
  if (assets) console.log(`✓ Wrote out/offline-assets.json (${assets.length} static assets for the offline pack)`);
  for (const { file, list } of writeOfflineLists(outDir)) {
    const { pages, data, images, assets: a } = list.counts;
    console.log(
      `✓ Wrote ${path.relative(process.cwd(), file)} (${list.urls.length} urls: ${pages} pages, ${data} data, ${images} images, ${a} assets; ${(list.bytes / 1048576).toFixed(2)} MB)`
    );
  }
}

function runBuild() {
  console.log('📦 Starting robust Next.js production build...');

  // Prevent Windows / OneDrive IPC and file lock conflicts during static page collection
  const env = {
    ...process.env,
    NEXT_DISABLE_WORKERS: '1',
    NEXT_CPU_NUM: '1',
  };

  const nextBin = path.resolve('node_modules', 'next', 'dist', 'bin', 'next');

  console.log(`\n▶ Running Next.js build: node ${nextBin} build`);
  const result = spawnSync('node', [nextBin, 'build'], {
    stdio: 'inherit',
    env,
  });

  if (result.status !== 0) {
    console.error(`❌ Next.js build failed with exit code ${result.status}`);
    process.exit(result.status || 1);
  }

  console.log('\n✓ Next.js build finished successfully.');
  writeOfflineArtifacts(path.resolve('out'));
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  if (process.argv.includes('--offline-only')) {
    // Regenerate only the offline lists from an existing out/ (no Next build).
    writeOfflineArtifacts(path.resolve(process.argv[process.argv.indexOf('--offline-only') + 1] || 'out'));
  } else {
    runBuild();
  }
}
