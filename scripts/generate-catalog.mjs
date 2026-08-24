import fs from 'fs';
import path from 'path';

const dir = path.resolve('public', 'images', 'extracted');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.jpg'));

console.log(`Found ${files.length} images.`);

// Write an HTML viewer to easily see and map all images with their exact index and preview
let html = `<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8" />
<title>PDF Extracted Images Catalog</title>
<style>
body { font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 20px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 12px; text-align: center; }
img { max-width: 100%; max-height: 220px; object-fit: contain; background: #020617; border-radius: 8px; }
.name { font-weight: bold; font-family: monospace; color: #38bdf8; margin: 8px 0; }
.size { font-size: 11px; color: #94a3b8; }
</style>
</head>
<body>
<h1>كتالوج الصور المستخرجة من الكتاب المدرسي (${files.length} صورة)</h1>
<div class="grid">
`;

for (const file of files) {
  const filePath = path.join(dir, file);
  const stats = fs.statSync(filePath);
  html += `
  <div class="card">
    <div class="name">${file}</div>
    <img src="/images/extracted/${file}" alt="${file}" />
    <div class="size">${(stats.size / 1024).toFixed(1)} KB</div>
  </div>
  `;
}

html += `
</div>
</body>
</html>
`;

fs.writeFileSync(path.resolve('public', 'catalog.html'), html);
console.log('Saved catalog to public/catalog.html');
