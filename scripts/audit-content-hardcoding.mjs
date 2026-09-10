import fs from 'fs';
import path from 'path';

console.log('🔍 Running Educational Content Hardcoding Audit...');

const FORBIDDEN_RULES = [
  {
    name: 'Hardcoded Chapter Dropdown Option',
    fileRegex: /\.(tsx|jsx)$/,
    pattern: /<option[^>]*value=["']chapter-\d+["'][^>]*>.*[\u0600-\u06FF]+/i,
    description: 'Found hardcoded chapter <option> in JSX. Must dynamically map from CURRICULUM_DATA.'
  },
  {
    name: 'Hardcoded Curriculum Chapter Definition in Components',
    dir: 'src/components',
    fileRegex: /\.(ts|tsx)$/,
    pattern: /id:\s*["']chapter-\d+["'],\s*title:\s*["'][\u0600-\u06FF]+/i,
    description: 'Found hardcoded chapter array in components.'
  },
  {
    name: 'Hardcoded Committee Questions Pool in Lib',
    fileRegex: /committeeBank\.(ts|js)$/,
    pattern: /const\s+SPECIALIZED_COMMITTEE_QUESTIONS\s*:\s*CommitteeQuestion\[\]\s*=\s*\[\s*\{/i,
    description: 'SPECIALIZED_COMMITTEE_QUESTIONS must be imported from @/data/committee-questions, not hardcoded.'
  },
  {
    name: 'Hardcoded Deep Questions Array in Lib or Components',
    dir: 'src/components',
    fileRegex: /\.(ts|tsx)$/,
    pattern: /const\s+CHAPTER_\d+_DEEP_QUESTIONS\s*=/i,
    description: 'Deep questions must be loaded from @/data/deep-questions, not hardcoded in components.'
  }
];

let violations = 0;

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') {
        scanDir(fullPath);
      }
    } else if (entry.isFile()) {
      const relPath = path.relative('.', fullPath).replace(/\\/g, '/');
      const content = fs.readFileSync(fullPath, 'utf8');

      FORBIDDEN_RULES.forEach(rule => {
        if (rule.dir && !relPath.startsWith(rule.dir)) return;
        if (rule.fileRegex && !rule.fileRegex.test(entry.name)) return;

        if (rule.pattern.test(content)) {
          console.error(`  ❌ CONTENT VIOLATION: [${rule.name}] in ${relPath}`);
          console.error(`     Reason: ${rule.description}`);
          violations++;
        }
      });
    }
  }
}

['src/components', 'src/app', 'src/lib'].forEach(d => scanDir(d));

console.log('\n======================================================');
console.log('🔍 CONTENT HARDCODING AUDIT REPORT');
console.log('======================================================');
console.log(`Educational content violations: ${violations}`);
console.log('======================================================');

if (violations === 0) {
  console.log('🏆 100% CLEAN: All components and libraries consume dynamic curriculum data!');
  process.exit(0);
} else {
  console.error(`❌ FAILED: Found ${violations} content hardcoding violations.`);
  process.exit(1);
}
