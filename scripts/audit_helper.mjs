import fs from 'fs';
import { getSources } from './sources-config.mjs';

const sources = getSources('term-1');

// Let's create a tool to read each lesson from curriculum.ts
const currContent = fs.readFileSync('src/data/curriculum.ts', 'utf8');

// Let's also load fullText
const rawPath = fs.existsSync(sources.rawFullTextFile) ? sources.rawFullTextFile : 'Programming-ArtificialIntelligence-Ar-EB-part1_full_text.json';
const fullText = JSON.parse(fs.readFileSync(rawPath, 'utf8'));

// Function to get book text for a page range
export function getBookText(startPage, endPage) {
  let out = '';
  for (let p = startPage + 1; p <= endPage + 1; p++) {
    const pObj = fullText.find(x => x.page === p);
    out += `\n--- [Page ${p - 1} (PDF ${p})] ---\n` + (pObj ? pObj.text : 'MISSING') + '\n';
  }
  return out;
}

console.log('Audit helper ready.');

