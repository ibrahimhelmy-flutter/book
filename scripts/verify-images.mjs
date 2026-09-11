import fs from 'fs';
import path from 'path';

const curriculumPath = path.resolve('src', 'data', 'curriculum.ts');
const publicDir = path.resolve('public');
const content = fs.readFileSync(curriculumPath, 'utf-8');

const regex = /"src":\s*"([^"]+)"/g;
let match;
const srcs = new Set();

while ((match = regex.exec(content)) !== null) {
  srcs.add(match[1]);
}

console.log(`Found ${srcs.size} unique image references in curriculum.ts:`);
let missing = 0;
for (const s of srcs) {
  const rel = s.startsWith('/') ? s.slice(1) : s;
  const fullPath = path.join(publicDir, rel);
  if (!fs.existsSync(fullPath)) {
    console.error(`  ❌ MISSING: ${s} (expected at ${fullPath})`);
    missing++;
  } else {
    const size = fs.statSync(fullPath).size;
    console.log(`  ✅ FOUND: ${s} (${size} bytes)`);
  }
}

if (missing > 0) {
  console.error(`\nFAILED: ${missing} images missing!`);
  process.exit(1);
} else {
  console.log(`\nALL ${srcs.size} images verified on disk! 🎉`);
}
