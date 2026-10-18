"use client";

import React, { useState, useMemo, useRef } from "react";
import type { Lesson } from "@/types";
import type { DeepChallengingQuestion } from "@/types/deep-questions";
import {
  Check,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
  Brain,
  Sparkles,
  HelpCircle,
  Eye,
  EyeOff,
  Lightbulb,
  BookOpen,
} from "lucide-react";
import { fireConfetti } from "@/lib/confetti";
import { mapAllQuestionsToSections, QuestionWithSection } from "@/lib/comprehension-matcher";
import {
  KIND_LABELS,
  KIND_ORDER,
  essayStatus,
  fillBlankStatus,
  questionKind,
  type AnswerStatus,
  type DeepQuestionKind,
} from "@/lib/deep-question-kinds";
import { EssayChecklist, EssayDraft, FillBlankActions, FillBlankSentence, TrueFalseButtons } from "./DeepAnswerPanels";

interface Props {
  lesson: Lesson;
  /** Authored deep questions for this lesson (fetched on demand by the quiz panel). */
  questions: DeepChallengingQuestion[];
  targetSectionId?: string | null;
  onClearTargetSection?: () => void;
  /** Header title and section-strip label (a chapter bank filters by lesson instead of section). */
  heading?: string;
  sectionFilterLabel?: string;
}

type SimpleDifficulty = "easy" | "medium" | "hard";

const DIFFICULTY_CONFIG: Record<
  string,
  { label: string; badgeClass: string; dotClass: string }
> = {
  easy: {
    label: "سهل",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    dotClass: "bg-emerald-400",
  },
  medium: {
    label: "متوسط",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    dotClass: "bg-amber-400",
  },
  hard: {
    label: "صعب",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/30",
    dotClass: "bg-rose-400",
  },
};

const OPTION_LETTERS = ["أ", "ب", "ج", "د"];

function formatParagraphs(text: string) {
  const paragraphs = text.split("\n");
  return paragraphs.map((paragraph, pIdx) => {
    if (!paragraph.trim()) return <div key={pIdx} className="h-1" />;

    const parts = paragraph.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={pIdx} className="leading-relaxed">
        {parts.map((part, partIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            const inner = part.slice(2, -2);
            return (
              <strong key={partIdx} className="font-bold text-indigo-300">
                {inner}
              </strong>
            );
          }
          return <span key={partIdx}>{part}</span>;
        })}
      </p>
    );
  });
}

function formatExplanationContent(text: string) {
  if (!text) return null;

  if (text.includes("```")) {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return (
      <div className="space-y-2 leading-relaxed">
        {parts.map((part, idx) => {
          if (part.startsWith("```") && part.endsWith("```")) {
            const lines = part.slice(3, -3).trim().split("\n");
            const firstLine = lines[0]?.trim();
            const codeLines =
              firstLine === "text" || firstLine === "json" || firstLine === "javascript"
                ? lines.slice(1)
                : lines;
            return (
              <pre
                key={idx}
                dir="ltr"
                className="bg-slate-950/90 border border-slate-800 text-cyan-300 font-mono text-xs p-3 rounded-xl overflow-x-auto shadow-inner my-2 leading-tight select-all"
              >
                <code>{codeLines.join("\n")}</code>
              </pre>
            );
          }
          return (
            <div key={idx} className="space-y-1.5">
              {formatParagraphs(part)}
            </div>
          );
        })}
      </div>
    );
  }

  return <div className="space-y-2 leading-relaxed">{formatParagraphs(text)}</div>;
}

export function DeepComprehensionViewer({
  lesson,
  questions: allQuestions,
  targetSectionId,
  onClearTargetSection,
  heading = "أسئلة وتدريبات الفهم للدرس",
  sectionFilterLabel = "تصفية الأسئلة بحسب أقسام الشرح:",
}: Props) {

  // Map each question to its corresponding section in the lesson
  const mappedQuestions = useMemo<QuestionWithSection[]>(() => {
    return mapAllQuestionsToSections(allQuestions, lesson);
  }, [allQuestions, lesson]);

  // Section filter: "all" or specific section ID
  const [selectedSectionId, setSelectedSectionId] = useState<string>(targetSectionId || "all");

  // Sync when targetSectionId changes from external click (e.g. from lesson section jump button)
  React.useEffect(() => {
    if (targetSectionId) {
      setSelectedSectionId(targetSectionId);
      setCurrentIndex(0);
    }
  }, [targetSectionId]);

  // Difficulty filter: "all" | "easy" | "medium" | "hard"
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // "Think First" Active Recall Mode (persisted in localStorage, default true)
  const [thinkFirstMode, setThinkFirstMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("deep_comprehension_think_first_mode");
      if (saved !== null) {
        return saved === "true";
      }
    }
    return true; // Enabled by default
  });

  // Track revealed questions per originalIndex so already revealed or answered questions stay visible
  const [revealedQuestions, setRevealedQuestions] = useState<Record<number, boolean>>({});

  const handleToggleThinkFirstMode = () => {
    setThinkFirstMode((prev) => {
      const next = !prev;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("deep_comprehension_think_first_mode", String(next));
        } catch {
          // Ignore localStorage errors
        }
      }
      return next;
    });
  };

  // Current question index in the filtered list
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Question kind filter: "all" or one DeepQuestionKind
  const [selectedKind, setSelectedKind] = useState<"all" | DeepQuestionKind>("all");

  // User selected answers (mcq / true_false): map of questionIndex/identifier -> selectedOptionText
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  // fill_blank: typed text per gap, whether the question was checked, and whether its answer was shown instead
  const [blankInputs, setBlankInputs] = useState<Record<number, string[]>>({});
  const [checkedBlanks, setCheckedBlanks] = useState<Record<number, boolean>>({});
  const [revealedBlanks, setRevealedBlanks] = useState<Record<number, boolean>>({});
  // essay: draft answer, model answer revealed, and the key points the learner ticked
  const [essayDrafts, setEssayDrafts] = useState<Record<number, string>>({});
  const [essayRevealed, setEssayRevealed] = useState<Record<number, boolean>>({});
  const [essayCovered, setEssayCovered] = useState<Record<number, number[]>>({});

  const cardRef = useRef<HTMLDivElement>(null);

  // Normalize questions to have a consistent difficulty and answer text
  const normalizedQuestions = useMemo(() => {
    return mappedQuestions.map((q, idx) => {
      let diff: SimpleDifficulty = "medium";
      const rawDiff = String(q.difficulty || "").toLowerCase();
      if (rawDiff === "easy" || rawDiff === "سهل") diff = "easy";
      else if (rawDiff === "hard" || rawDiff === "very-hard" || rawDiff === "expert" || rawDiff === "صعب") diff = "hard";

      let answerText = "";
      if (typeof q.answer === "string" && q.answer.trim()) {
        answerText = q.answer.trim();
      } else if (typeof q.correctAnswerText === "string" && q.correctAnswerText.trim()) {
        answerText = q.correctAnswerText.trim();
      } else if (typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer < q.options.length) {
        answerText = q.options[q.correctAnswer];
      }

      return {
        ...q,
        originalIndex: idx,
        kind: questionKind(q),
        difficulty: diff,
        answer: answerText || q.options[0] || "",
      };
    });
  }, [mappedQuestions]);

  // Kinds present in this bank (the kind filter and badges only show when there is more than one)
  const kindCounts = useMemo(() => {
    const counts: Partial<Record<DeepQuestionKind, number>> = {};
    normalizedQuestions.forEach((q) => {
      counts[q.kind] = (counts[q.kind] || 0) + 1;
    });
    return counts;
  }, [normalizedQuestions]);
  const presentKinds = KIND_ORDER.filter((k) => kindCounts[k]);
  const isMixedBank = presentKinds.length > 1;

  type NormalizedQuestion = (typeof normalizedQuestions)[number];

  // Result of a question: null while unanswered, "reviewed" for an essay revealed but not self-assessed yet,
  // "revealed" for a fill_blank whose answer was shown without checking (not counted as wrong)
  const statusOf = (q: NormalizedQuestion): AnswerStatus | "reviewed" | "revealed" | null => {
    const key = q.originalIndex;
    if (q.kind === "fill_blank") {
      if (!checkedBlanks[key]) return null;
      return revealedBlanks[key] ? "revealed" : fillBlankStatus(blankInputs[key] || [], q.blanks || []);
    }
    if (q.kind === "essay") {
      if (!essayRevealed[key]) return null;
      const covered = essayCovered[key]?.length || 0;
      return covered > 0 ? essayStatus(covered, q.keyPoints?.length || 0) : "reviewed";
    }
    if (userAnswers[key] === undefined) return null;
    return userAnswers[key] === q.answer ? "correct" : "wrong";
  };

  // Question counts per section ID
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    normalizedQuestions.forEach((q) => {
      counts[q.assignedSectionId] = (counts[q.assignedSectionId] || 0) + 1;
    });
    return counts;
  }, [normalizedQuestions]);

  // Filtered by both difficulty and section
  const filteredQuestions = useMemo(() => {
    return normalizedQuestions.filter((q) => {
      const matchDiff = selectedDifficulty === "all" || q.difficulty === selectedDifficulty;
      const matchSec = selectedSectionId === "all" || q.assignedSectionId === selectedSectionId;
      const matchKind = selectedKind === "all" || q.kind === selectedKind;
      return matchDiff && matchSec && matchKind;
    });
  }, [normalizedQuestions, selectedDifficulty, selectedSectionId, selectedKind]);

  const totalFiltered = filteredQuestions.length;
  const safeIndex = Math.min(currentIndex, Math.max(0, totalFiltered - 1));
  const currentQ = filteredQuestions[safeIndex];

  const handleRevealCurrent = () => {
    if (!currentQ) return;
    setRevealedQuestions((prev) => ({
      ...prev,
      [currentQ.originalIndex]: true,
    }));
  };

  const handleSelectOption = (optText: string) => {
    if (!currentQ) return;
    const qKey = currentQ.originalIndex;
    if (userAnswers[qKey] !== undefined) return; // Already answered

    setUserAnswers((prev) => ({
      ...prev,
      [qKey]: optText,
    }));

    if (optText === currentQ.answer) {
      fireConfetti();
    }
  };

  const handleBlankChange = (gap: number, value: string) => {
    if (!currentQ) return;
    const qKey = currentQ.originalIndex;
    setBlankInputs((prev) => {
      const next = [...(prev[qKey] || [])];
      next[gap] = value;
      return { ...prev, [qKey]: next };
    });
  };

  const handleCheckBlanks = () => {
    if (!currentQ) return;
    const qKey = currentQ.originalIndex;
    setCheckedBlanks((prev) => ({ ...prev, [qKey]: true }));
    if (fillBlankStatus(blankInputs[qKey] || [], currentQ.blanks || []) === "correct") {
      fireConfetti();
    }
  };

  const handleRevealBlanks = () => {
    if (!currentQ) return;
    const qKey = currentQ.originalIndex;
    setCheckedBlanks((prev) => ({ ...prev, [qKey]: true }));
    setRevealedBlanks((prev) => ({ ...prev, [qKey]: true }));
  };

  const handleToggleKeyPoint = (point: number) => {
    if (!currentQ) return;
    const qKey = currentQ.originalIndex;
    setEssayCovered((prev) => {
      const list = prev[qKey] || [];
      return { ...prev, [qKey]: list.includes(point) ? list.filter((p) => p !== point) : [...list, point] };
    });
  };

  const handleResetCurrent = () => {
    if (!currentQ) return;
    const qKey = currentQ.originalIndex;
    const without = <T,>(prev: Record<number, T>) => {
      const copy = { ...prev };
      delete copy[qKey];
      return copy;
    };
    setUserAnswers(without);
    setBlankInputs(without);
    setCheckedBlanks(without);
    setRevealedBlanks(without);
    setEssayDrafts(without);
    setEssayRevealed(without);
    setEssayCovered(without);
  };

  const handleNavigate = (newIdx: number) => {
    setCurrentIndex(newIdx);
    if (cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  const handlePrevious = () => {
    if (safeIndex > 0) {
      handleNavigate(safeIndex - 1);
    }
  };

  const handleNext = () => {
    if (safeIndex < totalFiltered - 1) {
      handleNavigate(safeIndex + 1);
    }
  };

  // Keyboard navigation support
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;

      const isHidden =
        thinkFirstMode &&
        currentQ &&
        currentQ.kind === "mcq" &&
        userAnswers[currentQ.originalIndex] === undefined &&
        !revealedQuestions[currentQ.originalIndex];

      // Press Space or Enter to reveal options when hidden
      if (isHidden && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        handleRevealCurrent();
        return;
      }

      if (e.key === "ArrowLeft") {
        handleNext();
      } else if (e.key === "ArrowRight") {
        handlePrevious();
      } else if (["1", "2", "3", "4"].includes(e.key) && currentQ) {
        if (isHidden) return; // Ignore option keys while hidden to prevent premature mistakes
        const qKey = currentQ.originalIndex;
        if (userAnswers[qKey] === undefined) {
          const optionIdx = parseInt(e.key, 10) - 1;
          if (currentQ.options && currentQ.options[optionIdx]) {
            handleSelectOption(currentQ.options[optionIdx]);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [safeIndex, totalFiltered, currentQ, userAnswers, thinkFirstMode, revealedQuestions]);

  if (!allQuestions || allQuestions.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
        <p>لا تتوفر أسئلة لهذا الدرس حالياً.</p>
      </div>
    );
  }

  const selectedAnswer = currentQ ? userAnswers[currentQ.originalIndex] : undefined;
  const currentStatus = currentQ ? statusOf(currentQ) : null;
  const hasInteracted = currentStatus !== null;
  const isCorrect = currentStatus === "correct";
  const isOptionsHidden = currentQ
    ? currentQ.kind === "mcq" && thinkFirstMode && !hasInteracted && !revealedQuestions[currentQ.originalIndex]
    : false;

  const FEEDBACK_STYLE: Record<AnswerStatus | "reviewed" | "revealed", { box: string; icon: string; mark: string; title: string }> = {
    correct: { box: "bg-emerald-950/40 border-emerald-500/40 text-emerald-200", icon: "bg-emerald-500/20 text-emerald-300", mark: "✓", title: "إجابة صحيحة! أحسنت 👏" },
    partial: { box: "bg-amber-950/40 border-amber-500/40 text-amber-200", icon: "bg-amber-500/20 text-amber-300", mark: "½", title: "إجابة صحيحة جزئيًا" },
    wrong: { box: "bg-rose-950/40 border-rose-500/40 text-rose-200", icon: "bg-rose-500/20 text-rose-300", mark: "✕", title: "إجابة غير صحيحة" },
    reviewed: { box: "bg-indigo-950/40 border-indigo-500/40 text-indigo-200", icon: "bg-indigo-500/20 text-indigo-300", mark: "✎", title: "قارن إجابتك بالإجابة النموذجية" },
    revealed: { box: "bg-slate-900/60 border-slate-600/50 text-slate-200", icon: "bg-slate-700/40 text-slate-300", mark: "👁", title: "تم عرض الإجابة" },
  };
  const feedback = FEEDBACK_STYLE[currentStatus || "reviewed"];

  const KIND_HINTS: Record<DeepQuestionKind, string> = {
    mcq: "اختر إحدى الإجابات للتحقق الفوري، وستظهر النتيجة والشرح هنا بالأسفل دون التأثير على مكان الأزرار.",
    true_false: "حدد هل العبارة صواب أم خطأ، وإن كانت خطأ فكّر في تصحيحها قبل أن ترى الإجابة.",
    fill_blank: "اكتب الكلمة أو العبارة الناقصة في كل فراغ، ثم اضغط «تحقق من إجابتي».",
    essay: "اكتب إجابتك أو صُغها في ذهنك، ثم اعرض الإجابة النموذجية وعلّم النقاط التي ذكرتها.",
  };

  const diffConf = currentQ ? DIFFICULTY_CONFIG[currentQ.difficulty] || DIFFICULTY_CONFIG.medium : DIFFICULTY_CONFIG.medium;

  return (
    <div className="w-full max-w-full space-y-4 sm:space-y-6" dir="rtl">
      {/* 1. Simple Header & Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
            <Brain className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-snug">{heading}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isMixedBank
                ? `${presentKinds.map((k) => KIND_LABELS[k]).join("، ")} — مع التحقق الفوري والشرح`
                : "أسئلة مبسطة (سؤال، اختيارات، وإجابة) مع التحقق الفوري عند الحل"}
            </p>
          </div>
        </div>

        {/* Action Controls: Think First Switch + Difficulty Filters */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 lg:pt-0 border-t border-slate-800 lg:border-t-0 justify-between lg:justify-end">
          {/* Think First Toggle */}
          <button
            type="button"
            onClick={handleToggleThinkFirstMode}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border select-none ${
              thinkFirstMode
                ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm"
                : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
            }`}
            title={
              thinkFirstMode
                ? "نمط التفكير المسبق مفعّل: الخيارات محجوبة لتشجيع التفكير الذاتي"
                : "نمط التفكير المسبق معطّل: الخيارات ظاهرة مباشرة كاختيار من متعدد"
            }
          >
            <div className="flex items-center gap-1.5">
              {thinkFirstMode ? (
                <Brain className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-slate-500" />
              )}
              <span>نمط التفكير المسبق</span>
            </div>
            <div
              className={`w-7 h-4 rounded-full p-0.5 transition-colors flex items-center ${
                thinkFirstMode ? "bg-indigo-600 justify-start" : "bg-slate-700 justify-end"
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
            </div>
          </button>

          {/* Difficulty Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-400 px-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <span>الصعوبة:</span>
            </span>

            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty("all");
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedDifficulty === "all"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              الكل ({normalizedQuestions.length})
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty("easy");
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedDifficulty === "easy"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              سهل ({normalizedQuestions.filter((q) => q.difficulty === "easy").length})
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty("medium");
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedDifficulty === "medium"
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              متوسط ({normalizedQuestions.filter((q) => q.difficulty === "medium").length})
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedDifficulty("hard");
                setCurrentIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                selectedDifficulty === "hard"
                  ? "bg-rose-600 text-white shadow-md"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              صعب ({normalizedQuestions.filter((q) => q.difficulty === "hard").length})
            </button>
          </div>
        </div>
      </div>

      {/* 1.25. Question Kind Strip (only for banks that mix kinds) */}
      {isMixedBank && (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-2 bg-slate-900/80 border border-slate-800 rounded-2xl">
          {(["all", ...presentKinds] as const).map((k) => {
            const isSelected = selectedKind === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setSelectedKind(k);
                  setCurrentIndex(0);
                }}
                aria-pressed={isSelected}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-cyan-400/40"
                    : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>{k === "all" ? "كل الأنواع" : KIND_LABELS[k]}</span>
                <span className="font-mono text-[10px] opacity-80">
                  ({k === "all" ? normalizedQuestions.length : kindCounts[k]})
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 1.5. Section Filter Strip (if lesson has sections) */}
      {lesson.sections && lesson.sections.length > 1 && (
        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs px-1">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>{sectionFilterLabel}</span>
            </span>
            {selectedSectionId !== "all" && (
              <button
                type="button"
                onClick={() => {
                  setSelectedSectionId("all");
                  setCurrentIndex(0);
                  if (onClearTargetSection) onClearTargetSection();
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 underline font-semibold cursor-pointer"
              >
                عرض أسئلة كل الأقسام
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => {
                setSelectedSectionId("all");
                setCurrentIndex(0);
                if (onClearTargetSection) onClearTargetSection();
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                selectedSectionId === "all"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400/40"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <span>جميع الأقسام</span>
              <span className="font-mono text-[10px] opacity-80">({normalizedQuestions.length})</span>
            </button>

            {lesson.sections.map((sec, sIdx) => {
              const count = sectionCounts[sec.id] || 0;
              const isSelected = selectedSectionId === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => {
                    setSelectedSectionId(sec.id);
                    setCurrentIndex(0);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 max-w-[240px] truncate ${
                    isSelected
                      ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400/40"
                      : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                  }`}
                  title={sec.title}
                >
                  <span className="font-mono text-[11px] opacity-75 shrink-0">#{sIdx + 1}</span>
                  <span className="truncate">{sec.title.replace(/^[0-9.]+\s*/, "")}</span>
                  <span className="font-mono text-[10px] opacity-80 shrink-0">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Questions Jump Strip (Quick Numbers) */}
      {totalFiltered > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-2 bg-slate-900/60 border border-slate-800 rounded-2xl">
          {filteredQuestions.map((q, idx) => {
            const status = statusOf(q);
            const isCurrent = idx === safeIndex;

            let btnClass = "bg-slate-800 text-slate-400 hover:bg-slate-700";
            if (isCurrent) {
              btnClass = "bg-indigo-600 text-white ring-2 ring-indigo-400 font-bold shadow-md";
            } else if (status === "correct") {
              btnClass = "bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold";
            } else if (status === "partial") {
              btnClass = "bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold";
            } else if (status === "wrong") {
              btnClass = "bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold";
            } else if (status === "reviewed") {
              btnClass = "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-bold";
            } else if (status === "revealed") {
              btnClass = "bg-slate-700/40 text-slate-300 border border-slate-500/40 font-bold";
            }

            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleNavigate(idx)}
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs transition-all cursor-pointer ${btnClass}`}
                title={`سؤال ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      )}

      {/* 3. Main Simple Question Card */}
      {currentQ ? (
        <div
          ref={cardRef}
          className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-7 space-y-4 sm:space-y-5 shadow-xl transition-all"
        >
          {/* Header: Difficulty Badge + Section Badge + Quick Top Controls */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${diffConf.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${diffConf.dotClass}`} />
                <span>{diffConf.label}</span>
              </span>

              {isMixedBank && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                  {KIND_LABELS[currentQ.kind]}
                </span>
              )}

              {currentQ.assignedSectionTitle && (
                <span
                  className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 max-w-[220px] truncate"
                  title={`القسم: ${currentQ.assignedSectionTitle}`}
                >
                  <BookOpen className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="truncate">{currentQ.assignedSectionTitle}</span>
                </span>
              )}

              {currentQ.cognitiveLevel && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  <span>{currentQ.cognitiveLevel}</span>
                </span>
              )}
            </div>

            {/* Top Quick Navigation Buttons (Immovable at Top) */}
            <div className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl p-0.5 shadow-xs">
              <button
                type="button"
                disabled={safeIndex <= 0}
                onClick={handlePrevious}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                title="السؤال السابق (سهم يمين)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="px-2 py-0.5 text-xs font-mono font-bold text-slate-300">
                سؤال {safeIndex + 1} من {totalFiltered}
              </span>
              <button
                type="button"
                disabled={safeIndex >= totalFiltered - 1}
                onClick={handleNext}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                title="السؤال التالي (سهم يسار)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Question Text (a fill_blank sentence carries its own inputs) */}
          <div>
            {currentQ.kind === "true_false" && (
              <p className="text-xs font-bold text-cyan-300 mb-1.5">هل العبارة التالية صواب أم خطأ؟</p>
            )}
            {currentQ.kind === "fill_blank" ? (
              <FillBlankSentence
                text={currentQ.question}
                blanks={currentQ.blanks || []}
                inputs={blankInputs[currentQ.originalIndex] || []}
                checked={!!checkedBlanks[currentQ.originalIndex]}
                revealed={!!revealedBlanks[currentQ.originalIndex]}
                onChange={handleBlankChange}
              />
            ) : (
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed whitespace-pre-line">
                {currentQ.question}
              </p>
            )}
          </div>

          {/* Answer area by kind: True/False, fill-blank check, essay draft, or 4 Options / Active Recall Thinking Station */}
          {currentQ.kind === "true_false" ? (
            <TrueFalseButtons
              options={currentQ.options}
              selected={selectedAnswer}
              answer={currentQ.answer}
              onSelect={handleSelectOption}
            />
          ) : currentQ.kind === "fill_blank" ? (
            hasInteracted ? null : (
              <FillBlankActions
                canCheck={(blankInputs[currentQ.originalIndex] || []).some((v) => v && v.trim())}
                onCheck={handleCheckBlanks}
                onReveal={handleRevealBlanks}
              />
            )
          ) : currentQ.kind === "essay" ? (
            <EssayDraft
              value={essayDrafts[currentQ.originalIndex] || ""}
              revealed={!!essayRevealed[currentQ.originalIndex]}
              onChange={(v) => setEssayDrafts((prev) => ({ ...prev, [currentQ.originalIndex]: v }))}
              onReveal={() => setEssayRevealed((prev) => ({ ...prev, [currentQ.originalIndex]: true }))}
            />
          ) : isOptionsHidden ? (
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-indigo-950/30 via-slate-950/70 to-slate-950/90 border border-indigo-500/30 shadow-xl text-center space-y-4 sm:space-y-5 animate-fadeIn">
              <div className="max-w-md mx-auto space-y-2.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-inner">
                  <Brain className="w-6 h-6 text-indigo-300 animate-pulse" />
                </div>
                <h4 className="text-base sm:text-lg font-black text-white">
                  محطة التفكير والاسترجاع الذاتي
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                  الخيارات محجوبة مؤقتاً لتمنح عقلك فرصة استرجاع وتحليل الإجابة أولاً دون توجيه مسبق. صُغ الفكرة في ذهنك، ثم اكشف الخيارات للمقارنة والاختيار.
                </p>
              </div>

              {/* Muted, Non-Distracting Reveal Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleRevealCurrent}
                  className="w-full sm:w-auto px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/70 text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700/80 font-normal text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer select-none active:scale-98 shadow-none"
                  title="اضغط بعد التفكير لصياغة الإجابة ومقارنتها بالخيارات (أو اضغط Space / Enter)"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>كشف الخيارات للاختيار (أ، ب، ج، د)</span>
                  <kbd className="hidden md:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-500 border border-slate-800/80">
                    Space / Enter
                  </kbd>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3 animate-fadeIn">
              {currentQ.options.map((optText, optIdx) => {
                const isThisSelected = selectedAnswer === optText;
                const isThisCorrect = optText === currentQ.answer;

                let btnStyle =
                  "bg-slate-950/70 border-slate-800 text-slate-200 hover:border-indigo-500/50 hover:bg-slate-800/60";

                if (hasInteracted) {
                  if (isThisCorrect) {
                    btnStyle =
                      "bg-emerald-950/60 border-emerald-500 text-emerald-200 font-semibold ring-1 ring-emerald-500/40";
                  } else if (isThisSelected && !isThisCorrect) {
                    btnStyle =
                      "bg-rose-950/60 border-rose-500 text-rose-200 font-semibold ring-1 ring-rose-500/40";
                  } else {
                    btnStyle = "bg-slate-950/40 border-slate-800/60 text-slate-400 opacity-60";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={hasInteracted}
                    onClick={() => handleSelectOption(optText)}
                    className={`w-full min-h-[46px] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border-2 text-right transition-all flex items-start gap-3 cursor-pointer text-sm sm:text-base leading-relaxed ${btnStyle} ${
                      hasInteracted ? "cursor-default" : ""
                    }`}
                  >
                    <span
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 mt-0.5 transition-colors ${
                        hasInteracted && isThisCorrect
                          ? "bg-emerald-600 text-white"
                          : hasInteracted && isThisSelected && !isThisCorrect
                          ? "bg-rose-600 text-white"
                          : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {OPTION_LETTERS[optIdx] || optIdx + 1}
                    </span>

                    <span className="flex-1 mt-0.5 font-normal sm:font-medium">
                      {optText}
                    </span>

                    {hasInteracted && (
                      <div className="shrink-0 mt-1">
                        {isThisCorrect && <Check className="w-5 h-5 text-emerald-400" />}
                        {isThisSelected && !isThisCorrect && (
                          <X className="w-5 h-5 text-rose-400" />
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ========================================================
              3. PERMANENT NAVIGATION DOCK (ABOVE THE ANSWER BOX)
              Placing Next/Previous buttons HERE ensures they NEVER
              shift or jump when the correct answer & explanation appear!
              ======================================================== */}
          <div className="mt-2 py-3 px-3 sm:px-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 shadow-lg flex items-center justify-between gap-3 select-none">
            {/* Right side (in RTL): Previous Button (السابق) */}
            <button
              type="button"
              disabled={safeIndex <= 0}
              onClick={handlePrevious}
              className="h-11 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-20 disabled:pointer-events-none text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shrink-0 border border-slate-700/60 active:scale-95 shadow-sm"
              title="السؤال السابق (سهم يمين)"
            >
              <ChevronRight className="w-4 h-4" />
              <span>السابق</span>
              <kbd className="hidden lg:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                →
              </kbd>
            </button>

            {/* Center: Question Progress */}
            <div className="flex items-center gap-2">
              <div className="px-3 sm:px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono font-bold flex items-center gap-2">
                <span className="text-slate-400">سؤال</span>
                <span className="text-indigo-400 font-black">{safeIndex + 1}</span>
                <span className="text-slate-600">/</span>
                <span className="text-slate-400">{totalFiltered}</span>
              </div>
            </div>

            {/* Left side (in RTL): Next Button (التالي) */}
            <button
              type="button"
              disabled={safeIndex >= totalFiltered - 1}
              onClick={handleNext}
              className="h-11 sm:h-12 px-5 sm:px-8 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-20 disabled:pointer-events-none text-white text-xs sm:text-sm font-black flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/25 shrink-0 border border-indigo-400/30 active:scale-95"
              title="السؤال التالي (سهم يسار)"
            >
              <span>التالي</span>
              <ChevronLeft className="w-4 h-4" />
              <kbd className="hidden lg:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30 text-indigo-200 border border-white/10">
                ←
              </kbd>
            </button>
          </div>

          {/* ========================================================
              4. FEEDBACK & EXPLANATION BOX (BELOW NAVIGATION BUTTONS)
              Since this is located BELOW the navigation dock, its
              appearance expands downward and NEVER moves the buttons!
              ======================================================== */}
          {hasInteracted ? (
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all animate-fadeIn ${feedback.box}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="shrink-0 mt-0.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold ${feedback.icon}`}>
                      {feedback.mark}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm leading-relaxed space-y-2 flex-1">
                    <div className="font-black text-sm sm:text-base">{feedback.title}</div>
                    {!isCorrect && (currentQ.kind === "mcq" || currentQ.kind === "true_false") && (
                      <div className="text-slate-300">
                        <span className="font-bold text-white">الإجابة الصحيحة: </span>
                        <span className="text-emerald-300 font-medium">{currentQ.answer}</span>
                      </div>
                    )}
                    {currentQ.kind === "true_false" && currentQ.correction && (
                      <div className="p-3 rounded-xl bg-slate-950/60 border border-emerald-500/25 text-slate-200">
                        <span className="font-bold text-emerald-300">تصحيح العبارة: </span>
                        <span>{currentQ.correction}</span>
                      </div>
                    )}
                    {currentQ.kind === "fill_blank" && !isCorrect && (
                      <div className="text-slate-300">
                        <span className="font-bold text-white">الإجابة: </span>
                        <span className="text-emerald-300 font-medium">
                          {(currentQ.blanks || []).map((b) => b.answer).join(" — ")}
                        </span>
                      </div>
                    )}
                    {currentQ.kind === "essay" && (
                      <>
                        <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/60 border border-emerald-500/25 text-slate-200">
                          <div className="font-bold text-emerald-300 mb-1.5">الإجابة النموذجية:</div>
                          {formatExplanationContent(currentQ.modelAnswer || currentQ.answer)}
                        </div>
                        {currentQ.keyPoints && currentQ.keyPoints.length > 0 && (
                          <EssayChecklist
                            keyPoints={currentQ.keyPoints}
                            covered={essayCovered[currentQ.originalIndex] || []}
                            onToggle={handleToggleKeyPoint}
                          />
                        )}
                      </>
                    )}
                    {(currentQ.depthExplanation || (currentQ as any).explanation) && (
                      <div className="mt-3 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-950/60 border border-indigo-500/20 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-inner">
                        <div className="flex items-center gap-2 font-bold text-indigo-300 mb-2.5 border-b border-indigo-500/20 pb-2">
                          <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span>الإجابة النموذجية والشرح والتحليل المعمق</span>
                        </div>
                        <div className="text-slate-300">
                          {formatExplanationContent(currentQ.depthExplanation || (currentQ as any).explanation)}
                        </div>
                      </div>
                    )}
                    {currentQ.misconceptionTrap && (
                      <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start gap-2 shadow-xs">
                        <span className="shrink-0 text-base leading-none mt-0.5">⚠️</span>
                        <div className="space-y-0.5">
                          <span className="font-bold text-amber-300">انتبه لمصيدة الفهم الشائع: </span>
                          <span className="text-amber-100">{currentQ.misconceptionTrap}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleResetCurrent}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer border border-slate-700 shadow-xs"
                  title="إعادة المحاولة لهذا السؤال"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">إعادة المحاولة</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-1 text-center sm:text-right">
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400/70" />
                <span>{KIND_HINTS[currentQ.kind]}</span>
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
          <p>لا توجد أسئلة تطابق تصنيف الصعوبة المختار.</p>
        </div>
      )}
    </div>
  );
}
