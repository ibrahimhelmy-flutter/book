import fs from 'fs';
import path from 'path';
import { partsFromArgs } from './sources-config.mjs';

/**
 * Post-export audit: every image referenced by an available part's canonical content
 * must exist (non-empty) in out/. Also guarantees .nojekyll for GitHub Pages.
 */
console.log('🚀 Running post-export static asset audit...');

const outDir = path.resolve('out');
if (!fs.existsSync(outDir)) {
  console.error('❌ Error: out/ directory does not exist! Build export failed.');
  process.exit(1);
}

const noJekyllPath = path.join(outDir, '.nojekyll');
if (!fs.existsSync(noJekyllPath)) fs.writeFileSync(noJekyllPath, '');

let missing = 0;
let verified = 0;
for (const sources of partsFromArgs()) {
  const text = fs.readFileSync(sources.canonicalBookFile, 'utf8');
  const expected = new Set([...text.matchAll(/"src":\s*"([^"]+)"/g)].map((m) => m[1]));
  for (const img of expected) {
    const target = path.join(outDir, img.replace(/^\//, ''));
    if (!fs.existsSync(target) || fs.statSync(target).size === 0) {
      console.error(`  ❌ ${sources.key}: missing in export: ${img}`);
      missing++;
    } else {
      verified++;
    }
  }
}

if (missing > 0) {
  console.error(`\n🚨 ${missing} required curriculum images missing from out/!`);
  process.exit(1);
}
console.log(`✅ Production asset audit passed: ${verified} curriculum images present in out/.`);
