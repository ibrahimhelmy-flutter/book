import fs from 'fs';

for (const f of ['chapter1.mjs', 'chapter2.mjs', 'chapter3.mjs', 'chapter4.mjs']) {
  const content = fs.readFileSync('scripts/model-answers/' + f, 'utf8');
  const regex = /['"](OFFICIAL-[A-Za-z0-9_\-]+)['"]/g;
  const counts = {};
  let m;
  let total = 0;
  while ((m = regex.exec(content)) !== null) {
    counts[m[1]] = (counts[m[1]] || 0) + 1;
    total++;
  }
  const dupes = Object.entries(counts).filter(([k, v]) => v > 1);
  console.log(f, 'total matches:', total, 'unique:', Object.keys(counts).length, 'dupes:', dupes.length);
  if (dupes.length > 0) {
    console.log('  dupe samples:', dupes.slice(0, 6));
  }
}
