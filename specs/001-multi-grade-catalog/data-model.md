# Data Model

Types live in `src/types/catalog.ts`, `src/types/assessments.ts`, `src/types/deep-questions.ts`, `src/types/index.ts`.

## Catalog (`book-sources/catalog.json` → `public/data/catalog.json`)
```
Catalog { version: 1, grades: CatalogGrade[] }
CatalogGrade { id, title, stage, order, books: CatalogBook[] }
CatalogBook  { slug, title, englishTitle?, icon?, colorTheme?, description?, accreditation?, parts: CatalogPart[] }
CatalogPart  { id, key, title, shortTitle, order, status: "available"|"coming-soon", academicYear?, stats?, companions }
CatalogCompanion { slug, kind: "assessments", title, status }
```
The source `catalog.json` also carries per part: `legacy?`, `edition { academicYear, pdfFile, rawFullTextFile }`, `assetsBase`, and per companion `pdfFile`, `dataDir` (relative to the part root).

**PartKey** = `"<gradeId>/<bookSlug>/<partId>"`. It is the data folder (`public/data/<key>/`), the route prefix (`/g/<key>/`), the progress-storage key and the offline-pack key.

## Per part (`public/data/<key>/`)
| File | Type | Consumer |
|---|---|---|
| `manifest.json` | `PartManifest` (TOC `NavChapter[]`, `BookStats`, `CompanionManifest[]`, `deepQuestionCounts`, `storylineLessonIds`, `contentHash`) | part layout → `PartProvider` |
| `lessons/<lessonId>.json` | `Lesson` | lesson page (server) |
| `<companionSlug>/<lessonId>.json` | `OfficialLessonAssessments` | companion lesson page (server), lesson quiz tab + exams page (fetch) |
| `deep/<lessonKey>.json` | `DeepChallengingQuestion[]` | lesson quiz tab (fetch) |
| `practice/<lessonKey>.json` | `EnrichedSimpleQuestion[]` | exams page (fetch) |
| `exams-index.json` | `ExamsIndex` | exams page (server props) |
| `glossary.json`, `acronyms.json`, `simulators.json` | `GlossaryTerm[]`, `AcronymTerm[]`, `SimulatorMeta[]` | server props |
| `search-lessons.json` | `SearchLesson[]` | search modal (fetch on open) |
| `storylines/<lessonId>.json` | `LessonStoryline` | storyline page (server) |

`lessonKey` = lesson number (`"1-2"`) or unit review (`"1-review"`).

## Learner state (browser)
```
localStorage egyptian_curriculum_progress_v2 = ProgressV2 {
  version: 2,
  parts: { [PartKey]: { completedLessons, bookmarks, quizScores, notes } },
  global: { streakDays, lastActiveDate, points, badges }
}
essay_ans:<partKey>:<lessonId>:<qId>, essay_score:<partKey>:<lessonId>:<qId>, glossary_bookmarks:v2:<partKey>
IndexedDB EgyptianAICurriculumDB v2 → packs { partKey, contentHash, downloadedAt, fileCount, counts, sizeBytes, appVersion }
CacheStorage ai-curriculum-shell-v<APP>, ai-curriculum-pack-v<APP>::<partKey>
```
