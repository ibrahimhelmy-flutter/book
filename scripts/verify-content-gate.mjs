import { execSync } from 'child_process';

console.log('🏛️ STARTING COMPREHENSIVE EDUCATIONAL CONTENT QUALITY GATE...\n');

const STEPS = [
  { id: '01', name: 'PDF Master Integrity & Hashes', cmd: 'node scripts/generate-source-manifest.mjs' },
  { id: '02', name: 'Strict Content Schema Contracts', cmd: 'node scripts/validate-content-schemas.mjs' },
  { id: '03', name: 'Concept Assessment Coverage Matrix', cmd: 'node scripts/audit-question-coverage.mjs' },
  { id: '04', name: 'Zero Duplicate & Semantic Similarity', cmd: 'node scripts/audit-question-duplicates.mjs' },
  { id: '05', name: 'Curriculum Boundary & Syllabus Scope', cmd: 'node scripts/validate-curriculum-boundary.mjs' },
  { id: '06', name: 'Educational Content Hardcoding Audit', cmd: 'node scripts/audit-content-hardcoding.mjs' },
  { id: '07', name: 'Deterministic Build Reproducibility', cmd: 'node scripts/audit-build-reproducibility.mjs' },
  { id: '08', name: 'Canonical Curriculum Fidelity (305 blocks)', cmd: 'node scripts/audit-canonical-fidelity.mjs' },
  { id: '09', name: 'Curriculum Compliance Benchmark (Gold Standard)', cmd: 'node scripts/validate-curriculum-compliance.mjs' },
  { id: '10', name: 'TypeScript Static Compilation Check', cmd: 'npx tsc --noEmit' },
  { id: '11', name: 'Scalable Exam Engine Tests (23/23)', cmd: 'npx tsx src/core/tests/engine.test.ts' }
];

const results = [];
let gateFailed = false;

for (const step of STEPS) {
  process.stdout.write(`⏳ [Step ${step.id}/11] Running ${step.name}... `);
  try {
    execSync(step.cmd, { stdio: 'pipe' });
    console.log('✅ PASS');
    results.push({ ...step, status: 'PASS' });
  } catch (err) {
    console.log('❌ FAIL');
    console.error(`\n--- Error Output for ${step.name} ---`);
    if (err.stdout) console.error(err.stdout.toString());
    if (err.stderr) console.error(err.stderr.toString());
    results.push({ ...step, status: 'FAIL' });
    gateFailed = true;
    break;
  }
}

console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
console.log('║               EDUCATIONAL CONTENT QUALITY GATE MATRIX                ║');
console.log('╠══════════════════════════════════════════════════════════════════════╣');

results.forEach(r => {
  const paddedName = r.name.padEnd(46, ' ');
  const statusStr = r.status === 'PASS' ? '[ PASS ✅ ]' : '[ FAIL ❌ ]';
  console.log(`║ ${r.id}. ${paddedName} ${statusStr} ║`);
});

console.log('╠══════════════════════════════════════════════════════════════════════╣');
if (!gateFailed) {
  console.log('║                   FINAL VERDICT: ALL GATES PASSED 🏆                 ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
  process.exit(0);
} else {
  console.log('║                   FINAL VERDICT: QUALITY GATE FAILED ❌               ║');
  console.log('╚══════════════════════════════════════════════════════════════════════╝\n');
  process.exit(1);
}
