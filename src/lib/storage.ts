import { UserProgress, UserProfile } from "@/types";

const PROGRESS_STORAGE_KEY = "egyptian_curriculum_progress_v1";
const PROFILE_STORAGE_KEY = "egyptian_curriculum_profile_v1";

const defaultProgress: UserProgress = {
  completedLessons: [],
  quizScores: {},
  bookmarks: [],
  notes: {},
  streakDays: 1,
  lastActiveDate: new Date().toISOString().split("T")[0],
  points: 0,
  badges: ["مستكشف المعرفة الأول"],
};

const defaultProfile: UserProfile = {
  id: "user_student_1",
  name: "طالب الثانوية العامة",
  email: "student@moe.edu.eg",
  role: "student",
  grade: "الصف الثاني الثانوي (بكالوريا)",
  school: "مدرسة المتفوقين للعلوم والتكنولوجيا (STEM)",
  avatar: "🎓",
};

export function getStoredProgress(): UserProgress {
  if (typeof window === "undefined") return defaultProgress;
  try {
    const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!raw || raw === "undefined" || raw === "null") return defaultProgress;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultProgress;
    return { ...defaultProgress, ...parsed };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error("Failed to save progress to localStorage", err);
  }
}

export function toggleLessonComplete(lessonId: string): UserProgress {
  const current = getStoredProgress();
  const exists = current.completedLessons.includes(lessonId);
  const updatedCompleted = exists
    ? current.completedLessons.filter((id) => id !== lessonId)
    : [...current.completedLessons, lessonId];

  const earnedPoints = exists ? Math.max(0, current.points - 50) : current.points + 50;
  
  const updated: UserProgress = {
    ...current,
    completedLessons: updatedCompleted,
    points: earnedPoints,
  };
  saveProgress(updated);
  return updated;
}

export function toggleBookmark(lessonId: string): UserProgress {
  const current = getStoredProgress();
  const exists = current.bookmarks.includes(lessonId);
  const updatedBookmarks = exists
    ? current.bookmarks.filter((id) => id !== lessonId)
    : [...current.bookmarks, lessonId];

  const updated: UserProgress = {
    ...current,
    bookmarks: updatedBookmarks,
  };
  saveProgress(updated);
  return updated;
}

export function saveQuizScore(lessonId: string, score: number, total: number): UserProgress {
  const current = getStoredProgress();
  const percentage = Math.round((score / total) * 100);
  const additionalPoints = Math.round((score / total) * 100);

  const updatedScores = {
    ...current.quizScores,
    [lessonId]: {
      score,
      total,
      date: new Date().toISOString(),
    },
  };

  const newBadges = [...current.badges];
  if (percentage === 100 && !newBadges.includes("العلامة الكاملة 🎯")) {
    newBadges.push("العلامة الكاملة 🎯");
  }
  if (Object.keys(updatedScores).length >= 5 && !newBadges.includes("خبير الاختبارات 🧠")) {
    newBadges.push("خبير الاختبارات 🧠");
  }

  const updated: UserProgress = {
    ...current,
    quizScores: updatedScores,
    points: current.points + additionalPoints,
    badges: newBadges,
  };
  saveProgress(updated);
  return updated;
}

export function saveLessonNote(lessonId: string, note: string): UserProgress {
  const current = getStoredProgress();
  const updated: UserProgress = {
    ...current,
    notes: {
      ...current.notes,
      [lessonId]: note,
    },
  };
  saveProgress(updated);
  return updated;
}

export function getStoredProfile(): UserProfile {
  if (typeof window === "undefined") return defaultProfile;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw || raw === "undefined" || raw === "null") return defaultProfile;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultProfile;
    return { ...defaultProfile, ...parsed };
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: UserProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error("Failed to save profile to localStorage", err);
  }
}
