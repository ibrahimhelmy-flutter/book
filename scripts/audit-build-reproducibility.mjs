import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';

console.log('🔄 Running Deterministic Build Reproducibility Audit...');

const TARGET_FILES = [
  'src/data/curriculum.ts',
  'src/data/glossary.ts',
  'src/data/acronyms.ts',
  'src/data/simulators.ts',
  'src/data/committee-questions.ts',
  'src/data/books.ts',
  'src/data/deep-questions/index.ts',
  'src/data/deep-questions/chapter-1.ts',
  'src/data/deep-questions/chapter-2.ts',
  'src/data/deep-questions/chapter-3.ts',
  'src/data/deep-questions/chapter-4.ts'
];

function getFileHashes() {
  const hashes = {};
  for (const file of TARGET_FILES) {
    const fullPath = path.resolve(file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath);
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      hashes[file] = hash;
    } else {
      hashes[file] = 'MISSING';
    }
  }
  return hashes;
}

// Pass 1
console.log('  1️⃣ Executing Build Pass #1...');
execSync('node scripts/build-all-data.mjs', { stdio: 'pipe' });
const pass1Hashes = getFileHashes();

// Pass 2
console.log('  2️⃣ Executing Build Pass #2 (Verification)...');
execSync('node scripts/build-all-data.mjs', { stdio: 'pipe' });
const pass2Hashes = getFileHashes();

let mismatchCount = 0;
for (const file of TARGET_FILES) {
  const h1 = pass1Hashes[file];
  const h2 = pass2Hashes[file];
  if (h1 !== h2) {
    console.error(`  ❌ HASH MISMATCH: ${file}`);
    console.error(`     Pass 1: ${h1}`);
    console.error(`     Pass 2: ${h2}`);
    mismatchCount++;
  }
}

console.log('\n======================================================');
console.log('🔄 BUILD REPRODUCIBILITY AUDIT REPORT');
console.log('======================================================');
console.log(`Generated files verified       : ${TARGET_FILES.length}`);
console.log(`Deterministic hash matches     : ${TARGET_FILES.length - mismatchCount}/${TARGET_FILES.length}`);
console.log(`Non-deterministic discrepancies: ${mismatchCount}`);
console.log('======================================================');

if (mismatchCount === 0) {
  console.log('🏆 100% DETERMINISTIC BUILD CONFIRMED: Identical SHA-256 fingerprints across builds!');
  process.exit(0);
} else {
  console.error(`❌ FAILED: Build output is non-deterministic.`);
  process.exit(1);
}
