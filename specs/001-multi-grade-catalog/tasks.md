# Tasks: Multi-grade catalog, companion books, and a fast static app

**Input**: [spec.md](./spec.md), [plan.md](./plan.md), [data-model.md](./data-model.md)
Format: `T### [P] [Story] description — path`. `[P]` = can run in parallel. ✅ = done.

## Phase 0: Setup & safety net
- ✅ T001 [P] Spec, plan and tasks docs — `specs/001-multi-grade-catalog/`
- ✅ T002 [P] Add `tsx`, `@playwright/test`, `server-only`; unit-test runner — `scripts/run-unit-tests.mjs`
- ✅ T003 [P] Base-path-aware static server — `scripts/test-static-server.mjs`
- ✅ T004 [P] Playwright config + specs — `playwright.config.ts`, `e2e/`
- ✅ T005 [P] Bundle budget reporter + baseline — `scripts/check-bundle-budget.mjs`, `scripts/budgets.json`
- ✅ T006 Delete dead code (`src/core`, exam-engine, unused exam-generator/presentation, catalog.html, simple-questions.json)
- ✅ T007 Archive term-1 one-off scripts — `scripts/archive/term-1/`

## Phase 1: Catalog & source layout (US4)
- ✅ T010 [US4] Move sources to `book-sources/secondary-2/programming-ai/term-1/`; companion PDF to `companions/assessments/`
- ✅ T011 [US4] Hand-edited catalog — `book-sources/catalog.json`
- ✅ T012 [US4] Catalog-driven `getSources`/`listParts`/`partsFromArgs`/`loadBuildModules` — `scripts/sources-config.mjs`
- ✅ T013 [US4] Audits/generators iterate parts + `--part` flag (fidelity, compliance, manifest, baseline, render, schemas…)
- ✅ T014 Gate: generated data and canonical hashes byte-identical after the move

## Phase 2: Split data & content API (US2)
- ✅ T020 [US2] Per-part/per-lesson JSON build — `scripts/data/build-data.ts`
- ✅ T021 [US2] Remove 50-question placeholder padding (fidelity)
- ✅ T022 [US2] Storylines moved to canonical JSON — `authored/storylines/`
- ✅ T023 [US2] Types — `src/types/{catalog,assessments,deep-questions}.ts`
- ✅ T024 [US2] Content API — `src/content/{reader,paths,route,index}.ts`
- ✅ T025 [US2] Unit tests — `tests/unit/content-api.test.ts` (parity with legacy data verified: 868 practice / 558 official)

## Phase 3: Routes & components (US1, US2, US3)
- ✅ T030 [US1] Catalog pages `/`, `/g/[grade]/`, `/g/[grade]/[book]/` — `src/app/`, `src/components/catalog/`
- ✅ T031 [US1] Part layout + `PartProvider`/`ActivePartProvider`, navbar part switcher & breadcrumbs
- ✅ T032 [US2] Lesson page: server props + lazy question banks — `components/quiz/LessonQuestionBanks.tsx`
- ✅ T033 [P] [US2] Exams page component tree with on-demand banks — `components/exams/`
- ✅ T034 [P] [US2] Glossary component tree — `components/glossary/`
- ✅ T035 [P] [US2] Lazy simulator chunks — `components/simulators/SimulatorRenderer.tsx`
- ✅ T036 [US3] Companion book routes (TOC, chapter, lesson) + in-lesson link
- ✅ T037 [US1] Legacy redirects for pre-catalog URLs
- ✅ T038 Dashboard across parts; sitemap from catalog; delete `src/data`

## Phase 4: Storage & offline per part (US5)
- ✅ T040 [US5] Progress v2 per part + idempotent v1 migration — `src/lib/storage.ts`, `tests/unit/storage-migration.test.ts`
- ✅ T041 [US5] IndexedDB v2 (`packs` by partKey/contentHash) — `src/lib/offline-db.ts`
- ✅ T042 [US5] Per-part offline URL lists from `out/` — `scripts/build.mjs`
- ✅ T043 [US5] SW per-part caches, delete message, `/data` stale-while-revalidate — `public/sw.js` (APP_VERSION 2.0.0)
- ✅ T044 [US5] Offline pack modal per part — `components/pwa/OfflinePackModal.tsx`
- ✅ T045 [US5] e2e offline flow — `e2e/offline.spec.ts`

## Phase 5: Enforce performance
- ✅ T050 Budgets enforced in `postbuild` (first-load ≤ 180 KB gzip, home ≤ 150 KB, chunk ≤ 300 KB, data file ≤ 400 KB)
- ✅ T051 ESLint import boundary (`@/content`, `@/data` forbidden in components/lib/context) + hardcoding audit rules
- ✅ T052 e2e perf assertions (no JS > 300 KB, no banks on catalog/lesson load)
- ✅ T053 CI: Playwright step — `.github/workflows/deploy.yml`
- ✅ T054 Docs — `CLAUDE.md`, `HOW_TO_EDIT_DATA.md`, `book-sources/RULES.md`, `rules.md`

## Phase 6: Term-2 ingestion (US4) — ✅ done (assessments booklet still pending)
- ✅ T060 [US4] Term-2 PDF placed in `term-2/01-pdf-document/`; `edition.pdfFile`/`pageOffset` set in catalog (no Assessments-2 PDF supplied — companion stays `coming-soon`)
- ✅ T061 [US4] `render-pdf-pages --part term-2` (77 pages); new `extract-pdf-text.mjs` (column-split, RTL-reordering-aware; replaces the pdftotext/pdfjs ad hoc approach) → `03-raw-extractions/`; `extract-textbook-baseline --part term-2`; `generate-source-manifest --part term-2`
- ✅ T062 [US4] Verbatim `06-build-modules/chapter{5,6,7}.mjs` (9 lessons, one subagent per chapter in parallel) + `generate-book-json.mjs` (new: builds `book.json`/`glossary.json`/`acronyms.json` from the build modules with page provenance; `--chapter N` dry-run per chapter) + `generate-official-curriculum --part term-2`
- ✅ T062a New gate `scripts/audit-source-text.mjs`: every official text checked word-for-word against the PDF's own text layer; added to `prebuild`. Fixed 3 real bugs this surfaced in `audit-canonical-fidelity.mjs` / `generate-official-curriculum.mjs` (section/callout/concept matching picked the wrong one whenever a lesson repeats a heading or term — affects any part, not just term-2). 15 PDF-text-layer defects documented in `term-2/03-raw-extractions/04-verified-exceptions.json`, each checked against the page image
- ✅ T063 [US4] Glossary (81 terms) and acronyms (5: API, RMSE, MAE, LLM, RLHF) from the book only; figures cropped from page scans into `04-extracted-diagrams/` (`crop-figures.mjs`, new)
- ⏭️ T064 [US4] Companion extraction — blocked: no Assessments-2 PDF
- ✅ T065 [US4] All audits green (fidelity 100%, compliance 9/9, schemas, boundary, verbatim) → `status: "available"`; e2e `term2.spec.ts` (empty-state banks, no companion link); SW versions already bumped in Phase 4 (`APP_VERSION` 2.0.0) and data build is part-scoped, so no further bump was needed
