import fs from 'fs';

const issues = JSON.parse(fs.readFileSync('scratch/issues.json', 'utf8'));
let out = '';
issues.forEach((iss, idx) => {
  out += `[${idx + 1}] ID: ${iss.id} | Lesson: ${iss.lesson} | Field: ${iss.field}\nPattern: ${iss.pattern || iss.issue} | Match: '${iss.match}'\nSnippet: ${iss.snippet}\n----------------------------------------\n`;
});

fs.writeFileSync('scratch/all_issues_readable.txt', out, 'utf8');
console.log(`Wrote ${issues.length} issues to scratch/all_issues_readable.txt`);
