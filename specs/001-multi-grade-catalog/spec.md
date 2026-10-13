# Feature Specification: Multi-grade catalog, companion books, and a fast static app

**Feature Branch**: `001-multi-grade-catalog`
**Created**: 2026-10-12
**Status**: In progress
**Input**: "الصفحة الرئيسية ممكن يكون فيها أكثر من صف، وكل صف فيه كتب مختلفة، وكل كتاب ممكن يكون ليه أكثر من جزء، وممكن يكون ليه كتب تخصه زي كتاب التقييمات، بنفس طريقة عرض الشرح والأسئلة. وريفاكتور للتطبيق كله ليكون نظيف وسريع جدًا."

## User Scenarios & Testing *(mandatory)*

### User Story 1: Browse grades → books → parts (Priority: P1)
A student opens the site and picks their grade (الصف), then a book, then a part (الترم). They land on that part's chapter grid.

**Why this priority**: Every other story depends on content being addressable per grade, book and part.

**Independent Test**: Open `/`, click «الصف الثاني الثانوي», then «البرمجة والذكاء الاصطناعي», then «الترم الأول». The chapter grid shows 4 chapters and 14 lessons.

**Acceptance Scenarios**:
1. **Given** the catalog has one grade with one book and two parts, **When** the student opens `/`, **Then** they see a grade card with its book count.
2. **Given** a part has status `coming-soon`, **When** the student opens the book page, **Then** the part shows the «قريبًا» badge and is not a link.
3. **Given** the student is inside a part, **When** they look at the navbar, **Then** they see the breadcrumb grade › book › part and can switch part.

---

### User Story 2: Fast lesson pages (Priority: P1)
A lesson page loads quickly on a mid-range phone over 3G. Question banks load only when the student opens the questions tab.

**Why this priority**: The baseline lesson route ships 775 KB of gzipped JS (4.2 MB raw data chunk).

**Independent Test**: Run `npm run budget` after a build, plus e2e `perf.spec.ts`.

**Acceptance Scenarios**:
1. **Given** a built site, **When** the lesson route loads, **Then** first-load JS is within budget and no question JSON is requested.
2. **Given** the lesson page is open, **When** the student opens the questions tab, **Then** only that lesson's question JSON files are fetched.

---

### User Story 3: Companion book (كتيب التقييمات) (Priority: P2)
Each part can have companion books. The official Assessments booklet gets its own chapter and lesson pages, using the same reading layout as the textbook. Each textbook lesson's questions tab links to the matching booklet lesson.

**Independent Test**: Open `/g/secondary-2/programming-ai/term-1/assessments/`, open lesson 1-2, and answer a question. Then follow the link back to the textbook lesson.

**Acceptance Scenarios**:
1. **Given** a companion with 14 lessons, **When** the student opens it, **Then** the chapters and lessons mirror the textbook TOC with booklet page numbers.
2. **Given** a textbook lesson, **When** the student opens «الأسئلة الرسمية», **Then** a link «افتح في كتيب التقييمات» leads to the companion lesson.

---

### User Story 4: Second part (الترم الثاني) (Priority: P2)
Adding a part is a content-only change: drop the PDF under `book-sources/<grade>/<book>/<part>/`, produce the canonical data, set the part `available` in `book-sources/catalog.json`, and run the build.

**Independent Test**: Flipping term-2 to `available` with valid canonical data produces `/g/secondary-2/programming-ai/term-2/...` pages without code changes.

---

### User Story 5: Progress and offline per part (Priority: P3)
Progress, bookmarks, essay answers and offline packs are scoped per part. Existing users keep their term-1 progress.

**Acceptance Scenarios**:
1. **Given** v1 progress in localStorage, **When** the new app loads, **Then** the progress appears under term-1 and nothing is lost.
2. **Given** the term-1 offline pack is downloaded, **When** the device goes offline, **Then** lessons, the companion booklet and quizzes still open (client-side navigation and hard reload).

### Edge Cases
- Old links (`/chapters/...`, `/exams/`, `/glossary/`, `/practice/`, `/simulators/`) must land on the term-1 equivalent.
- A lesson with no authored deep questions shows an empty state, never placeholder questions.
- A coming-soon part produces no routes, so no 404 links are rendered.
- Base path `/book` (GitHub Pages) vs. empty base path (dev).

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: `book-sources/catalog.json` MUST be the single hand-edited source for grades, books, parts and companions.
- **FR-002**: Routes MUST follow `/g/[gradeId]/[bookSlug]/[partId]/…`, with companions at `/g/…/[partId]/[companionSlug]/…`.
- **FR-003**: Client components MUST NOT import content datasets. Content reaches them as server props or on-demand JSON from `public/data/`.
- **FR-004**: Legacy URLs MUST redirect statically (meta refresh plus client replace) to term-1.
- **FR-005**: Progress storage MUST be keyed by part and migrate v1 data once, idempotently.
- **FR-006**: Offline packs MUST be per part and invalidated by the part's `contentHash`.
- **FR-007**: Prebuild fidelity audits MUST run per available part and fail the build on mismatch.
- **FR-008**: No content may be invented. Authored content stays visibly marked (`contentOrigin`), and every record keeps `source.pages`.

### Key Entities
See [data-model.md](./data-model.md): Catalog, Grade, BookSeries, BookPart, CompanionBook, PartManifest, ProgressV2.

## Success Criteria *(mandatory)*
- **SC-001**: Lesson route first-load JS ≤ 300 KB gzip. Baseline: 775 KB.
- **SC-002**: Home route first-load JS ≤ 200 KB gzip. Baseline: 226 KB.
- **SC-003**: No JS chunk > 300 KB raw. Baseline: 4.2 MB.
- **SC-004**: No generated data file > 400 KB.
- **SC-005**: `lint`, `tsc`, unit tests, `build`, `verify:pwa`, `budget` and `e2e` all pass in CI.
