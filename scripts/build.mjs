import { spawnSync } from 'child_process';
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
