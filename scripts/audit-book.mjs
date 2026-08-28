import fs from 'fs';

const fullText = JSON.parse(fs.readFileSync('Programming-ArtificialIntelligence-Ar-EB-part1_full_text.json', 'utf8'));

console.log('Total pages in extracted text:', fullText.length);

for (let p = 4; p <= 11; p++) {
  const pageObj = fullText.find(item => item.page === p);
  console.log('\n================== PAGE ' + p + ' ==================');
  if (pageObj) {
    console.log(pageObj.text);
  } else {
    console.log('PAGE NOT FOUND');
  }
}

