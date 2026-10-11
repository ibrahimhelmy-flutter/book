# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

An Arabic (RTL) study site for the Egyptian Ministry textbook "البرمجة والذكاء الاصطناعي — الصف الثاني الثانوي — الترم الأول" (4 chapters, 15 lessons, 95 pages). Next.js 15 App Router + React 19 + Tailwind 4, built as a fully static export (`output: "export"`) and deployed to GitHub Pages with PWA/offline support. There is no backend and no database. Progress is stored in `localStorage` and offline packs in IndexedDB.

Project docs (in Arabic): `rules.md` (the original product brief), `HOW_TO_EDIT_DATA.md` (question schema and allowed enum values), `src/data/RULES.md` (provenance rules).

## Commands

pnpm is used in CI (`pnpm-lock.yaml`), but the docs and scripts use `npm run`; both work.

```bash
npm run dev            # dev server on :3000 (writes to .next-dev/, not .next/)
npm run dev:clean      # wipe .next and .next-dev, then dev (use for stale-cache / ENOENT errors)
npm run build          # prebuild audits → next build → out/ → postbuild asset sync
npm run lint           # next lint --dir src
npx tsc --noEmit       # typecheck
npm test               # all test scripts + PWA verification (what CI runs)
npm run build:data     # regenerate src/data/ from book-sources/ (run after any canonical JSON edit)
npm run validate:schemas
```

Tests are plain TypeScript scripts with a hand-written `assert` that run under `tsx`. There is no Jest or Vitest. To run one test, run its file:

```bash
npx tsx src/core/tests/engine.test.ts
```

CI (`.github/workflows/deploy.yml`) runs `lint`, `tsc --noEmit`, `test`, `build` and `verify:pwa` on every push to `main`, then deploys `out/`.

`prebuild` runs `prepare-assets` → `audit-canonical-fidelity` → `validate-curriculum-compliance`. These exit 1 on any mismatch, so a content change that breaks fidelity will fail `npm run build`. The other `audit:*` scripts in `package.json` are standalone checks.

## Content architecture (the most important thing)

Content flows in one direction. **Never hand-edit `src/data/` files that carry the `⚠️ AUTO-GENERATED FILE` banner**, because `build:data` overwrites them.

```
book-sources/term-1/
  01-pdf-document/, 02-page-scans/page_NN.png   ← ground truth (the Ministry PDF and its 95 page images)
  03-raw-extractions/, 04-extracted-diagrams/
  05-canonical-data/                             ← EDIT CONTENT HERE
    official/  book.json, glossary.json, acronyms.json,
               official-lessons/, official-assessments/lesson-X-Y.json
    authored/  deep-questions/chapter-N/lesson-X-Y.json, committee-questions.json, simulators.json
  06-build-modules/chapterN.mjs  → scripts/generate-official-curriculum.mjs → official-lessons/*.json
  07-validation/                  SHA-256 hashes + provenance reports (scripts/generate-source-manifest.mjs)
        │
        ▼  scripts/build-all-data.mjs  (npm run build:data)
src/data/  curriculum.ts, glossary.ts, acronyms.ts, simulators.ts, books.ts,
           committee-questions.ts, official-assessments.ts, deep-questions/**   (generated)
```

- Script paths are centralized in `scripts/sources-config.mjs` (`getSources('term-1')`). The layout is meant to scale to `term-2`.
- Hand-written files in `src/data/` (no banner): `curriculum-toc.ts`, `deep-questions/types.ts`, `storylines/*`, `index.ts`.
- `public/images/extracted/` is filled by `prepare-assets.mjs` from `04-extracted-diagrams/` and page-scan crops. `public/images/pages/` is gitignored, so don't duplicate page scans.
- Question field rules are in `HOW_TO_EDIT_DATA.md`: exactly 4 options, `correctAnswer` 0–3 with `correctAnswerText` matching that option, `cognitiveLevel` and `difficulty` from fixed enums, `source.pages` within 1–95, and `conceptIds` that exist in the lesson.

### Content fidelity rules (from `rules.md` / `src/data/RULES.md`)

- The textbook is the only source. Don't invent facts, dates, names or definitions. Don't paraphrase or alter official text or terminology. Don't drop concepts, think-boxes or questions.
- Any explanatory content that is not from the book must be visibly marked in the UI (e.g. `💡 توضيح إضافي`, `🔗 مثال من الواقع`). Data records carry `contentOrigin` / `contentProvenance` to distinguish official from authored content.
- Every lesson, concept and question carries `source.pages` pointing back to book pages. When in doubt, check the page image in `book-sources/term-1/02-page-scans/`.
- Components read from data. Don't hard-code curriculum text in JSX (`audit:hardcoding` checks this).

## App structure

- Routes live in `src/app/(main)/`: `chapters/[chapterId]`, `chapters/[chapterId]/[lessonSlug]`, `.../storyline`, plus `exams`, `practice`, `glossary`, `simulators` and `dashboard`. Dynamic routes must export `generateStaticParams` (required by static export). Lessons are looked up from `CURRICULUM_DATA` by `chapter.id` and `lesson.slug`.
- `src/core/registry/ContentRegistry.ts`: `getBookContent(term)` bundles all generated data into a `BookContentPackage`. It is the multi-term entry point.
- `src/core/`: a clean-architecture exam engine (domain entities/interfaces → application use-cases → in-memory infrastructure repositories). It is wired together in `src/core/infrastructure/bootstrap.ts` via the `getExamEngineContainer()` singleton. The "AI" question generator is rule-based and makes no network calls. `src/core/config/` holds the difficulty, cognitive-level, question-type and exam enums.
- `src/lib/exam-generator/`: the exam-building pipeline and profiles used by `components/exam-generator`.
- `src/lib/arabic.ts` and `src/core/domain/text-normalization.ts`: Arabic text normalization used for search, matching and duplicate detection. These are covered by `arabic.test.ts`.
- `src/components/simulators/`: interactive per-lesson labs. Metadata comes from `authored/simulators.json`, and `SimulatorRenderer.tsx` dispatches by id.

## Deployment / PWA gotchas

- `basePath` is `/book` on GitHub Pages (any production build that isn't on Vercel or Netlify) and empty otherwise, unless overridden with `NEXT_PUBLIC_BASE_PATH`. Asset, manifest and icon URLs must respect the base path; don't use root-absolute `/images/...` without it.
- `trailingSlash: true` and `images.unoptimized: true` are required by the static export.
- `public/sw.js` has `APP_VERSION` / `CONTENT_VERSION`, and `src/lib/offline-db.ts` has `CURRENT_CONTENT_VERSION`. Cache names derive from `APP_VERSION`, so bumping it deletes users' downloaded offline packs on activate, while the UI's "downloaded" state is keyed on `CURRENT_CONTENT_VERSION`. Bump both together, or neither. `scripts/verify-pwa-and-offline.mjs` asserts the service-worker structure.
- Offline navigation: with static export, client-side `<Link>` navigation fetches `<route>/index.txt` (the RSC payload), not HTML. The offline pack (`OfflinePackModal.tsx`) must cache those `.txt` files plus every file listed in `out/offline-assets.json`, which `scripts/build.mjs` writes after the build. Lazily loaded `next/dynamic` chunks never appear in page HTML, and if they're missing, pages crash offline with `ChunkLoadError`.
- The repo lives in OneDrive on Windows, so builds are forced single-threaded (`scripts/build.mjs`, `experimental.cpus/workerThreads` in `next.config.ts`), dev uses polling file watching, and `build-all-data.mjs` retries writes. Keep these workarounds in place.

## Conventions

- Path alias `@/*` → `src/*`. TypeScript strict. ESLint allows `any` and warns on unused variables.
- UI text is Arabic and `dir="rtl"`. Mobile-first.
