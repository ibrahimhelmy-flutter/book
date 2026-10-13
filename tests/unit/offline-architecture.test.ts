import assert from "assert";
import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import type { Catalog, PartManifest } from "../../src/types/catalog";
import {
  APP_VERSION,
  CURRENT_CONTENT_VERSION,
  PACK_CACHE_PREFIX,
  offlineListPath,
  packCacheName,
  packStateOf,
  type OfflinePackRecord,
} from "../../src/lib/offline-db";

console.log("=================================================");
console.log("🧪 RUNNING OFFLINE-FIRST ARCHITECTURE GATE TESTS");
console.log("=================================================");

const TERM1 = "secondary-2/programming-ai/term-1";
let passCount = 0;

function it(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passCount++;
  } catch (err: any) {
    console.error(`❌ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// Generated per-part data (public/data) is a build artifact; build it if this checkout has none yet.
const catalogFile = path.resolve("public/data/catalog.json");
const manifestFile = path.resolve("public/data", ...TERM1.split("/"), "manifest.json");
if (!fs.existsSync(catalogFile) || !fs.existsSync(manifestFile)) {
  console.log("   ℹ️ public/data missing — running scripts/data/build-data.ts");
  execFileSync(process.execPath, [path.resolve("node_modules/tsx/dist/cli.mjs"), "scripts/data/build-data.ts"], {
    stdio: "inherit",
  });
}

const catalog: Catalog = JSON.parse(fs.readFileSync(catalogFile, "utf-8"));
const manifest: PartManifest = JSON.parse(fs.readFileSync(manifestFile, "utf-8"));
const sw = fs.readFileSync(path.resolve("public/sw.js"), "utf-8");
const swConst = (name: string) => sw.match(new RegExp(`const ${name} = '([^']+)'`))?.[1];

// Suite 1: Catalog + part manifest are the offline source of truth
it("Catalog lists term-1 as an available part", () => {
  const parts = catalog.grades.flatMap((g) => g.books.flatMap((b) => b.parts));
  const term1 = parts.find((p) => p.key === TERM1);
  assert.ok(term1, "term-1 must be in the catalog");
  assert.strictEqual(term1!.status, "available");
});

it("Term-1 manifest has 4 chapters, 14 lessons, a contentHash and an assetsBase", () => {
  assert.strictEqual(manifest.key, TERM1);
  assert.strictEqual(manifest.chapters.length, 4, "Must have 4 chapters");
  const totalLessons = manifest.chapters.reduce((acc, ch) => acc + ch.lessons.length, 0);
  assert.strictEqual(totalLessons, 14, "Must have 14 lessons");
  assert.strictEqual(manifest.stats.totalLessons, 14);
  assert.ok(/^[0-9a-f]{8,}$/i.test(manifest.contentHash), `contentHash must be a hex hash, got ${manifest.contentHash}`);
  assert.ok(manifest.assetsBase.startsWith("/"), "assetsBase must be root-relative");
});

// Suite 2: Diagrams
it("Exactly 48 extracted diagrams exist in the term-1 source folder", () => {
  const dir = path.resolve("book-sources", ...TERM1.split("/"), "04-extracted-diagrams");
  assert.ok(fs.existsSync(dir), "Extracted diagrams directory must exist");
  const files = fs.readdirSync(dir).filter((f) => /\.(png|jpe?g|svg|webp)$/i.test(f));
  assert.strictEqual(files.length, 48, `Must have exactly 48 diagrams, found ${files.length}`);
});

// Suite 3: PWA Web Manifest
it("PWA webmanifest is valid JSON with standalone display, RTL, and icons", () => {
  const content = JSON.parse(fs.readFileSync(path.resolve("public/manifest.webmanifest"), "utf-8"));
  assert.strictEqual(content.display, "standalone");
  assert.strictEqual(content.dir, "rtl");
  assert.strictEqual(content.lang, "ar");
  assert.ok(Array.isArray(content.icons) && content.icons.length > 0);
});

// Suite 4: Service worker per-part packs
it("sw.js handles per-part CACHE_OFFLINE_PACK and DELETE_OFFLINE_PACK messages", () => {
  assert.ok(sw.includes("CACHE_OFFLINE_PACK"), "Must handle CACHE_OFFLINE_PACK");
  assert.ok(sw.includes("DELETE_OFFLINE_PACK"), "Must handle DELETE_OFFLINE_PACK");
  assert.ok(sw.includes("const packCacheName = (partKey) => `${PACK_CACHE_PREFIX}${partKey}`"), "Must name caches per part");
  assert.ok(sw.includes("const PACK_CACHE_PREFIX = `ai-curriculum-pack-${CACHE_VERSION}::`"), "Pack cache prefix");
  assert.ok(/key !== APP_SHELL_CACHE && !key\.startsWith\(PACK_CACHE_PREFIX\)/.test(sw), "activate keeps shell + pack caches only");
  assert.ok(!sw.includes("OFFLINE_PACK_CACHE"), "Single global pack cache must be gone");
});

it("sw.js serves /data/*.json stale-while-revalidate, ignoring the query string", () => {
  const start = sw.indexOf("url.pathname.includes('/data/') && url.pathname.endsWith('.json')");
  assert.ok(start > -1, "Must have a /data/ JSON branch");
  const branch = sw.slice(start, sw.indexOf("// Strategy 1:", start));
  assert.ok(branch.includes("caches.match(cacheKey, { ignoreSearch: true })"), "Must look up all caches ignoring search");
  assert.ok(branch.includes("event.waitUntil(networkUpdate"), "Must revalidate in the background when cached");
  assert.ok(branch.includes("refreshCachedEverywhere"), "Must store refreshed data");
});

it("sw.js precaches the catalog shell, not legacy single-book routes", () => {
  const precache = sw.slice(sw.indexOf("const PRECACHE_ASSETS"), sw.indexOf("];", sw.indexOf("const PRECACHE_ASSETS")));
  for (const must of ["'./'", "'./index.html'", "'./manifest.webmanifest'", "'./dashboard/'", "'./data/catalog.json'"]) {
    assert.ok(precache.includes(must), `PRECACHE_ASSETS must include ${must}`);
  }
  for (const legacy of ["'./exams/'", "'./glossary/'", "'./simulators/'"]) {
    assert.ok(!precache.includes(legacy), `PRECACHE_ASSETS must not include ${legacy}`);
  }
  const installBlock = sw.slice(sw.indexOf("addEventListener('install'"), sw.indexOf("addEventListener('activate'"));
  assert.ok(!installBlock.includes("skipWaiting"), "No blind skipWaiting() in install");
});

// Suite 5: Versions and cache naming shared by sw.js and offline-db.ts
it("APP_VERSION and CONTENT_VERSION match between sw.js and offline-db.ts", () => {
  assert.strictEqual(swConst("APP_VERSION"), APP_VERSION);
  assert.strictEqual(swConst("CONTENT_VERSION"), CURRENT_CONTENT_VERSION);
  assert.strictEqual(PACK_CACHE_PREFIX, `ai-curriculum-pack-v${APP_VERSION}::`);
  assert.strictEqual(packCacheName(TERM1), `ai-curriculum-pack-v${APP_VERSION}::${TERM1}`);
  assert.strictEqual(offlineListPath(TERM1), "/offline/secondary-2__programming-ai__term-1.json");
});

it("Pack state is ready only when the stored contentHash matches the manifest", () => {
  const rec: OfflinePackRecord = {
    partKey: TERM1,
    contentHash: manifest.contentHash,
    downloadedAt: new Date().toISOString(),
    fileCount: 1,
    counts: { pages: 1, data: 0, images: 0, assets: 0 },
    appVersion: APP_VERSION,
  };
  assert.strictEqual(packStateOf(null, manifest.contentHash), "none");
  assert.strictEqual(packStateOf(rec, manifest.contentHash), "ready");
  assert.strictEqual(packStateOf(rec, "different-hash"), "stale");
  assert.strictEqual(packStateOf({ ...rec, appVersion: "0.0.1" }, manifest.contentHash), "stale");
});

// Suite 6: Offline client code no longer bundles the curriculum
it("Offline pack client code does not import src/data or the old question pipeline", () => {
  for (const file of ["src/lib/offline-db.ts", "src/components/pwa/OfflinePackModal.tsx", "src/context/PWAContext.tsx"]) {
    const src = fs.readFileSync(path.resolve(file), "utf-8");
    assert.ok(!/from ["']@\/data\//.test(src), `${file} must not import @/data`);
    assert.ok(!/committeeBank|exam-generator\/pipeline|CURRICULUM_DATA/.test(src), `${file} must not use the old bundled bank`);
  }
});

console.log("=================================================");
console.log(`🏁 OFFLINE ARCHITECTURE TESTS: ${passCount} PASSED, 0 FAILED`);
console.log("=================================================");
