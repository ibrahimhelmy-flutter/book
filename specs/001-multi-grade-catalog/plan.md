# Implementation Plan: Multi-grade catalog, companion books, and a fast static app

**Branch**: `001-multi-grade-catalog` | **Spec**: [spec.md](./spec.md)

## Summary
Model the catalog as grade → book → part → companion in a hand-edited `book-sources/catalog.json`. The data build emits small per-part and per-lesson JSON under `public/data/`. A server-only content API (`src/content`) feeds static pages under `/g/[grade]/[book]/[part]/…`. Client components get only the props they render, and they fetch question banks on demand. This removes the 4.2 MB data chunk from lesson pages and the 415 KB curriculum chunk from every page.

## Technical Context
- **Stack**: Next.js 15 App Router, React 19, Tailwind 4, TypeScript strict, `output: "export"` on GitHub Pages (`basePath=/book`), PWA with a hand-written `public/sw.js`.
- **Storage**: localStorage for progress, IndexedDB for offline pack metadata, Cache Storage for offline files.
- **Testing**: tsx unit scripts (`tests/unit`, run via `scripts/run-unit-tests.mjs`), Playwright e2e against `out/` served at `/book` (`scripts/test-static-server.mjs`), and a bundle budget (`scripts/check-bundle-budget.mjs`, `scripts/budgets.json`).
- **Constraints**: The repo lives in OneDrive on Windows, so builds are single-threaded, dev uses polling, and writes are retried and skipped when unchanged.

## Constitution Check (from `rules.md` / `src/data/RULES.md`)
| Rule | How this plan complies |
|---|---|
| The textbook is the only source; no invented content | Removes the 50-question placeholder padding. Term-2 is transcribed verbatim, page by page. |
| Official text is never paraphrased | The canonical JSON is moved, not edited. Phase 1 gate: hashes are unchanged. |
| Authored content is visibly marked | `contentOrigin`/`contentProvenance` are kept and rendered. |
| Every record cites `source.pages` | Validated per part by `validate-content-schemas`. |
| No hard-coded curriculum text in JSX | Chapter icons come from data. `audit:hardcoding` still runs. |

## Project Structure
```
book-sources/catalog.json
book-sources/<grade>/<book>/<part>/{01..07}, companions/<slug>/
public/data/                     generated, gitignored (scripts/build-data.ts)
src/content/{paths,reader,index}.ts
src/app/g/[gradeId]/[bookSlug]/[partId]/…
src/components/{layout,lesson,quiz,companion,exams,glossary}/
tests/unit/*.test.ts   e2e/*.spec.ts
```

## Data-loading decision
| Data | Delivery |
|---|---|
| Catalog, part manifest | Server props (small, needed everywhere) |
| Lesson body | Server-rendered from props |
| Question banks (official, deep, practice), search index | Static JSON fetched on demand. Cached by the service worker with stale-while-revalidate, and listed per part for offline packs |
| Glossary, simulators, acronyms | Server props; a lesson gets only its subset |

## Phases
0. Specs, tooling (tsx, Playwright, budget), dead-code removal.
1. Catalog and source layout move. The pipeline iterates parts; output is byte-identical.
2. Split data build and content API.
3. New routes, component split, legacy redirects.
4. Progress and offline per part.
5. Enforce budgets (ESLint import boundary, CI e2e).
6. Term-2 ingestion (content; gated by audits).

## Baseline measurements (2026-10-12, before refactor)
| Route | First-load JS (gzip) |
|---|---|
| `/chapters/[c]/[l]` | 775.1 KB |
| `/exams`, `/practice` | 772.6 KB |
| `/simulators` | 260.1 KB |
| `/glossary` | 236.7 KB |
| `/` | 226.4 KB |

Largest chunks: `6436` 4196 KB raw (assessments + deep questions), `4618` 415 KB raw (curriculum + glossary, loaded on every route).
