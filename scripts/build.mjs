import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import process from 'process';

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

// Write the list of all hashed static assets (JS chunks, CSS, fonts) for the offline pack.
// Lazily loaded chunks (next/dynamic) are not referenced in page HTML, so without this list
// they are never cached and pages crash with ChunkLoadError when opened offline.
const staticDir = path.resolve('out', '_next', 'static');
if (fs.existsSync(staticDir)) {
  const assets = fs.readdirSync(staticDir, { recursive: true })
    .filter((rel) => fs.statSync(path.join(staticDir, rel)).isFile())
    .map((rel) => `/_next/static/${rel.split(path.sep).join('/')}`)
    .sort();
  fs.writeFileSync(path.resolve('out', 'offline-assets.json'), JSON.stringify({ assets }, null, 2));
  console.log(`✓ Wrote out/offline-assets.json (${assets.length} static assets for the offline pack)`);
}
