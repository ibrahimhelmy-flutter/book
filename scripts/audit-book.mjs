import fs from 'fs';
import { getSources } from './sources-config.mjs';

const sources = getSources('term-1');
const rawPath = fs.existsSync(sources.rawFullTextFile) ? sources.rawFullTextFile : 'Programming-ArtificialIntelligence-Ar-EB-part1_full_text.json';
const fullText = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

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

