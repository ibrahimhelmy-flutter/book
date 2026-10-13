import fs from 'fs';
import path from 'path';
import { listParts, getSources } from './sources-config.mjs';

/**
 * Copies each part's canonical diagrams (book-sources/<part>/04-extracted-diagrams)
 * to public/<assetsBase> (term-1: public/images/extracted). The public copies are
 * generated and gitignored; book-sources is the single source of truth.
 * Only changed files are written, to keep OneDrive sync churn low.
 */
console.log('🚀 Preparing static image assets per part...');

function syncDir(srcDir, destDir) {
  if (fs.existsSync(destDir) && fs.lstatSync(destDir).isSymbolicLink()) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });
  let copied = 0;
  let total = 0;
  for (const file of fs.readdirSync(srcDir)) {
    const src = path.join(srcDir, file);
    const st = fs.statSync(src);
    if (!st.isFile()) continue;
    total++;
    const dest = path.join(destDir, file);
    if (fs.existsSync(dest) && fs.statSync(dest).size === st.size) continue;
    fs.copyFileSync(src, dest);
    copied++;
  }
  return { copied, total };
}

for (const { key } of listParts()) {
  const sources = getSources(key);
  if (!fs.existsSync(sources.diagrams)) {
    console.log(`  ⏭️  ${key}: no 04-extracted-diagrams yet`);
    continue;
  }
  const dest = path.join(path.resolve('public'), ...sources.assetsBase.split('/').filter(Boolean));
  const { copied, total } = syncDir(sources.diagrams, dest);
  console.log(`  ✅ ${key}: ${total} diagrams → public${sources.assetsBase} (${copied} updated)`);
}

console.log('🎉 Asset preparation complete.');
