/**
 * Production PWA & Offline Gate Verification Script
 * Validates the manifest, icons and service worker, version sync between sw.js and offline-db.ts,
 * and (after a build) every part's static routes, legacy redirects and per-part offline lists in out/.
 */

import fs from "fs";
import path from "path";
import assert from "assert";

const rootDir = process.cwd();
console.log("=================================================");
console.log("🚀 STARTING PRODUCTION PWA & OFFLINE VERIFICATION");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

function check(title, fn) {
  try {
    fn();
    console.log(`✅ PASS: ${title}`);
    passed++;
  } catch (err) {
    console.error(`❌ FAIL: ${title}`);
    console.error(`   ${err.message}`);
    failed++;
  }
}

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const readConst = (src, name) => {
  const m = src.match(new RegExp(`(?:export\\s+)?const\\s+${name}\\s*=\\s*["'\`]([^"'\`]+)["'\`]`));
  return m ? m[1] : null;
};

// -------------------------------------------------------------
// 1. MANIFEST & ICONS VERIFICATION
// -------------------------------------------------------------
console.log("--- 1. PWA Manifest & App Icons ---");

// `--out <dir>` checks another export folder (default: ./out)
const outArg = process.argv.indexOf("--out");
const outDir = outArg > -1 && process.argv[outArg + 1] ? path.resolve(process.argv[outArg + 1]) : path.join(rootDir, "out");
const isExported = fs.existsSync(outDir);

check("Manifest exists in public/ and out/ with valid JSON and standalone display", () => {
  const manifestPublic = readJson(path.join(rootDir, "public", "manifest.webmanifest"));
  assert.strictEqual(manifestPublic.display, "standalone", "Display must be standalone");
  assert.strictEqual(manifestPublic.dir, "rtl", "Direction must be rtl");
  assert.strictEqual(manifestPublic.lang, "ar", "Language must be ar");
  assert.ok(manifestPublic.start_url, "start_url must be defined");
  assert.ok(manifestPublic.scope, "scope must be defined");

  if (isExported) {
    const manifestOut = readJson(path.join(outDir, "manifest.webmanifest"));
    assert.strictEqual(manifestOut.display, "standalone");
  }
});

check("Both 192x192 and 512x512 PNG icons exist with valid PNG signatures alongside SVG", () => {
  const icon192 = fs.readFileSync(path.join(rootDir, "public", "icon-192.png"));
  const icon512 = fs.readFileSync(path.join(rootDir, "public", "icon-512.png"));
  const iconSvg = fs.readFileSync(path.join(rootDir, "public", "icon.svg"), "utf8");

  // PNG magic number: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  const pngMagic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  assert.ok(icon192.subarray(0, 8).equals(pngMagic), "icon-192.png must have valid PNG signature");
  assert.ok(icon512.subarray(0, 8).equals(pngMagic), "icon-512.png must have valid PNG signature");
  assert.ok(icon192.length > 5000, `icon-192.png must be non-empty, got ${icon192.length} bytes`);
  assert.ok(icon512.length > 20000, `icon-512.png must be non-empty, got ${icon512.length} bytes`);
  assert.ok(iconSvg.includes("<svg"), "icon.svg must be valid SVG XML");
});

// -------------------------------------------------------------
// 2. SERVICE WORKER LIFECYCLE, PER-PART PACKS & VERSION SYNC
// -------------------------------------------------------------
console.log("\n--- 2. Service Worker Lifecycle & Per-Part Offline Packs ---");

const sw = fs.readFileSync(path.join(rootDir, "public", "sw.js"), "utf8");
const offlineDbSrc = fs.readFileSync(path.join(rootDir, "src", "lib", "offline-db.ts"), "utf8");

check("sw.js exists and does NOT contain blind skipWaiting() in install handler", () => {
  const installBlock = sw.substring(sw.indexOf("addEventListener('install'"), sw.indexOf("addEventListener('activate'"));
  assert.ok(installBlock.length > 0, "sw.js must register install and activate handlers");
  assert.ok(!installBlock.includes("skipWaiting"), "Install event must not call blind skipWaiting()");
  assert.ok(sw.includes("APP_VERSION"), "sw.js must have explicit APP_VERSION");
  assert.ok(sw.includes("CONTENT_VERSION"), "sw.js must have explicit CONTENT_VERSION");
  assert.ok(sw.includes("SKIP_WAITING"), "sw.js must accept polite user-directed SKIP_WAITING message");
});

check("sw.js handles per-part CACHE_OFFLINE_PACK / DELETE_OFFLINE_PACK with per-part cache names", () => {
  assert.ok(sw.includes("CACHE_OFFLINE_PACK"), "sw.js must handle CACHE_OFFLINE_PACK");
  assert.ok(sw.includes("DELETE_OFFLINE_PACK"), "sw.js must handle DELETE_OFFLINE_PACK");
  assert.ok(sw.includes("ai-curriculum-pack-${CACHE_VERSION}::"), "Pack caches must be named ai-curriculum-pack-v<APP_VERSION>::<partKey>");
  assert.ok(/key\.startsWith\(PACK_CACHE_PREFIX\)/.test(sw), "activate must keep this version's pack caches");
  assert.ok(sw.includes("url.pathname.includes('/data/')"), "sw.js must serve /data/*.json network first (cache when offline)");
  for (const legacy of ["'./exams/'", "'./glossary/'", "'./simulators/'"]) {
    assert.ok(!sw.includes(legacy), `PRECACHE_ASSETS must not include legacy route ${legacy}`);
  }
  assert.ok(sw.includes("'./data/catalog.json'"), "PRECACHE_ASSETS must include ./data/catalog.json");
});

check("APP_VERSION / CONTENT_VERSION in sw.js match src/lib/offline-db.ts", () => {
  const swApp = readConst(sw, "APP_VERSION");
  const swContent = readConst(sw, "CONTENT_VERSION");
  const dbApp = readConst(offlineDbSrc, "APP_VERSION");
  const dbContent = readConst(offlineDbSrc, "CURRENT_CONTENT_VERSION");
  assert.ok(swApp && swContent, "sw.js must declare APP_VERSION and CONTENT_VERSION as string literals");
  assert.strictEqual(dbApp, swApp, `offline-db APP_VERSION (${dbApp}) must equal sw.js APP_VERSION (${swApp})`);
  assert.strictEqual(dbContent, swContent, `CURRENT_CONTENT_VERSION (${dbContent}) must equal sw.js CONTENT_VERSION (${swContent})`);
  assert.ok(offlineDbSrc.includes("ai-curriculum-pack-v${APP_VERSION}::"), "offline-db packCacheName must match sw.js pack cache naming");
});

// -------------------------------------------------------------
// 3. EXTRACTED DIAGRAMS
// -------------------------------------------------------------
console.log("\n--- 3. Extracted Textbook Diagrams ---");

const IMAGE_RE = /\.(png|jpe?g|svg|webp|gif|avif)$/i;
const countImages = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => IMAGE_RE.test(f)).length : -1);

check("Term-1 extracted diagrams are all exported (out/images/extracted matches the source folder)", () => {
  const sourceDir = path.join(rootDir, "book-sources", "secondary-2", "programming-ai", "term-1", "04-extracted-diagrams");
  const expected = countImages(sourceDir);
  assert.ok(expected > 0, `Source diagrams folder must exist and contain images: ${sourceDir}`);
  const target = isExported ? path.join(outDir, "images", "extracted") : path.join(rootDir, "public", "images", "extracted");
  const actual = countImages(target);
  assert.strictEqual(actual, expected, `${path.relative(rootDir, target)} must contain ${expected} diagrams, found ${actual}`);
  console.log(`   ℹ️ Diagrams: ${actual} files in ${path.relative(rootDir, target)}`);
});

// -------------------------------------------------------------
// 4. STATIC ROUTES & PER-PART OFFLINE LISTS (out/)
// -------------------------------------------------------------
console.log("\n--- 4. Static Export Routes & Per-Part Offline Lists ---");

if (!isExported) {
  console.log("   ℹ️ out/ directory not present (no build yet) — static export and offline-list checks skipped.");
} else {
  const fileOk = (rel, minBytes = 1) => {
    const full = path.join(outDir, ...rel.split("/").filter(Boolean));
    assert.ok(fs.existsSync(full), `Missing out/${rel}`);
    const size = fs.statSync(full).size;
    assert.ok(size >= minBytes, `out/${rel} must be non-empty (got ${size} bytes)`);
  };
  const routeOk = (dir, { txt = true } = {}) => {
    const base = dir.replace(/^\/+|\/+$/g, "");
    fileOk(`${base ? `${base}/` : ""}index.html`, 500);
    if (txt) fileOk(`${base ? `${base}/` : ""}index.txt`);
  };

  const catalogFile = path.join(outDir, "data", "catalog.json");
  let parts = [];
  check("out/data/catalog.json exists and lists at least one available part", () => {
    assert.ok(fs.existsSync(catalogFile), "Missing out/data/catalog.json (stale out/ from before the catalog refactor? run `npm run build`)");
    const catalog = readJson(catalogFile);
    parts = catalog.grades.flatMap((g) => g.books.flatMap((b) => b.parts.filter((p) => p.status === "available")));
    assert.ok(parts.length > 0, "Catalog must have an available part");
  });

  for (const catalogPart of parts) {
    const key = catalogPart.key;
    const manifestFile = path.join(outDir, "data", ...key.split("/"), "manifest.json");
    let manifest = null;

    check(`[${key}] manifest.json exists`, () => {
      assert.ok(fs.existsSync(manifestFile), `Missing out/data/${key}/manifest.json`);
      manifest = readJson(manifestFile);
    });
    if (!manifest) continue;

    check(`[${key}] every lesson has non-empty index.html and index.txt`, () => {
      let count = 0;
      for (const ch of manifest.chapters) {
        for (const l of ch.lessons) {
          routeOk(`g/${key}/chapters/${ch.id}/${l.slug}`);
          count++;
        }
      }
      const expected = manifest.stats?.totalLessons ?? count;
      assert.strictEqual(count, expected, `Manifest lists ${count} lessons, stats say ${expected}`);
      if (key === "secondary-2/programming-ai/term-1") assert.strictEqual(count, 14, "term-1 must have 14 lessons");
      console.log(`   ℹ️ ${count} lesson routes verified`);
    });

    check(`[${key}] companion lesson pages exist`, () => {
      let count = 0;
      for (const comp of manifest.companions || []) {
        if (comp.status !== "available") continue;
        for (const l of comp.lessons) {
          routeOk(`g/${key}/${comp.slug}/${l.chapterId}/${l.slug}`, { txt: false });
          count++;
        }
      }
      console.log(`   ℹ️ ${count} companion lesson routes verified`);
    });

    check(`[${key}] part home, exams, glossary and simulators pages exist`, () => {
      for (const sub of ["", "exams", "glossary", "simulators"]) routeOk(`g/${key}/${sub}`);
    });

    check(`[${key}] offline list exists and every url maps to a file in out/`, () => {
      const listFile = path.join(outDir, "offline", `${key.split("/").join("__")}.json`);
      assert.ok(fs.existsSync(listFile), `Missing out/offline/${path.basename(listFile)}`);
      const list = readJson(listFile);
      assert.strictEqual(list.partKey, key, "offline list partKey mismatch");
      assert.strictEqual(list.contentHash, manifest.contentHash, "offline list contentHash must match the part manifest");
      assert.ok(Array.isArray(list.urls) && list.urls.length > 0, "offline list urls must be non-empty");
      const { pages, data, images, assets } = list.counts || {};
      assert.strictEqual(pages + data + images + assets, list.urls.length, "counts must add up to urls.length");

      const missing = list.urls.filter((url) => {
        let rel = url;
        try {
          rel = decodeURIComponent(url);
        } catch {
          /* keep raw */
        }
        if (rel.endsWith("/")) rel += "index.html";
        return !fs.existsSync(path.join(outDir, ...rel.split("/").filter(Boolean)));
      });
      assert.strictEqual(missing.length, 0, `${missing.length} urls have no file in out/: ${missing.slice(0, 5).join(", ")}`);
      for (const must of ["/", "/dashboard/", "/data/catalog.json", `/data/${key}/manifest.json`, `/g/${key}/`, `/g/${key}/index.txt`]) {
        assert.ok(list.urls.includes(must), `offline list must include ${must}`);
      }
      assert.ok(list.urls.some((u) => u.startsWith("/_next/static/")), "offline list must include /_next/static assets");
      console.log(`   ℹ️ ${list.urls.length} urls (${pages} pages, ${data} data, ${images} images, ${assets} assets)`);
    });

    // Legacy redirects only exist for the legacy (term-1) part
    if (key === "secondary-2/programming-ai/term-1") {
      check(`Legacy redirect pages exist for ${key}`, () => {
        for (const ch of manifest.chapters) {
          for (const l of ch.lessons) routeOk(`chapters/${ch.id}/${l.slug}`, { txt: false });
        }
        for (const page of ["exams", "practice", "glossary", "simulators"]) routeOk(page, { txt: false });
      });
    }
  }

  check("Catalog home and dashboard exist as static HTML", () => {
    routeOk("");
    routeOk("dashboard");
  });
}

console.log("\n=================================================");
console.log(`🏁 VERIFICATION SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log("=================================================");

if (failed > 0) {
  process.exit(1);
}
