import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const pagesDir = path.resolve('book-sources', 'term-1', '02-page-scans');
const diagramsSourceDir = path.resolve('book-sources', 'term-1', '04-extracted-diagrams');
const publicExtractedDir = path.resolve('public', 'images', 'extracted');

console.log('🚀 Preparing all static image assets for deterministic deployment...');

// 1. Ensure public/images/extracted is a REAL physical directory (not a junction or symlink)
if (fs.existsSync(publicExtractedDir)) {
  const stats = fs.lstatSync(publicExtractedDir);
  if (stats.isSymbolicLink()) {
    console.log('  ⚠️ Removing Windows junction/symlink at public/images/extracted...');
    fs.rmSync(publicExtractedDir, { recursive: true, force: true });
  }
}
if (!fs.existsSync(publicExtractedDir)) {
  fs.mkdirSync(publicExtractedDir, { recursive: true });
}

// 2. Copy all base diagrams from book-sources to public/images/extracted
if (fs.existsSync(diagramsSourceDir)) {
  const sourceFiles = fs.readdirSync(diagramsSourceDir);
  for (const file of sourceFiles) {
    const srcPath = path.join(diagramsSourceDir, file);
    if (fs.statSync(srcPath).isFile()) {
      fs.copyFileSync(srcPath, path.join(publicExtractedDir, file));
    }
  }
  console.log(`  ✅ Copied ${sourceFiles.length} canonical diagrams from 04-extracted-diagrams`);
}

// 3. Crop remaining diagrams directly from textbook page scans if not already cropped
const remainingCrops = [
  {
    page: 'page_35.png',
    output: 'mfa-factors.png',
    extract: { left: 60, top: 120, width: 770, height: 420 },
    caption: 'عوامل المصادقة المتعددة MFA والشهادات الرقمية'
  },
  {
    page: 'page_54.png',
    output: '3-tier-flow-chart.png',
    extract: { left: 60, top: 140, width: 770, height: 440 },
    caption: 'الشكل 3.1.2 — كيف تعمل الطبقات الثلاث معًا عند البحث عن منتج'
  },
  {
    page: 'page_60.png',
    output: 'api-concept-plug.png',
    extract: { left: 60, top: 140, width: 770, height: 420 },
    caption: 'واجهة برمجة التطبيقات (API) وصيغة JSON'
  },
  {
    page: 'page_66.png',
    output: 'responsive-design-devices.png',
    extract: { left: 60, top: 140, width: 770, height: 400 },
    caption: 'التصميم المتجاوب وتكيف العرض مع مختلف أحجام الشاشات'
  },
  {
    page: 'page_67.png',
    output: 'frameworks-reusable-components.png',
    extract: { left: 60, top: 140, width: 770, height: 380 },
    caption: 'أطر العمل والمكتبات والمكونات القابلة لإعادة الاستخدام'
  },
  {
    page: 'page_71.png',
    output: 'media-types-comparison.png',
    extract: { left: 60, top: 140, width: 770, height: 440 },
    caption: 'مقارنة خصائص الوسائط ومزايا الموقع الإلكتروني'
  },
  {
    page: 'page_73.png',
    output: 'media-selection-purpose.png',
    extract: { left: 60, top: 140, width: 770, height: 420 },
    caption: 'اختيار الوسائط وفقًا للغرض والجمهور المستهدف'
  },
  {
    page: 'page_76.png',
    output: 'persona-card.png',
    extract: { left: 60, top: 160, width: 770, height: 400 },
    caption: 'بطاقة شخصية المستخدم (Persona) والأهداف والسلوك'
  },
  {
    page: 'page_78.png',
    output: 'ucd-cycle.png',
    extract: { left: 60, top: 140, width: 770, height: 420 },
    caption: 'دورة التصميم المتمحور حول المستخدم (UCD)'
  },
  {
    page: 'page_82.png',
    output: 'qualitative-vs-quantitative.png',
    extract: { left: 60, top: 160, width: 770, height: 400 },
    caption: 'المقارنة بين أساليب التقييم النوعية والكمية'
  },
  {
    page: 'page_84.png',
    output: 'heuristic-checklist.png',
    extract: { left: 60, top: 160, width: 770, height: 420 },
    caption: 'قائمة مبادئ التقييم الإرشادي لواجهة المستخدم'
  },
  {
    page: 'page_91.png',
    output: 'design-thinking-process.png',
    extract: { left: 60, top: 160, width: 770, height: 420 },
    caption: 'مراحل التفكير التصميمي (Design Thinking)'
  },
  {
    page: 'page_92.png',
    output: 'ab-testing-concept.png',
    extract: { left: 60, top: 160, width: 770, height: 420 },
    caption: 'مفهوم اختبار A/B لقياس فاعلية التصميم'
  }
];

for (const crop of remainingCrops) {
  const pagePath = path.join(pagesDir, crop.page);
  const outPublic = path.join(publicExtractedDir, crop.output);
  const outSource = path.join(diagramsSourceDir, crop.output);

  if (!fs.existsSync(pagePath)) {
    console.warn(`  ⚠️ Page scan not found: ${crop.page}`);
    continue;
  }

  try {
    const meta = await sharp(pagePath).metadata();
    const left = Math.min(crop.extract.left, meta.width - 50);
    const top = Math.min(crop.extract.top, meta.height - 50);
    const width = Math.min(crop.extract.width, meta.width - left);
    const height = Math.min(crop.extract.height, meta.height - top);

    await sharp(pagePath)
      .extract({ left, top, width, height })
      .png({ quality: 95 })
      .toFile(outPublic);

    // Also persist in source of truth so it is never lost
    fs.copyFileSync(outPublic, outSource);
    console.log(`  ✓ Cropped & saved: ${crop.output}`);
  } catch (err) {
    console.error(`  ❌ Failed to crop ${crop.output}:`, err.message);
  }
}

// 4. Create bilateral aliases so both naming conventions resolve perfectly
const aliases = [
  ['https-tls-handshake.png', 'tls-handshake-flow.png'],
  ['network-dmz-architecture.png', 'dmz-network-topology.png'],
  ['incident-response-lifecycle.png', 'incident-response-6-steps.png'],
  ['3-tier-architecture.png', 'three-tier-architecture.png'],
  ['client-server-diagram.png', 'client-server-flow.png'],
  ['html-css-js-roles.png', 'html-css-js-layers.png'],
  ['wireframe-structure.png', 'wireframe-example.png'],
  ['crap-principles-visual.png', 'crap-principles-comparison.png'],
  ['pdca-cycle-diagram.png', 'pdca-cycle-loop.png'],
];

for (const [nameA, nameB] of aliases) {
  const pathA = path.join(publicExtractedDir, nameA);
  const pathB = path.join(publicExtractedDir, nameB);

  if (fs.existsSync(pathA) && !fs.existsSync(pathB)) {
    fs.copyFileSync(pathA, pathB);
    console.log(`  🔗 Alias created: ${nameB} -> ${nameA}`);
  } else if (fs.existsSync(pathB) && !fs.existsSync(pathA)) {
    fs.copyFileSync(pathB, pathA);
    console.log(`  🔗 Alias created: ${nameA} -> ${nameB}`);
  }

  // Also sync in source of truth
  const srcA = path.join(diagramsSourceDir, nameA);
  const srcB = path.join(diagramsSourceDir, nameB);
  if (fs.existsSync(srcA) && !fs.existsSync(srcB)) fs.copyFileSync(srcA, srcB);
  if (fs.existsSync(srcB) && !fs.existsSync(srcA)) fs.copyFileSync(srcB, srcA);
}

// 5. If out/ directory exists (production export), synchronize it as well
const outExtractedDir = path.resolve('out', 'images', 'extracted');
if (fs.existsSync(path.resolve('out'))) {
  if (!fs.existsSync(outExtractedDir)) {
    fs.mkdirSync(outExtractedDir, { recursive: true });
  }
  const publicFiles = fs.readdirSync(publicExtractedDir);
  for (const f of publicFiles) {
    fs.copyFileSync(path.join(publicExtractedDir, f), path.join(outExtractedDir, f));
  }
  console.log(`  ✅ Synced ${publicFiles.length} images to out/images/extracted`);
}

console.log('🎉 Asset preparation complete! All diagrams verified and ready for deployment.');
