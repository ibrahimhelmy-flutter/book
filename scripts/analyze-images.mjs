import fs from 'fs';
import path from 'path';

const dir = path.resolve('public', 'images', 'extracted');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

console.log(`Analyzing ${files.length} extracted images...`);

const stats = files.map(file => {
  const filePath = path.join(dir, file);
  const st = fs.statSync(filePath);
  return {
    file,
    sizeKb: (st.size / 1024).toFixed(1)
  };
});

console.table(stats);
