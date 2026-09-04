/**
 * Standard Difficulty Levels Configuration
 * No magic strings or numbers.
 */

export type DifficultyLevel = "easy" | "medium" | "hard" | "advanced";

export interface DifficultyConfigItem {
  id: DifficultyLevel;
  labelAr: string;
  labelEn: string;
  defaultWeight: number; // 0 to 1
  colorTheme: string;
}

export const DIFFICULTY_CONFIG: Record<DifficultyLevel, DifficultyConfigItem> = {
  easy: {
    id: "easy",
    labelAr: "سهل (استرجاع مباشر)",
    labelEn: "Easy",
    defaultWeight: 0.25,
    colorTheme: "text-blue-400 bg-blue-500/15 border-blue-500/30",
  },
  medium: {
    id: "medium",
    labelAr: "متوسط (فهم وتطبيق)",
    labelEn: "Medium",
    defaultWeight: 0.40,
    colorTheme: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
  },
  hard: {
    id: "hard",
    labelAr: "صعب (تحليل وحل مشكلات)",
    labelEn: "Hard",
    defaultWeight: 0.25,
    colorTheme: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  },
  advanced: {
    id: "advanced",
    labelAr: "فائقين (مستويات عليا وتكامل)",
    labelEn: "Advanced / Honors",
    defaultWeight: 0.10,
    colorTheme: "text-rose-400 bg-rose-500/15 border-rose-500/30",
  },
};

export const DEFAULT_DIFFICULTY_DISTRIBUTION: Record<DifficultyLevel, number> = {
  easy: 25,
  medium: 40,
  hard: 25,
  advanced: 10,
};
