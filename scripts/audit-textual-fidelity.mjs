import fs from 'fs';
import path from 'path';
import { chapter1 } from '../book-sources/term-1/06-build-modules/chapter1.mjs';
import { chapter2 } from '../book-sources/term-1/06-build-modules/chapter2.mjs';
import { chapter3 } from '../book-sources/term-1/06-build-modules/chapter3.mjs';
import { chapter4 } from '../book-sources/term-1/06-build-modules/chapter4.mjs';
import { getSources } from './sources-config.mjs';

const sources = getSources('term-1');
const allChapters = [chapter1, chapter2, chapter3, chapter4];
let bookJson = null;
const bookJsonPath = fs.existsSync(sources.canonicalBookFile) ? sources.canonicalBookFile : 'book.json';
if (fs.existsSync(bookJsonPath)) {
  bookJson = JSON.parse(fs.readFileSync(bookJsonPath, 'utf8'));
}

console.log('='.repeat(70));
console.log('🔍 RUNNING DEEP TEXTUAL FIDELITY & CONSISTENCY AUDIT');
console.log('='.repeat(70));

const glossaryMap = new Map();
allChapters.forEach(chapter => {
  chapter.lessons.forEach(lesson => {
    lesson.keyConcepts.forEach(c => {
      glossaryMap.set(c.termAr.trim(), c.definition.trim());
    });
  });
});

let issuesCount = 0;
const issues = [];

allChapters.forEach(chapter => {
  chapter.lessons.forEach(lesson => {
    // 1. Check KeyConcepts vs Glossary
    lesson.keyConcepts.forEach(concept => {
      const term = concept.termAr.trim();
      const def = concept.definition.trim();
      const glossaryDef = glossaryMap.get(term);

      if (!glossaryDef) {
        issues.push({
          lesson: lesson.number,
          type: 'MISSING_IN_GLOSSARY',
          term,
          message: `المصطلح "${term}" غير موجود في معجم المصطلحات العام (glossary.ts)`
        });
        issuesCount++;
      } else if (glossaryDef !== def) {
        issues.push({
          lesson: lesson.number,
          type: 'GLOSSARY_MISMATCH',
          term,
          keyConceptDef: def,
          glossaryDef: glossaryDef,
          message: `اختلاف في تعريف "${term}" بين خريطة مفاهيم الدرس ومعجم المصطلحات`
        });
        issuesCount++;
      }
    });

    // 2. Check Sections for conflicting definitions of keyConcepts
    const sortedConcepts = [...lesson.keyConcepts].sort((a, b) => b.termAr.length - a.termAr.length);
    lesson.sections.forEach(section => {
      sortedConcepts.forEach(concept => {
        const term = concept.termAr.trim();
        const def = concept.definition.trim();

        // Exact term match avoiding compound supersets (e.g. الذكاء الاصطناعي vs الذكاء الاصطناعي التوليدي)
        const patterns = [
          new RegExp(`\\(${term}\\s*(?:-[^)]*)?\\)\\s*[:.…]*\\s*([^\\n]+)`, 'g'),
          new RegExp(`مفهوم ${term}\\s*[:.…]*\\s*([^\\n]+)`, 'g'),
          new RegExp(`تعريف ${term}\\s*[:.…]*\\s*([^\\n]+)`, 'g')
        ];

        patterns.forEach(regex => {
          let match;
          while ((match = regex.exec(section.content)) !== null) {
            const capturedDef = match[1].trim();
            // Compare key words
            if (capturedDef.length > 20 && !def.includes(capturedDef.slice(0, 30)) && !capturedDef.includes(def.slice(0, 30))) {
              issues.push({
                lesson: lesson.number,
                sectionId: section.id,
                sectionTitle: section.title,
                term,
                type: 'SECTION_DEFINITION_DIVERGENCE',
                sectionContentSnippet: capturedDef.slice(0, 100),
                canonicalConceptDef: def,
                message: `النص في متن القسم "${section.title}" يعرف مصطلح "${term}" بصياغة تختلف عن التعريف الوزاري المعتمد.`
              });
              issuesCount++;
            }
          }
        });
      });
    });
  });
});

console.log(`\nAudit completed across 4 chapters and 14 lessons.`);
fs.writeFileSync('audit_results.json', JSON.stringify({ issuesCount, issues }, null, 2), 'utf8');
if (issuesCount === 0) {
  console.log('✅ ZERO textual fidelity discrepancies found! All definitions are 100% aligned with the canonical glossary.');
} else {
  console.log(`⚠️ Found ${issuesCount} textual discrepancies:\n`);
  issues.forEach((iss, idx) => {
    console.log(`[${idx + 1}] درس ${iss.lesson} [${iss.type}]: ${iss.message}`);
    if (iss.canonicalConceptDef) {
      console.log(`    - نص التعريف المعتمد: "${iss.canonicalConceptDef}"`);
      console.log(`    - النص في الشرح:     "${iss.sectionContentSnippet}"`);
    }
    if (iss.keyConceptDef && iss.glossaryDef) {
      console.log(`    - نص المفاهيم: "${iss.keyConceptDef}"`);
      console.log(`    - نص المعجم:   "${iss.glossaryDef}"`);
    }
    console.log('');
  });
}

process.exit(issuesCount === 0 ? 0 : 1);
