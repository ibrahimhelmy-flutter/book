import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

/**
 * Runs the data build twice and checks that every generated file under public/data/ is byte-identical.
 */
console.log('🔄 Running Deterministic Build Reproducibility Audit...');

const DATA_DIR = path.resolve('public', 'data');
const BUILD_DATA = `node "${path.resolve('node_modules', 'tsx', 'dist', 'cli.mjs')}" scripts/data/build-data.ts`;

function getFileHashes() {
  const hashes = {};
  if (!fs.existsSync(DATA_DIR)) return hashes;
  for (const rel of fs.readdirSync(DATA_DIR, { recursive: true })) {
    const full = path.join(DATA_DIR, rel);
    if (fs.statSync(full).isFile()) {
      hashes[rel.split(path.sep).join('/')] = crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex');
    }
  }
  return hashes;
}

console.log('  1️⃣ Executing Build Pass #1...');
execSync(BUILD_DATA, { stdio: 'pipe' });
const pass1 = getFileHashes();

// Settle file handles on Windows / OneDrive
Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 150);

console.log('  2️⃣ Executing Build Pass #2 (Verification)...');
execSync(BUILD_DATA, { stdio: 'pipe' });
const pass2 = getFileHashes();

const files = [...new Set([...Object.keys(pass1), ...Object.keys(pass2)])].sort();
const mismatches = files.filter((f) => pass1[f] !== pass2[f]);
mismatches.forEach((f) => console.error(`  ❌ HASH MISMATCH: ${f}`));

console.log('\n======================================================');
console.log('🔄 BUILD REPRODUCIBILITY AUDIT REPORT');
console.log('======================================================');
console.log(`Generated files verified       : ${files.length}`);
console.log(`Deterministic hash matches     : ${files.length - mismatches.length}/${files.length}`);
console.log(`Non-deterministic discrepancies: ${mismatches.length}`);
console.log('======================================================');

if (files.length > 0 && mismatches.length === 0) {
  console.log('🏆 100% DETERMINISTIC BUILD CONFIRMED: Identical SHA-256 fingerprints across builds!');
  process.exit(0);
}
console.error('❌ FAILED: Build output is missing or non-deterministic.');
process.exit(1);
