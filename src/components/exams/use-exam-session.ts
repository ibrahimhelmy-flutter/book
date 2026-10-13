import { useCallback, useEffect, useRef, useState } from "react";
import type { UserAnswerRecord } from "@/components/quiz/SingleQuestionPlayer";
import type { ExamsIndex, NavChapter } from "@/types/catalog";
import type { GeneratedExamModel } from "@/lib/exam-generator/types";
import { createExamModelFromQuestions } from "@/lib/practice";
import { presetRecipe, type PresetKey } from "./exams-logic";
import { loadPracticeQuestions } from "./use-question-banks";

export interface ScoreStats {
  answered: number;
  correct: number;
}

const NO_SCORE: ScoreStats = { answered: 0, correct: 0 };

/** Running answered/correct counter shown above question lists. */
export function useScore() {
  const [score, setScore] = useState<ScoreStats>(NO_SCORE);
  const record = useCallback((isCorrect: boolean) => {
    setScore((prev) => ({ answered: prev.answered + 1, correct: prev.correct + (isCorrect ? 1 : 0) }));
  }, []);
  const undo = useCallback((wasCorrect: boolean) => {
    setScore((prev) => ({
      answered: Math.max(0, prev.answered - 1),
      correct: Math.max(0, prev.correct - (wasCorrect ? 1 : 0)),
    }));
  }, []);
  const reset = useCallback(() => setScore(NO_SCORE), []);
  return { score, record, undo, reset };
}

export type PracticeDisplayMode = "single" | "list";

/** Practice tab session (kept in ExamsView so it survives tab switches): score, answers, view mode. */
export function usePracticeSession() {
  const { score, record, undo, reset: resetScore } = useScore();
  const [answers, setAnswers] = useState<Record<string, UserAnswerRecord>>({});
  const [displayMode, setDisplayMode] = useState<PracticeDisplayMode>("single");

  const answerSingle = useCallback(
    (questionId: string, selectedOption: string, isCorrect: boolean) => {
      setAnswers((prev) => ({ ...prev, [questionId]: { selectedOption, isCorrect } }));
      record(isCorrect);
    },
    [record]
  );

  const resetQuestion = useCallback(
    (questionId: string) => {
      const existing = answers[questionId];
      if (existing) undo(existing.isCorrect);
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[questionId];
        return next;
      });
    },
    [answers, undo]
  );

  const resetAll = useCallback(() => {
    setAnswers({});
    resetScore();
  }, [resetScore]);

  return { score, recordListAnswer: record, resetScore, answers, answerSingle, resetQuestion, resetAll, displayMode, setDisplayMode };
}

export type PracticeSession = ReturnType<typeof usePracticeSession>;

/** Copies a JSON payload to the clipboard (with a textarea fallback) and flags success for 2.5s. */
export function useCopyJson() {
  const [isCopied, setIsCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  const copy = useCallback(async (data: unknown) => {
    const text = JSON.stringify(data, null, 2);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setIsCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setIsCopied(false), 2500);
  }, []);

  return { isCopied, copy };
}

export function downloadJson(data: unknown, fileName: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Launches a ready-made booklet exam: fetches only the practice files the preset needs (on click),
 * then builds the timed exam model. Tracks which preset is loading or failed for the UI.
 */
export function usePresetLauncher(
  partKey: string,
  examsIndex: ExamsIndex,
  chapters: NavChapter[],
  onReady: (model: GeneratedExamModel) => void
) {
  const [state, setState] = useState<{ key: PresetKey; failed: boolean } | null>(null);

  const launch = useCallback(
    async (key: PresetKey) => {
      const recipe = presetRecipe(key, examsIndex, chapters);
      if (!recipe || recipe.lessonKeys.length === 0) return;
      setState({ key, failed: false });
      try {
        const pool = await loadPracticeQuestions(partKey, recipe.lessonKeys);
        setState(null);
        if (pool.length === 0) return;
        onReady(
          createExamModelFromQuestions(pool, {
            title: recipe.title(pool.length),
            durationMinutes: recipe.durationMinutes,
            maxQuestions: recipe.maxQuestions,
            randomize: true,
          })
        );
      } catch {
        setState({ key, failed: true });
      }
    },
    [partKey, examsIndex, chapters, onReady]
  );

  return {
    launch,
    launchingKey: state && !state.failed ? state.key : null,
    failedKey: state?.failed ? state.key : null,
  };
}
