/**
 * Extracts the official English edition of a part (the language-schools book) into
 * 05-canonical-data/official/english/<lessonId>.json, so the lesson page can show the
 * Ministry's own English text next to the Arabic one ("عربي + English" mode).
 *
 * Each lesson is located by its running head ("5-1 — Methods of Data Collection"), and only
 * the main column is read (the side column holds key terms, think-boxes and captions). Within
 * the lesson, the numbered headings of the "Point!" part ("1. The Data Collection Stage" …)
 * become sections; the Arabic edition uses the same numbering, which is how the two are paired.
 * Text is copied from the PDF text layer as is — nothing is translated or rewritten.
 *
 *   node scripts/extract-english-text.mjs --part term-2
 *   node scripts/extract-english-text.mjs --part term-2 --print 5-7    # dump PDF pages 5..7 (main column)
 */
import fs from 'fs';
import path from 'path';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import { getSources, partArg } from './sources-config.mjs';

const sources = getSources(partArg());
if (!sources.englishPdfFile || !fs.existsSync(sources.englishPdfFile)) {
  console.error(`❌ ${sources.key}: missing englishPdfFile (${sources.englishPdfFile ?? 'edition.englishPdfFile not set in catalog.json'}).`);
  process.exit(1);
}

const printIdx = process.argv.indexOf('--print');
const printRange = printIdx >= 0 ? process.argv[printIdx + 1].split('-').map(Number) : null;

/** Share of the page width where the side column starts. */
const SIDE_COLUMN_X = 0.69;
const RUNNING_HEAD = /^(\d+-\d+) — (.+)$/;

/** Text-item height tells body text (11pt) from table cells (8.6pt) and figure captions (7.5pt). */
const kindOf = (h) => (h >= 9.5 ? 'body' : h >= 8 ? 'table' : 'caption');

function joinItems(items) {
  let text = '';
  let prevEnd = null;
  for (const it of items) {
    if (prevEnd !== null && it.x - prevEnd > 1.5 && !text.endsWith(' ') && !it.str.startsWith(' ')) text += ' ';
    text += it.str;
    prevEnd = it.end;
  }
  return text.replace(/\s+/g, ' ').trim();
}

/** One page as lines of the main column (top → bottom), plus its running head. */
async function readPage(doc, n) {
  const page = await doc.getPage(n);
  const { width, height } = page.getViewport({ scale: 1 });
  const { items } = await page.getTextContent();
  const all = [];
  for (const it of items) {
    if (!it.str.trim()) continue;
    const x = it.transform[4];
    const y = it.transform[5];
    if (x >= width * SIDE_COLUMN_X) continue;
    if (y > height * 0.955 || y < height * 0.045) continue; // running head / footer
    all.push({ x, y, str: it.str, end: x + it.width, kind: kindOf(it.height) });
  }
  const rows = [];
  // Body rows first, so sub/superscripts (smaller, slightly off the baseline) join their line.
  for (const it of [...all].sort((a, b) => (a.kind === 'body' ? 0 : 1) - (b.kind === 'body' ? 0 : 1))) {
    let row = rows.find((r) => Math.abs(r.y - it.y) < 2.5 && r.kind === it.kind)
      ?? (it.kind !== 'body' ? rows.find((r) => r.kind === 'body' && Math.abs(r.y - it.y) < 6 && it.x >= r.minX - 1) : undefined);
    if (!row) rows.push((row = { y: it.y, kind: it.kind, items: [], minX: it.x }));
    row.items.push(it);
    row.minX = Math.min(row.minX, it.x);
  }
  rows.sort((a, b) => b.y - a.y);
  const lines = rows.map((r) => {
    r.items.sort((a, b) => a.x - b.x);
    // Table cells: split where the gap between items is a column gap rather than a word space.
    const cells = [];
    for (const it of r.items) {
      const last = cells[cells.length - 1];
      if (last && it.x - last.items[last.items.length - 1].end < 8) last.items.push(it);
      else cells.push({ x: it.x, items: [it] });
    }
    return {
      kind: r.kind,
      text: joinItems(r.items),
      cells: cells.map((c) => ({ x: c.x, text: joinItems(c.items) })),
      items: r.items,
      x: r.items[0].x,
      end: r.items[r.items.length - 1].end,
      y: r.y,
    };
  });
  const head = items.map((it) => it.str.trim()).find((s) => RUNNING_HEAD.test(s)) || null;
  return { n, width, lines, head: head ? head.match(RUNNING_HEAD) : null };
}

/**
 * Column starts of a table: x positions where text items begin on at least two lines (a cell's
 * left edge recurs row after row; a style change in the middle of a cell does not).
 */
function tableColumns(lines) {
  const clusters = [];
  for (const line of lines) {
    for (const x of new Set(line.items.map((it) => Math.round(it.x)))) {
      const c = clusters.find((k) => Math.abs(k.x - x) < 6);
      if (c) c.lines.add(line);
      else clusters.push({ x, lines: new Set([line]) });
    }
  }
  const min = lines.length > 2 ? 2 : 1;
  return clusters.filter((c) => c.lines.size >= min).map((c) => c.x).sort((a, b) => a - b);
}

/**
 * Rows of a table: a new row where the vertical gap is wider than a wrapped cell line. Recurring
 * starts without a header cell (a "①" or "•" before cell text) are folded into the nearest real column.
 */
function tableRows(lines) {
  const candidates = tableColumns(lines);
  const header = splitRows(lines, candidates)[0];
  return splitRows(lines, candidates.filter((_, i) => header[i]));
}

function splitRows(lines, columns) {
  const rows = [];
  let last = null;
  for (const line of lines) {
    if (!last || last.y - line.y > 18) rows.push(columns.map(() => ''));
    const row = rows[rows.length - 1];
    const byCol = columns.map(() => []);
    for (const it of line.items) {
      let col = 0;
      // Rightmost column starting at or before the item (cell text may sit a few points left of its header).
      columns.forEach((cx, i) => { if (it.x >= cx - 8) col = i; });
      byCol[col].push(it);
    }
    byCol.forEach((items, col) => {
      if (!items.length) return;
      const text = joinItems(items);
      row[col] = row[col] ? `${row[col]} ${text}` : text;
    });
    last = line;
  }
  return rows;
}

/**
 * Turns a section's lines into blocks: paragraphs (wrapped lines joined; a short line or a
 * numbered/circled line ends one), tables and figure captions.
 */
function toBlocks(lines, rightEdge) {
  const blocks = [];
  let open = null;
  for (const line of lines) {
    const prev = blocks[blocks.length - 1];
    if (line.kind === 'table') {
      const lastLine = prev?.type === 'table' ? prev.lines[prev.lines.length - 1] : null;
      if (lastLine && lastLine.page === line.page) prev.lines.push(line);
      else blocks.push({ type: 'table', lines: [line] });
      open = null;
      continue;
    }
    if (line.kind === 'caption') {
      blocks.push({ type: 'caption', text: line.text });
      open = null;
      continue;
    }
    const startsBlock = /^(\(\d+\)|[①-⑳]|\d+\.\s)/.test(line.text);
    if (open && !startsBlock) open.text += (open.text.endsWith('-') ? '' : ' ') + line.text;
    else blocks.push((open = { type: 'p', text: line.text }));
    if (line.end < rightEdge * 0.88) open = null;
  }
  return blocks.map((b) => (b.type === 'table' ? { type: 'table', rows: tableRows(b.lines) } : b));
}

const doc = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(sources.englishPdfFile)), verbosity: 0 }).promise;

if (printRange) {
  for (let n = printRange[0]; n <= Math.min(printRange[1] ?? printRange[0], doc.numPages); n++) {
    const p = await readPage(doc, n);
    console.log(`\n=== PDF page ${n} · head: ${p.head?.[0] ?? '-'}`);
    for (const l of p.lines) console.log(`${l.kind.padEnd(7)} ${l.x.toFixed(0).padStart(4)}-${l.end.toFixed(0).padEnd(4)} ${l.text}`);
  }
  process.exit(0);
}

// Group pages by lesson number from the running head.
const lessons = new Map();
for (let n = 1; n <= doc.numPages; n++) {
  const p = await readPage(doc, n);
  if (!p.head) continue;
  const [, number, title] = p.head;
  if (!lessons.has(number)) lessons.set(number, { number, title, pages: [] });
  lessons.get(number).pages.push(p);
}

const outDir = path.join(sources.canonicalOfficial, 'english');
fs.mkdirSync(outDir, { recursive: true });

for (const lesson of lessons.values()) {
  // Right margin of the main column: a high percentile of body line ends (a few lines run wider).
  const ends = lesson.pages.flatMap((p) => p.lines.filter((l) => l.kind === 'body').map((l) => l.end)).sort((a, b) => a - b);
  const rightEdge = ends[Math.floor(ends.length * 0.8)];
  const all = lesson.pages.flatMap((p) => p.lines.map((l) => ({ ...l, page: p.n })));

  const start = all.findIndex((l) => /^📌?\s*Point!$/.test(l.text));
  const end = all.findIndex((l, i) => i > start && /Worked Example$/.test(l.text));
  if (start < 0 || end < 0) {
    console.warn(`⚠️  ${lesson.number}: "Point!" / "Worked Example" markers not found — skipped.`);
    continue;
  }

  const sections = [];
  let expected = 1;
  for (const line of all.slice(start + 1, end)) {
    const m = line.kind === 'body' && line.text.match(/^(\d+)\. (\D.*)$/);
    if (m && Number(m[1]) === expected) {
      sections.push({ number: expected, title: line.text, lines: [], pages: new Set([line.page]) });
      expected++;
      continue;
    }
    const sec = sections[sections.length - 1];
    if (!sec) continue;
    sec.lines.push(line);
    sec.pages.add(line.page);
  }

  const objectives = [];
  const firstPage = lesson.pages[0].lines;
  const objStart = firstPage.findIndex((l) => l.text === 'Learning Objectives');
  if (objStart >= 0) {
    for (const l of firstPage.slice(objStart + 1)) {
      if (/^[•·]\s*/.test(l.text) || !objectives.length) objectives.push(l.text.replace(/^[•·]\s*/, ''));
      else objectives[objectives.length - 1] += ' ' + l.text;
    }
  }
  const guiding = all.find((l) => /Guiding question:/.test(l.text));
  let guidingQuestion = null;
  if (guiding) {
    // The question wraps over a few lines; read up to the line that ends with "?".
    const i = all.indexOf(guiding);
    const parts = [];
    for (const l of all.slice(i, i + 4)) {
      parts.push(l.text);
      if (/\?$/.test(l.text)) break;
    }
    guidingQuestion = parts.join(' ').replace(/^\?\s*Guiding question:\s*/, '').trim();
  }

  const lessonId = `lesson-${lesson.number}`;
  const record = {
    lessonId,
    number: lesson.number,
    title: lesson.title,
    learningObjectives: objectives.filter(Boolean),
    guidingQuestion,
    sections: sections.map((s) => ({
      number: s.number,
      title: s.title,
      blocks: toBlocks(s.lines, rightEdge),
      pdfPages: [...s.pages],
    })),
    contentOrigin: 'official',
    source: {
      edition: 'english',
      pdfFile: path.basename(sources.englishPdfFile),
      pdfPages: lesson.pages.map((p) => p.n),
    },
  };
  const file = path.join(outDir, `${lessonId}.json`);
  fs.writeFileSync(file, JSON.stringify(record, null, 2) + '\n');
  console.log(`✓ ${lessonId}: ${record.sections.length} sections, ${record.learningObjectives.length} objectives → ${path.relative(process.cwd(), file)}`);
}
