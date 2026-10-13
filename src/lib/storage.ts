/**
 * Learner progress in localStorage, scoped per book part (PartKey, e.g. "secondary-2/programming-ai/term-1").
 *
 * v2 layout:  egyptian_curriculum_progress_v2 = { version: 2, parts: { [partKey]: PartProgress }, global }
 * v1 data (single book, bare lesson ids) is migrated once into LEGACY_PART_KEY by ensureMigrated();
 * the v1 key is left in place so a rollback to the previous release keeps working.
 */
import type { UserProgress, UserProfile } from "@/types";
import type { PartKey } from "@/types/catalog";

const PROGRESS_V1_KEY = "egyptian_curriculum_progress_v1";
const PROGRESS_V2_KEY = "egyptian_curriculum_progress_v2";
const PROFILE_STORAGE_KEY = "egyptian_curriculum_profile_v1";
const SCHEMA_FLAG_KEY = "storage_schema_version";

/** The part every pre-catalog (v1) record belongs to. */
export const LEGACY_PART_KEY: PartKey = "secondary-2/programming-ai/term-1";

export interface PartProgress {
  completedLessons: string[];
  bookmarks: string[];
  quizScores: Record<string, { score: number; total: number; date: string }>;
  notes: Record<string, string>;
}

export interface GlobalProgress {
  streakDays: number;
  lastActiveDate: string;
  points: number;
  badges: string[];
}

export interface ProgressV2 {
  version: 2;
  parts: Record<PartKey, PartProgress>;
  global: GlobalProgress;
}

const today = () => new Date().toISOString().split("T")[0];

const emptyPart = (): PartProgress => ({ completedLessons: [], bookmarks: [], quizScores: {}, notes: {} });
const defaultGlobal = (): GlobalProgress => ({
  streakDays: 1,
  lastActiveDate: today(),
  points: 0,
  badges: ["مستكشف المعرفة الأول"],
});
const emptyProgress = (): ProgressV2 => ({ version: 2, parts: {}, global: defaultGlobal() });

const defaultProfile: UserProfile = {
  id: "user_student_1",
  name: "طالب المرحلة الثانوية",
  role: "student",
  grade: "",
  school: "",
  avatar: "🎓",
};

// ── Sanitizers (corrupted or outdated localStorage must never crash the app) ─────────────

const isRecord = (x: unknown): x is Record<string, any> => !!x && typeof x === "object" && !Array.isArray(x);
const strings = (x: unknown): string[] => (Array.isArray(x) ? x.filter((v) => typeof v === "string") : []);

function sanitizePart(raw: unknown): PartProgress {
  const r = isRecord(raw) ? raw : {};
  return {
    completedLessons: strings(r.completedLessons),
    bookmarks: strings(r.bookmarks),
    quizScores: isRecord(r.quizScores) ? r.quizScores : {},
    notes: isRecord(r.notes) ? r.notes : {},
  };
}

function sanitizeGlobal(raw: unknown): GlobalProgress {
  const r = isRecord(raw) ? raw : {};
  const d = defaultGlobal();
  return {
    streakDays: typeof r.streakDays === "number" && !isNaN(r.streakDays) ? Math.max(1, r.streakDays) : d.streakDays,
    lastActiveDate: typeof r.lastActiveDate === "string" ? r.lastActiveDate : d.lastActiveDate,
    points: typeof r.points === "number" && !isNaN(r.points) ? Math.max(0, r.points) : d.points,
    badges: Array.isArray(r.badges) ? strings(r.badges) : d.badges,
  };
}

export function sanitizeProgressV2(raw: unknown): ProgressV2 {
  if (!isRecord(raw) || raw.version !== 2) return emptyProgress();
  const parts: Record<PartKey, PartProgress> = {};
  if (isRecord(raw.parts)) for (const [k, v] of Object.entries(raw.parts)) parts[k] = sanitizePart(v);
  return { version: 2, parts, global: sanitizeGlobal(raw.global) };
}

/** Pure v1 → v2 conversion (unit-tested). */
export function migrateProgressV1(v1: unknown, legacyPartKey: PartKey = LEGACY_PART_KEY): ProgressV2 {
  if (!isRecord(v1)) return emptyProgress();
  return { version: 2, parts: { [legacyPartKey]: sanitizePart(v1) }, global: sanitizeGlobal(v1) };
}

/** Pure mapping of v1 per-lesson localStorage keys to their part-scoped v2 names (unit-tested). */
export function migrateLegacyKeyName(key: string, legacyPartKey: PartKey = LEGACY_PART_KEY): string | null {
  const essay = key.match(/^essay_(ans|score)_(lesson-[^_]+)_(.+)$/);
  if (essay) return `essay_${essay[1]}:${legacyPartKey}:${essay[2]}:${essay[3]}`;
  if (key === "glossary_bookmarks_v1") return glossaryBookmarksKey(legacyPartKey);
  return null;
}

export const essayAnswerKey = (partKey: PartKey, lessonId: string, qId: string) => `essay_ans:${partKey}:${lessonId}:${qId}`;
export const essayScoreKey = (partKey: PartKey, lessonId: string, qId: string) => `essay_score:${partKey}:${lessonId}:${qId}`;
export const glossaryBookmarksKey = (partKey: PartKey) => `glossary_bookmarks:v2:${partKey}`;

// ── Migration ────────────────────────────────────────────────────────────

let migrated = false;

/** Idempotent, synchronous one-time migration of v1 storage. Safe to call on every read. */
export function ensureMigrated(): void {
  if (migrated || typeof window === "undefined") return;
  migrated = true;
  try {
    if (localStorage.getItem(SCHEMA_FLAG_KEY) === "2") return;

    if (!localStorage.getItem(PROGRESS_V2_KEY)) {
      const rawV1 = localStorage.getItem(PROGRESS_V1_KEY);
      if (rawV1 && rawV1 !== "undefined" && rawV1 !== "null") {
        const v2 = migrateProgressV1(JSON.parse(rawV1));
        localStorage.setItem(PROGRESS_V2_KEY, JSON.stringify(v2));
      }
    }

    const renames: [string, string][] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const next = key ? migrateLegacyKeyName(key) : null;
      if (key && next && localStorage.getItem(next) === null) renames.push([key, next]);
    }
    for (const [from, to] of renames) localStorage.setItem(to, localStorage.getItem(from) ?? "");

    localStorage.setItem(SCHEMA_FLAG_KEY, "2");
  } catch {
    // Storage unavailable (private mode / quota): the app still works with in-memory defaults.
  }
}

// ── Progress API ─────────────────────────────────────────────────────────

export function getAllProgress(): ProgressV2 {
  if (typeof window === "undefined") return emptyProgress();
  ensureMigrated();
  try {
    const raw = localStorage.getItem(PROGRESS_V2_KEY);
    return raw ? sanitizeProgressV2(JSON.parse(raw)) : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

function saveAllProgress(progress: ProgressV2): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_V2_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error("Failed to save progress to localStorage", err);
  }
}

/** One part's progress merged with global stats (the shape components used before v2). */
export function getStoredProgress(partKey: PartKey): UserProgress {
  const all = getAllProgress();
  return { ...(all.parts[partKey] ?? emptyPart()), ...all.global };
}

function updatePart(partKey: PartKey, fn: (part: PartProgress, global: GlobalProgress) => void): UserProgress {
  const all = getAllProgress();
  const part = all.parts[partKey] ?? emptyPart();
  fn(part, all.global);
  all.parts[partKey] = part;
  saveAllProgress(all);
  return { ...part, ...all.global };
}

export function toggleLessonComplete(partKey: PartKey, lessonId: string): UserProgress {
  return updatePart(partKey, (part, global) => {
    const exists = part.completedLessons.includes(lessonId);
    part.completedLessons = exists ? part.completedLessons.filter((id) => id !== lessonId) : [...part.completedLessons, lessonId];
    global.points = exists ? Math.max(0, global.points - 50) : global.points + 50;
  });
}

export function toggleBookmark(partKey: PartKey, lessonId: string): UserProgress {
  return updatePart(partKey, (part) => {
    const exists = part.bookmarks.includes(lessonId);
    part.bookmarks = exists ? part.bookmarks.filter((id) => id !== lessonId) : [...part.bookmarks, lessonId];
  });
}

export function saveQuizScore(partKey: PartKey, lessonId: string, score: number, total: number): UserProgress {
  return updatePart(partKey, (part, global) => {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    part.quizScores = { ...part.quizScores, [lessonId]: { score, total, date: new Date().toISOString() } };
    global.points += percentage;
    if (percentage === 100 && !global.badges.includes("العلامة الكاملة 🎯")) global.badges.push("العلامة الكاملة 🎯");
    if (Object.keys(part.quizScores).length >= 5 && !global.badges.includes("خبير الاختبارات 🧠")) {
      global.badges.push("خبير الاختبارات 🧠");
    }
  });
}

export function saveLessonNote(partKey: PartKey, lessonId: string, note: string): UserProgress {
  return updatePart(partKey, (part) => {
    part.notes = { ...part.notes, [lessonId]: note };
  });
}

// ── Profile ──────────────────────────────────────────────────────────────

// Placeholder schools older versions pre-filled (and saved) for every user; a real school was never chosen.
const LEGACY_DEFAULT_SCHOOLS = new Set([
  "مدرسة المتفوقين للعلوم والتكنولوجيا (STEM)",
  "مدرسة المتفوقين للعلوم والتكنولوجيا",
  "المدرسة الثانوية",
]);

function sanitizeProfile(raw: unknown): UserProfile {
  if (!isRecord(raw)) return defaultProfile;
  return {
    id: typeof raw.id === "string" ? raw.id : defaultProfile.id,
    name: typeof raw.name === "string" && raw.name.trim() ? raw.name : defaultProfile.name,
    role: raw.role === "teacher" ? "teacher" : "student",
    grade: typeof raw.grade === "string" ? raw.grade : defaultProfile.grade,
    school: typeof raw.school === "string" && !LEGACY_DEFAULT_SCHOOLS.has(raw.school) ? raw.school : defaultProfile.school,
    avatar: typeof raw.avatar === "string" ? raw.avatar : defaultProfile.avatar,
  };
}

export function getStoredProfile(): UserProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw || raw === "undefined" || raw === "null") return defaultProfile;
    return sanitizeProfile(JSON.parse(raw));
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(sanitizeProfile(profile)));
  } catch (err) {
    console.error("Failed to save profile to localStorage", err);
  }
}
