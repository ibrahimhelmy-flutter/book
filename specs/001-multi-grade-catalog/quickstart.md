# Quickstart

## Run and verify
```bash
pnpm install
npx playwright install chromium   # once
npm run dev                       # http://localhost:3000 (build:data runs first)
npm run lint && npx tsc --noEmit && npm test
npm run build                     # data + audits → export → budgets
npm run e2e                       # serves out/ at http://127.0.0.1:3101/book/
```

## Add a new part (e.g. term 2) or a new book/grade
1. Add the entry to `book-sources/catalog.json` with `"status": "coming-soon"` (shown as «قريبًا», no pages generated). Set `edition.pdfFile`, `edition.rawFullTextFile` and `edition.pageOffset` (PDF page index − printed page number).
2. Put the Ministry PDF in `book-sources/<grade>/<book>/<part>/01-pdf-document/`.
3. `npm run ingest:pages -- --part <part>` → `02-page-scans/page_NN.png`; `npm run ingest:text -- --part <part>` → `03-raw-extractions/*_full_text.json` (logical-order Arabic, see `scripts/extract-pdf-text.mjs`).
4. Write `06-build-modules/book-meta.json` (credits page) and transcribe each chapter **verbatim** into `06-build-modules/chapterN.mjs` (schema: term-1 modules + a printed `page` on sections/concepts/callouts/questions). Figures: `04-extracted-diagrams/figures-chapterN.json` crop boxes → `npm run ingest:figures -- --part <part>`. Acronyms with printed expansions: `06-build-modules/acronyms-chapterN.json`.
5. Check each chapter while transcribing:
   - `node scripts/generate-book-json.mjs --part <part> --chapter N` (structure + page provenance, dry run)
   - `node scripts/audit-source-text.mjs --part <part> --chapter N --verbose` (every text ≥ 90% verbatim in the PDF text layer of its pages)
6. Generate canonical data: `npm run ingest:book -- --part <part>` (book.json, glossary.json, acronyms.json) then `npm run ingest:official -- --part <part>` (official-lessons) and `node scripts/extract-textbook-baseline.mjs --part <part>`; `node scripts/generate-source-manifest.mjs --part <part>` for hashes.
7. Set `"status": "available"`, run `npm run build` (fidelity, verbatim and compliance gates must pass), add e2e coverage, and bump `APP_VERSION`/`CONTENT_VERSION` in `public/sw.js` and `src/lib/offline-db.ts`.

Generators refuse to rewrite the legacy term-1 canonical data (`--force-legacy` to override).
