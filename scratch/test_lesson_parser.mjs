import fs from 'fs';

const pages = JSON.parse(fs.readFileSync('scratch/extracted_raw_pages.json', 'utf8'));

// Let's write a parser for Lesson 1-1 (pages 3-9) and see how it parses questions
function parseLesson(startPage, endPage) {
  const lessonPages = pages.slice(startPage - 1, endPage);
  const allLines = [];
  
  for (const p of lessonPages) {
    for (const l of p.lines) {
      // ignore header/footer lines like 'صطءا صطناال صطناعي1 3' or '4 الفصل الدراىس األول' or 'الفرتة األوىل األسبوع ...'
      if (/الفصل الدرا[يس]ى? األول|صطءا صطناال|^\d+\s*الفصل|^\s*\d+\s*$/i.test(l.trim())) {
        continue;
      }
      allLines.push({ page: p.page, text: l.trim() });
    }
  }

  return allLines;
}

const lines1_1 = parseLesson(3, 9);
console.log('Total filtered lines in Lesson 1-1:', lines1_1.length);
fs.writeFileSync('scratch/lesson_1_1_lines.json', JSON.stringify(lines1_1, null, 2), 'utf8');
