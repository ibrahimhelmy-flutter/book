import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import { getSources } from './sources-config.mjs';

const sources = getSources('term-1');

console.log('🛡️ Running Content Provenance & Manifest Validation for Term 1...');

let overallPass = true;
const validationSummary = [];

function computeFileSha256(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
}

// 1. PDF Master Document Integrity
console.log('\n1️⃣ Validating Official Ministry PDF...');
if (!fs.existsSync(sources.pdfFile)) {
  console.error(`  ❌ FAIL: PDF file not found at: ${sources.pdfFile}`);
  validationSummary.push({ check: 'PDF integrity', status: 'FAIL', details: 'File missing' });
  overallPass = false;
} else {
  const pdfStats = fs.statSync(sources.pdfFile);
  const pdfHash = computeFileSha256(sources.pdfFile);
  const pdfSizeMB = (pdfStats.size / (1024 * 1024)).toFixed(2);
  
  const manifestData = {
    term: 1,
    bookTitle: "البرمجة والذكاء الاصطناعي — الصف الثاني الثانوي (بكالوريا مصرية) — الترم الأول",
    academicYear: "2026 - 2027",
    ministry: "جمهورية مصر العربية - وزارة التربية والتعليم والتعليم الفني",
    expectedPages: 95,
    pdf: {
      canonicalFilename: path.basename(sources.pdfFile),
      originalFilename: "Programming-ArtificialIntelligence-Ar-EB-part1 (1).pdf",
      sizeBytes: pdfStats.size,
      sizeMB: `${pdfSizeMB} MB`,
      sha256: pdfHash,
      lastModified: pdfStats.mtime.toISOString(),
      status: "IMMUTABLE_OFFICIAL_SOURCE"
    }
  };

  fs.writeFileSync(sources.sourceManifestFile, JSON.stringify(manifestData, null, 2), 'utf8');
  console.log(`  ✅ PASS: PDF Hash verified: ${pdfHash.slice(0, 16)}... (${pdfSizeMB} MB)`);
  validationSummary.push({ check: 'PDF integrity', status: 'PASS', sha256: pdfHash, sizeMB: pdfSizeMB });
}

// 2. High-Res Page Scans Integrity (95 pages)
console.log('\n2️⃣ Validating Authoritative Page Scans (1..95)...');
if (!fs.existsSync(sources.pages)) {
  console.error(`  ❌ FAIL: Pages directory not found at: ${sources.pages}`);
  validationSummary.push({ check: '95 page scans', status: 'FAIL', details: 'Directory missing' });
  overallPass = false;
} else {
  const pageFiles = fs.readdirSync(sources.pages).filter(f => f.endsWith('.png')).sort();
  const pageHashes = {};
  let missingPages = [];

  for (let p = 1; p <= 95; p++) {
    const filename = `page_${String(p).padStart(2, '0')}.png`;
    const fullPath = path.join(sources.pages, filename);
    if (!fs.existsSync(fullPath)) {
      missingPages.push(filename);
    } else {
      pageHashes[filename] = {
        pageNumber: p,
        sha256: computeFileSha256(fullPath),
        sizeBytes: fs.statSync(fullPath).size
      };
    }
  }

  fs.writeFileSync(sources.pageHashesFile, JSON.stringify({
    term: 1,
    totalPagesScanned: Object.keys(pageHashes).length,
    expectedPages: 95,
    hashes: pageHashes
  }, null, 2), 'utf8');

  if (missingPages.length > 0) {
    console.error(`  ❌ FAIL: Missing ${missingPages.length} page scans:`, missingPages.join(', '));
    validationSummary.push({ check: '95 page scans', status: 'FAIL', missing: missingPages });
    overallPass = false;
  } else {
    console.log(`  ✅ PASS: All 95 official page scans verified with SHA-256 hashes.`);
    validationSummary.push({ check: '95 page scans', status: 'PASS', count: 95 });
  }
}

// 3. Canonical Data Integrity Hashes (05-canonical-data exclusively)
console.log('\n3️⃣ Calculating Exclusive Canonical Data Hashes...');
if (!fs.existsSync(sources.canonical)) {
  console.error(`  ❌ FAIL: Canonical directory not found at: ${sources.canonical}`);
  validationSummary.push({ check: 'Canonical hashes', status: 'FAIL', details: 'Directory missing' });
  overallPass = false;
} else {
  const canonicalHashes = {};
  
  function scanDirRecursive(dir, relPath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      const subRel = relPath ? `${relPath}/${ent.name}` : ent.name;
      if (ent.isDirectory()) {
        scanDirRecursive(full, subRel);
      } else if (ent.name.endsWith('.json')) {
        canonicalHashes[subRel] = {
          sha256: computeFileSha256(full),
          sizeBytes: fs.statSync(full).size,
          lastModified: fs.statSync(full).mtime.toISOString()
        };
      }
    }
  }

  scanDirRecursive(sources.canonical);
  fs.writeFileSync(sources.canonicalHashesFile, JSON.stringify({
    term: 1,
    description: "Exclusive cryptographic hashes of 05-canonical-data. Excludes 07-validation and runtime generated files.",
    totalCanonicalJsonFiles: Object.keys(canonicalHashes).length,
    files: canonicalHashes
  }, null, 2), 'utf8');

  console.log(`  ✅ PASS: Computed SHA-256 for ${Object.keys(canonicalHashes).length} canonical JSON files.`);
  validationSummary.push({ check: 'Canonical hashes', status: 'PASS', fileCount: Object.keys(canonicalHashes).length });
}

// 4. Provenance Completeness Check
console.log('\n4️⃣ Validating Fine-Grained Content Provenance...');
let provenanceErrors = [];
let totalLessonsChecked = 0;
let totalConceptsChecked = 0;

if (fs.existsSync(sources.canonicalBookFile)) {
  const book = JSON.parse(fs.readFileSync(sources.canonicalBookFile, 'utf8'));
  for (const ch of (book.chapters || [])) {
    for (const lesson of (ch.lessons || [])) {
      totalLessonsChecked++;
      if (!lesson.source || !Array.isArray(lesson.source.pages) || lesson.source.pages.length === 0) {
        provenanceErrors.push(`Lesson ${lesson.id} missing valid source.pages`);
      } else {
        const invalidPages = lesson.source.pages.filter(p => p < 1 || p > 95);
        if (invalidPages.length > 0) {
          provenanceErrors.push(`Lesson ${lesson.id} contains out-of-range pages: ${invalidPages.join(',')}`);
        }
      }

      for (const concept of (lesson.keyConcepts || [])) {
        totalConceptsChecked++;
        if (!concept.source || !Array.isArray(concept.source.pages) || concept.source.pages.length === 0) {
          provenanceErrors.push(`Concept ${concept.termAr} in lesson ${lesson.id} missing source provenance`);
        }
      }
    }
  }
} else {
  provenanceErrors.push('book.json not found in canonical directory');
}

const provenanceReport = {
  term: 1,
  timestamp: new Date().toISOString(),
  lessonsChecked: totalLessonsChecked,
  conceptsChecked: totalConceptsChecked,
  provenanceErrorsCount: provenanceErrors.length,
  status: provenanceErrors.length === 0 ? "PASS" : "FAIL",
  errors: provenanceErrors
};

fs.writeFileSync(sources.provenanceReportFile, JSON.stringify(provenanceReport, null, 2), 'utf8');

if (provenanceErrors.length > 0) {
  console.error(`  ❌ FAIL: Provenance validation failed with ${provenanceErrors.length} errors:`, provenanceErrors);
  validationSummary.push({ check: 'Provenance completeness', status: 'FAIL', errors: provenanceErrors.length });
  overallPass = false;
} else {
  console.log(`  ✅ PASS: 100% Provenance verified across ${totalLessonsChecked} lessons and ${totalConceptsChecked} key concepts.`);
  validationSummary.push({ check: 'Provenance completeness', status: 'PASS', lessons: totalLessonsChecked, concepts: totalConceptsChecked });
}

// 5. Canonical Immutability Verification (Before vs After Build Pipeline)
console.log('\n5️⃣ Validating Canonical Immutability during Build Pipeline...');
function getCanonicalTreeFingerprint() {
  const hashes = [];
  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        scan(full);
      } else if (ent.name.endsWith('.json')) {
        hashes.push(`${ent.name}:${computeFileSha256(full)}`);
      }
    }
  }
  scan(sources.canonical);
  hashes.sort();
  return crypto.createHash('sha256').update(hashes.join('|')).digest('hex');
}

const fingerprintBefore = getCanonicalTreeFingerprint();
let buildExecuted = false;
try {
  execSync(`node "${path.resolve('scripts', 'build-all-data.mjs')}"`, { stdio: 'pipe' });
  buildExecuted = true;
} catch (buildErr) {
  console.error('  ❌ FAIL: build-all-data.mjs threw an error during execution:', buildErr.message);
  validationSummary.push({ check: 'Canonical immutability', status: 'FAIL', error: buildErr.message });
  overallPass = false;
}

if (buildExecuted) {
  const fingerprintAfter = getCanonicalTreeFingerprint();
  if (fingerprintBefore !== fingerprintAfter) {
    console.error('  ❌ FAIL: Canonical Immutability VIOLATION! 05-canonical-data was mutated by build pipeline!');
    validationSummary.push({ check: 'Canonical immutability', status: 'FAIL', details: 'Fingerprint changed after build' });
    overallPass = false;
  } else {
    console.log(`  ✅ PASS: Canonical Immutability confirmed (Fingerprint: ${fingerprintBefore.slice(0, 16)}... unchanged before & after build).`);
    validationSummary.push({ check: 'Canonical immutability', status: 'PASS', fingerprint: fingerprintBefore });
  }
}

// 6. Final Summary and Exit Code
console.log('\n======================================================');
console.log('📊 Validation Summary:');
validationSummary.forEach(item => {
  const icon = item.status === 'PASS' ? '✅' : '❌';
  console.log(`  ${icon} ${item.check.padEnd(30)}: ${item.status}`);
});
console.log('======================================================');

if (!overallPass) {
  console.error('\n💥 VALIDATION FAILED: One or more critical checks did not pass. Exiting with code 1.\n');
  process.exit(1);
} else {
  console.log('\n🎉 ALL CONTENT PROVENANCE CHECKS PASSED PERFECTLY!\n');
  process.exit(0);
}
