/**
 * Runs every tests/unit/*.test.ts with tsx, one process per file (each test is a plain
 * script with its own assert and exit code). Pass file-name filters to run a subset:
 *   node scripts/run-unit-tests.mjs arabic storage
 */
import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const dir = path.resolve('tests', 'unit');
const filters = process.argv.slice(2);
const files = fs.readdirSync(dir)
  .filter((f) => f.endsWith('.test.ts'))
  .filter((f) => filters.length === 0 || filters.some((x) => f.includes(x)))
  .sort();

const tsxCli = path.resolve('node_modules', 'tsx', 'dist', 'cli.mjs');
const failed = [];
for (const f of files) {
  console.log(`\n▶ ${f}`);
  const r = spawnSync(process.execPath, [tsxCli, path.join(dir, f)], { stdio: 'inherit' });
  if (r.status !== 0) failed.push(f);
}

console.log(`\n🏁 ${files.length - failed.length}/${files.length} unit test files passed`);
if (failed.length) {
  console.error(`❌ Failed: ${failed.join(', ')}`);
  process.exit(1);
}
