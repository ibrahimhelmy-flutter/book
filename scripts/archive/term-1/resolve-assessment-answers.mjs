import fs from 'fs';
import path from 'path';

// Helper to search textbook for keywords and extract relevant sentence/definition
export function findTextbookEvidence(textbook, primaryPageStart, primaryPageEnd, keywords) {
  for (let p = primaryPageStart; p <= primaryPageEnd; p++) {
    const pageObj = textbook[p];
    if (!pageObj || !pageObj.text) continue;
    const lines = pageObj.text.split('\n');
    for (const line of lines) {
      const matchCount = keywords.filter(k => line.includes(k)).length;
      if (matchCount >= Math.min(2, keywords.length)) {
        return { page: p, text: line.trim() };
      }
    }
  }
  return null;
}
