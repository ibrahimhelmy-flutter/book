# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Arabic (RTL) study site for Egyptian Ministry textbooks, organised as **grade (الصف) → book → part (الترم) → companion books** (e.g. «كتيب التقييمات»). The first book is «البرمجة والذكاء الاصطناعي — الصف الثاني الثانوي», with both parts available: term 1 (4 chapters, 14 lessons, 95 pages + the official assessments booklet) and term 2 (3 chapters, 9 lessons, 77 pages; its assessments booklet is "coming soon" — no authored deep-comprehension questions or storylines yet either, so those lessons show an empty state). Next.js 15 App Router + React 19 + Tailwind 4, built as a fully static export (`output: "export"`) and deployed to GitHub Pages with PWA/offline support. There is no backend and no database. Progress is stored in `localStorage` and offline-pack metadata in IndexedDB.

Project docs (in Arabic): `rules.md` (the original product brief), `HOW_TO_EDIT_DATA.md` (question schema and allowed enum values), `book-sources/RULES.md` (provenance rules). Feature spec/plan/tasks: `specs/001-multi-grade-catalog/`.

## Commands

pnpm is used in CI (`pnpm-lock.yaml`), but the docs and scripts use `npm run`; both work.

```bash
npm run dev            # build:data, then dev server on :3000 (writes to .next-dev/, not .next/)
npm run dev:clean      # wipe .next and .next-dev, then dev (use for stale-cache / ENOENT errors)
npm run build          # build:data + audits → next build → out/ → asset audit + bundle budget
npm run build:data     # book-sources/ → public/data/ (also runs automatically before dev/test/build)
npm run lint           # next lint --dir src
npx tsc --noEmit       # typecheck
npm test               # build:data, unit tests (tests/unit) + PWA/offline export verification
npm run e2e            # Playwright against out/ served at /book (run after `npm run build`)
npm run budget         # bundle budget report (scripts/budgets.json)
npm run validate:schemas
```

Unit tests are plain TypeScript scripts under `tests/unit/` run with `tsx` (no Jest/Vitest). Run one with `node scripts/run-unit-tests.mjs <name-filter>` or `npx tsx tests/unit/content-api.test.ts`. E2E specs live in `e2e/` (`playwright.config.ts` starts `scripts/test-static-server.mjs`; single worker because of OneDrive).

CI (`.github/workflows/deploy.yml`) runs lint, tsc, test, build (with budgets), verify:pwa and e2e on every push to `main`, then deploys `out/`.

`prebuild` runs `build:data` → `audit-canonical-fidelity` → `validate-curriculum-compliance`, which exit 1 on any mismatch, for every **available** part. `postbuild` runs the exported-asset audit and `check-bundle-budget.mjs` (fails the build when a route's first-load JS or a chunk/data file exceeds `scripts/budgets.json`).

## Content architecture (the most important thing)

Content flows in one direction. `public/data/` is generated and gitignored — never edit it.

```
book-sources/
  catalog.json                                   ← grades → books → parts → companions (hand-edited; status "available" | "coming-soon")
  <gradeId>/<bookSlug>/<partId>/                 e.g. secondary-2/programming-ai/term-1/
    01-pdf-document/, 02-page-scans/page_NN.png  ← ground truth (Ministry PDF and page images; gitignored, local/OneDrive only)
    03-raw-extractions/, 04-extracted-diagrams/
    05-canonical-data/                           ← EDIT CONTENT HERE
      official/  book.json, glossary.json, acronyms.json, curriculum-baseline-spec.json,
                 official-lessons/, official-assessments/lesson-X-Y.json (= the "assessments" companion)
      authored/  deep-questions/chapter-N/lesson-X-Y.json, simulators.json, storylines/chapter-N.json,
                 committee-questions.json
    06-build-modules/chapterN.mjs → scripts/generate-official-curriculum.mjs --part <key>
    07-validation/                               SHA-256 hashes + provenance (scripts/generate-source-manifest.mjs)
    companions/<slug>/01-pdf-document/           companion book PDFs
        │
        ▼  scripts/data/build-data.ts (npm run build:data; deterministic, writes only changed files)
public/data/catalog.json
public/data/<grade>/<book>/<part>/
  manifest.json (TOC, stats, companion TOC, contentHash), lessons/<lessonId>.json,
  assessments/<lessonId>.json, deep/<lessonKey>.json, practice/<lessonKey>.json, exams-index.json,
  glossary.json, acronyms.json, simulators.json, search-lessons.json, storylines/<lessonId>.json
```

- `01-pdf-document/` and `02-page-scans/` are not in git (purged from history to keep the repo small). No build, test or CI step reads them; only `ingest:text`, `ingest:pages`, `ingest:figures` and `sources:validate` do, so a fresh clone needs them copied in by hand before running those.
- Script paths are centralized in `scripts/sources-config.mjs`: `getSources(partKey | partId)`, `listParts()`, `partsFromArgs()` (the `--part <key>` flag; default = all available parts), `loadBuildModules()`. The alias `'term-1'` resolves to the legacy term-1 part. One-off historical scripts live in `scripts/archive/term-1/`.
- Adding a part/book/grade is a content change: add it to `catalog.json`, create its source folder with the same layout, produce canonical data, then flip `status` to `"available"` once the audits pass.
- Figures are produced by `npm run ingest:figures -- --part <key>` (`scripts/crop-figures.mjs`) from each part's `04-extracted-diagrams/figures*.json`: `"image": "WxH"` takes an embedded PDF image at native resolution (`--list <pdfPage>` shows them); `"box"` renders a vector drawing from the PDF at 4× and trims it. Never crop from `02-page-scans/` (too low-res).
- Diagrams are copied by `scripts/prepare-assets.mjs` from each part's `04-extracted-diagrams/` to `public/<assetsBase>` (term-1: `/images/extracted`, gitignored); files no longer in the source are removed. `public/images/pages/` is gitignored too.
- Question field rules are in `HOW_TO_EDIT_DATA.md`: exactly 4 options, `correctAnswer` 0–3 with `correctAnswerText` matching that option, `cognitiveLevel` and `difficulty` from fixed enums, `source.pages` within the part's page range, and `conceptIds` that exist in the lesson.

### Content fidelity rules (from `rules.md` / `book-sources/RULES.md`)

- The textbook is the only source. Don't invent facts, dates, names, definitions or placeholder questions. Don't paraphrase or alter official text or terminology. Don't drop concepts, think-boxes or questions.
- Any explanatory content that is not from the book must be visibly marked in the UI (e.g. `💡 توضيح إضافي`). Data records carry `contentOrigin` / `contentProvenance`.
- Every lesson, concept and question carries `source.pages`. When in doubt, check the page image in `02-page-scans/`.
- Components read from data. Don't hard-code curriculum text in JSX (`audit:hardcoding` checks this, plus forbidden imports).
- `scripts/audit-source-text.mjs` (part of `prebuild`) checks every official text in `book.json` word-for-word against that part's PDF text layer (`03-raw-extractions/`) and fails the build on any change. A PDF text layer defect (reversed Latin run, a side-column line glued onto a main-column one, text baked into a figure) is the only reason to list an item in that part's `03-raw-extractions/04-verified-exceptions.json` — always with the printed page checked and the reason; never to excuse an actual change.
- `scripts/extract-pdf-text.mjs` separates each page's main column from its side column (lesson map, key terms, think-boxes) and fixes RTL glyph reordering; use `--print <range>` to inspect a page before transcribing it.

## App structure

- **Content API** (`src/content/`): `reader.ts` (fs reader over `public/data`, memoised; works under tsx), `route.ts` (`requirePart`, `requireCompanion` → 404 for unknown/coming-soon), `paths.ts` (client-safe href/`dataUrl` helpers), `index.ts` (`import "server-only"` barrel). Only `app/**` pages/layouts/sitemap import `@/content`; ESLint forbids it (and `@/data`) in `src/components`, `src/lib`, `src/context`.
- **Routes**: `/` (catalog), `/g/[gradeId]/`, `/g/[gradeId]/[bookSlug]/`, and per part `/g/[gradeId]/[bookSlug]/[partId]/` with `chapters/[chapterId]/[lessonSlug]/(storyline/)`, `exams/`, `glossary/`, `simulators/`, and companion books at `[companionSlug]/[chapterId]/[lessonSlug]/`. `/dashboard/` aggregates all parts. Old URLs (`/chapters/...`, `/exams/`, `/practice/`, `/glossary/`, `/simulators/`) are static `LegacyRedirect` pages to term-1. Every dynamic page exports `generateStaticParams` from `staticParams.*` (layouts don't).
- **Data loading rule**: server pages pass only what a page renders as props; question banks (`assessments/`, `deep/`, `practice/`) and the search index are fetched on demand with `useJson`/`fetchJson` (`src/lib/fetch-json.ts`). Never import a whole dataset into a client component — that is what made lesson pages ship 4 MB of JS before the refactor.
- **Part context**: the part layout wraps pages in `PartProvider` (`usePart()` → `PartManifest`; registers acronyms for `EyeComfortText`). The root `ActivePartProvider` lets the navbar (search, lesson index, offline pack) act on the current or last-visited part.
- **Big views are component trees**: `components/lesson/LessonContent.tsx` + `components/quiz/LessonQuestionBanks.tsx` (lazy banks), `components/exams/*` (`ExamsView`, hooks in `use-question-banks.ts`, pure logic in `exams-logic.ts`), `components/glossary/*`, `components/companion/*`, `components/simulators/SimulatorRenderer.tsx` (one lazy chunk per simulator).
- `src/lib/practice.ts`: pure practice-question conversion/filtering (shared by build-data and the exams page). `src/lib/arabic.ts`: Arabic normalization for search (covered by `arabic.test.ts`).
- **Storage** (`src/lib/storage.ts`): progress v2 is keyed per part (`egyptian_curriculum_progress_v2`); `ensureMigrated()` migrates v1 data and essay/glossary keys into term-1 once. UI preferences stay global.

## Deployment / PWA gotchas

- `basePath` is `/book` on GitHub Pages (any production build that isn't on Vercel or Netlify) and empty otherwise, unless overridden with `NEXT_PUBLIC_BASE_PATH`. Fetch/asset URLs must go through `getAssetPath`/`dataUrl`; `<Link href>` adds the base path itself.
- `trailingSlash: true` and `images.unoptimized: true` are required by the static export.
- `public/sw.js` has `APP_VERSION` / `CONTENT_VERSION`, and `src/lib/offline-db.ts` has `APP_VERSION` / `CURRENT_CONTENT_VERSION`. They must match (verify:pwa checks). Bump them together when the SW or pack format changes; bumping `APP_VERSION` deletes old caches on activate.
- Offline packs are per part: `scripts/build.mjs` walks `out/` and writes `out/offline/<grade>__<book>__<part>.json` (every page `index.html` + `index.txt` RSC payload, the part's data JSON, images and all `_next/static` assets, including lazy chunks). The SW caches them in `ai-curriculum-pack-v<APP_VERSION>::<partKey>`; IndexedDB stores `{partKey, contentHash}` so a changed part shows "تحديث متاح". `/data/**/*.json` is stale-while-revalidate.
- The repo lives in OneDrive on Windows, so builds are forced single-threaded (`scripts/build.mjs`, `experimental.cpus/workerThreads` in `next.config.ts`), dev uses polling file watching, data writes retry and skip unchanged files, and Playwright uses one worker. Keep these workarounds in place.

## Conventions

- Path alias `@/*` → `src/*`. TypeScript strict. ESLint allows `any` and warns on unused variables.
- UI text is Arabic and `dir="rtl"`. Mobile-first (the e2e project runs a Pixel 7 viewport).
- Files are LF.
