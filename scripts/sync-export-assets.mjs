import fs from 'fs';
import path from 'path';

console.log('🚀 Running post-export static asset synchronization and audit...');

const outDir = path.resolve('out');
const publicImagesDir = path.resolve('public', 'images');
const diagramsSourceDir = path.resolve('book-sources', 'term-1', '04-extracted-diagrams');
const outImagesDir = path.resolve('out', 'images');
const outExtractedDir = path.resolve('out', 'images', 'extracted');

if (!fs.existsSync(outDir)) {
  console.error('❌ Error: out/ directory does not exist! Build export failed.');
  process.exit(1);
}

// 1. Ensure out/images/extracted exists
if (!fs.existsSync(outExtractedDir)) {
  fs.mkdirSync(outExtractedDir, { recursive: true });
}

// 2. Ensure all images from public/images are recursively copied to out/images
function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
copyRecursive(publicImagesDir, outImagesDir);

// 3. Also copy directly from 04-extracted-diagrams as single source of truth
if (fs.existsSync(diagramsSourceDir)) {
  const sourceFiles = fs.readdirSync(diagramsSourceDir);
  for (const file of sourceFiles) {
    const srcPath = path.join(diagramsSourceDir, file);
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, path.join(outExtractedDir, file));
    }
  }
}

// 4. Ensure .nojekyll exists in out/ to prevent GitHub Pages Jekyll from ignoring _next/
const noJekyllPath = path.join(outDir, '.nojekyll');
if (!fs.existsSync(noJekyllPath)) {
  fs.writeFileSync(noJekyllPath, '');
  console.log('  📄 Added .nojekyll to out/');
}

// 5. Audit all curriculum images in out/
const curriculumPath = path.resolve('src', 'data', 'curriculum.ts');
const curriculumText = fs.readFileSync(curriculumPath, 'utf-8');
const regex = /"src":\s*"([^"]+)"/g;
let match;
const expectedImages = new Set();
while ((match = regex.exec(curriculumText)) !== null) {
  expectedImages.add(match[1]);
}

let missingCount = 0;
let verifiedCount = 0;
for (const imgPath of expectedImages) {
  const cleanPath = imgPath.startsWith('/') ? imgPath.slice(1) : imgPath;
  const targetPath = path.join(outDir, cleanPath);
  if (!fs.existsSync(targetPath)) {
    console.error(`  ❌ Missing in production export: ${imgPath} -> ${targetPath}`);
    missingCount++;
  } else {
    const stats = fs.statSync(targetPath);
    if (stats.size === 0) {
      console.error(`  ❌ Empty file in production export: ${imgPath}`);
      missingCount++;
    } else {
      verifiedCount++;
    }
  }
}

if (missingCount > 0) {
  console.error(`\n🚨 CRITICAL ERROR: ${missingCount} required curriculum images missing from out/ directory!`);
  process.exit(1);
}

console.log(`✅ Production asset audit passed! Verified ${verifiedCount}/${expectedImages.size} curriculum images present and non-empty in out/. 🎉`);
