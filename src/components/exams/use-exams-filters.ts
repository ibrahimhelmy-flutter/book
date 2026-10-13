import { useMemo, useReducer } from "react";
import {
  INITIAL_FILTERS,
  examsFilterReducer,
  type DifficultyFilter,
  type ExamsFilterState,
  type OfficialSectionFilter,
  type OfficialTypeFilter,
} from "./exams-logic";

export interface ExamsFilterActions {
  toggleChapter: (chapterId: string) => void;
  allChapters: () => void;
  toggleLesson: (lessonKey: string) => void;
  allLessons: () => void;
  clearLessons: () => void;
  toggleUnitReview: (fallbackChapterId: string | null) => void;
  setDifficulty: (difficulty: DifficultyFilter) => void;
  setSearch: (search: string) => void;
  setOfficialSection: (section: OfficialSectionFilter) => void;
  setOfficialType: (officialType: OfficialTypeFilter) => void;
  reset: () => void;
  setPracticePage: (page: number) => void;
  setOfficialPage: (page: number) => void;
  setQuestionIndex: (index: number) => void;
}

/** Scope + filter + pagination state of the exams page, with stable bound action creators. */
export function useExamsFilters(): { filters: ExamsFilterState; actions: ExamsFilterActions } {
  const [filters, dispatch] = useReducer(examsFilterReducer, INITIAL_FILTERS);
  const actions = useMemo<ExamsFilterActions>(
    () => ({
      toggleChapter: (chapterId) => dispatch({ type: "toggleChapter", chapterId }),
      allChapters: () => dispatch({ type: "allChapters" }),
      toggleLesson: (lessonKey) => dispatch({ type: "toggleLesson", lessonKey }),
      allLessons: () => dispatch({ type: "allLessons" }),
      clearLessons: () => dispatch({ type: "clearLessons" }),
      toggleUnitReview: (fallbackChapterId) => dispatch({ type: "toggleUnitReview", fallbackChapterId }),
      setDifficulty: (difficulty) => dispatch({ type: "setDifficulty", difficulty }),
      setSearch: (search) => dispatch({ type: "setSearch", search }),
      setOfficialSection: (section) => dispatch({ type: "setOfficialSection", section }),
      setOfficialType: (officialType) => dispatch({ type: "setOfficialType", officialType }),
      reset: () => dispatch({ type: "reset" }),
      setPracticePage: (page) => dispatch({ type: "setPracticePage", page }),
      setOfficialPage: (page) => dispatch({ type: "setOfficialPage", page }),
      setQuestionIndex: (index) => dispatch({ type: "setQuestionIndex", index }),
    }),
    []
  );
  return { filters, actions };
}
