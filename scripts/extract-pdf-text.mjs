/**
 * Extracts the text layer of a part's PDF into 03-raw-extractions/<rawFullTextFile> as
 * [{ page, text }] in logical (reading) order.
 *
 * Some Ministry PDFs (e.g. term-2) expose Arabic as single glyphs in visual left-to-right order.
 * Each line is rebuilt from glyph positions: items are grouped by baseline, ordered right-to-left,
 * while runs of Latin letters / digits keep their left-to-right order (a minimal bidi pass).
 * Presentation forms are normalised with NFKC. The PDF itself is never modified.
 *
 *   node scripts/extract-pdf-text.mjs --part term-2                 # write the JSON
 *   node scripts/extract-pdf-text.mjs --part term-2 --print 5-7     # print pages 5..7 only
 */
import fs from 'fs';
import path from 'path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { getSources, partArg, assertPartSources } from './sources-config.mjs';

const sources = getSources(partArg());
assertPartSources(sources, ['pdfFile']);

const printIdx = process.argv.indexOf('--print');
const printRange = printIdx >= 0 ? process.argv[printIdx + 1].split('-').map(Number) : null;

const STRONG_LTR = /[A-Za-z0-9٠-٩]/;
const STRONG_RTL = /[֐-ࣿיִ-﷿ﹰ-﻿]/;
const MIRROR = { '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '«': '»', '»': '«', '<': '>', '>': '<' };

const IS_MARK = /^\p{M}+$/u;

/** After reversing visual glyphs, a combining mark (tanween, shadda…) precedes its base letter: swap them back. */
function moveMarksAfterBase(items) {
  const out = [...items];
  for (let i = 0; i < out.length - 1; i++) {
    if (IS_MARK.test(out[i].str) && !IS_MARK.test(out[i + 1].str) && out[i + 1].str.trim()) {
      [out[i], out[i + 1]] = [out[i + 1], out[i]];
      i++;
    }
  }
  return out;
}

const strength = (s) => (STRONG_RTL.test(s) ? 'rtl' : STRONG_LTR.test(s) ? 'ltr' : 'neutral');

/** Orders one visual line (items sorted left→right) into logical order. */
function logicalLine(items) {
  const typed = items.map((it) => ({ ...it, kind: strength(it.str) }));
  const hasRtl = typed.some((t) => t.kind === 'rtl');
  if (!hasRtl) return typed.map((t) => t.str).join('');

  // Neutrals between two LTR items belong to the LTR run (e.g. "5-1", "3.14", "A/B").
  for (let i = 0; i < typed.length; i++) {
    if (typed[i].kind !== 'neutral') continue;
    let l = i - 1;
    while (l >= 0 && typed[l].kind === 'neutral') l--;
    let r = i + 1;
    while (r < typed.length && typed[r].kind === 'neutral') r++;
    if (l >= 0 && r < typed.length && typed[l].kind === 'ltr' && typed[r].kind === 'ltr') typed[i].kind = 'ltr-n';
  }

  // Split into runs, reverse run order and reverse the items of non-LTR runs.
  const runs = [];
  for (const t of typed) {
    const isLtr = t.kind === 'ltr' || t.kind === 'ltr-n';
    const last = runs[runs.length - 1];
    if (last && last.ltr === isLtr) last.items.push(t);
    else runs.push({ ltr: isLtr, items: [t] });
  }
  return runs
    .reverse()
    .map((run) =>
      run.ltr
        ? run.items.map((t) => t.str).join('')
        : moveMarksAfterBase(run.items.reverse())
            .map((t) => (t.str.length === 1 && MIRROR[t.str] ? MIRROR[t.str] : t.str))
            .join('')
    )
    .join('');
}

async function extractPage(page) {
  const tc = await page.getTextContent();
  const items = tc.items
    .filter((i) => typeof i.str === 'string' && i.str.length > 0)
    // A lam-alef ligature glyph (ﻻ, one narrow glyph) is emitted in visual order as "ال": restore "لا".
    // A real alef + lam pair (e.g. the end of "سؤال") is two glyphs wide and keeps its order.
    .map((i) => {
      const isLigature = /^[آأإا]ل$/.test(i.str) && i.width / (Math.abs(i.transform[3]) || 1) < 0.85;
      return { ...i, str: isLigature ? `${i.str[1]}${i.str[0]}` : i.str };
    })
    .map((i) => ({ str: i.str, x: i.transform[4], y: i.transform[5], w: i.width, h: Math.abs(i.transform[3]) || 10 }));

  // Group into lines by baseline (tolerance relative to glyph height).
  items.sort((a, b) => b.y - a.y || a.x - b.x);
  const lines = [];
  for (const it of items) {
    const line = lines.find((l) => Math.abs(l.y - it.y) <= Math.max(2, it.h * 0.35));
    if (line) line.items.push(it);
    else lines.push({ y: it.y, items: [it] });
  }
  lines.sort((a, b) => b.y - a.y);

  // Lesson pages have a narrow side column on the left (lesson map, key terms, think boxes). Segments
  // that end before SIDE_COLUMN_RATIO of the page width go to a separate side stream, so main-column
  // sentences that continue across lines are not interrupted by side-column text.
  const pageWidth = page.view[2] - page.view[0];
  const sideLimit = page.view[0] + pageWidth * SIDE_COLUMN_RATIO;
  const main = [];
  const side = [];
  for (const line of lines) {
    line.items.sort((a, b) => a.x - b.x);
    const segments = [];
    line.items.forEach((it, i) => {
      const prev = line.items[i - 1];
      if (!prev || it.x - (prev.x + prev.w) > it.h * 2.5) segments.push([]);
      segments[segments.length - 1].push(it);
    });
    const mainSegs = [];
    const sideSegs = [];
    for (const seg of segments) {
      const right = Math.max(...seg.map((it) => it.x + it.w));
      (right < sideLimit ? sideSegs : mainSegs).push(seg);
    }
    // Large gaps inside one column (table cells) become a tab.
    const render = (segs) =>
      segs.length === 0
        ? ''
        : logicalLine(segs.flatMap((seg, i) => (i ? [{ str: '\t', x: seg[0].x, w: 0, h: seg[0].h }, ...seg] : seg)))
            .normalize('NFKC')
            .replace(/[ \u00a0]+/g, ' ')
            .trim();
    const m = render(mainSegs);
    const sd = render(sideSegs);
    if (m) main.push(m);
    if (sd) side.push(sd);
  }
  return side.length ? [...main, SIDE_MARKER, ...side].join('\n') : main.join('\n');
}

const SIDE_COLUMN_RATIO = 0.305;
const SIDE_MARKER = '[\u0627\u0644\u0639\u0645\u0648\u062f \u0627\u0644\u062c\u0627\u0646\u0628\u064a]'; // [العمود الجانبي]

const doc = await pdfjs.getDocument({ url: sources.pdfFile, disableFontFace: true, verbosity: 0 }).promise;
const pages = [];
const [from, to] = printRange ?? [1, doc.numPages];
for (let p = from; p <= Math.min(to ?? from, doc.numPages); p++) {
  const text = await extractPage(await doc.getPage(p));
  if (printRange) console.log(`\n=== page ${p} ===\n${text}`);
  pages.push({ page: p, text });
}

if (!printRange) {
  const out = sources.rawFullTextFile;
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(pages, null, 2) + '\n');
  console.log(`✅ ${sources.key}: extracted ${pages.length} pages → ${path.relative(process.cwd(), out)}`);
}
