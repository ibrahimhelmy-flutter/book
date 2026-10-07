"use client";

import React, { useState } from "react";
import { Lesson, CalloutBox } from "@/types";
import dynamic from "next/dynamic";
import { LessonHeader, type LessonFontSize } from "./LessonHeader";
import { ThinkLikeEngineer } from "./ThinkLikeEngineer";
import { SolvedExampleAccordion } from "./SolvedExampleAccordion";
import { LessonConceptMap } from "./LessonConceptMap";
import { SectionImageViewer } from "./SectionImageViewer";
import { ComponentErrorBoundary } from "../common/ComponentErrorBoundary";
import { getDeepQuestionsForLesson } from "@/data/deep-questions";
import { getOfficialAssessmentsForLesson } from "@/data/official-assessments";
import { SIMULATORS_DATA } from "@/data/simulators";
import { countQuestionsPerSection } from "@/lib/comprehension-matcher";

// Helper for resilient chunk loading with automatic retry on network hiccup or build cache shifts
const retryDynamicImport = <T,>(fn: () => Promise<T>, retries = 2, delay = 500): Promise<T> => {
  return new Promise((resolve, reject) => {
    fn()
      .then(resolve)
      .catch((error) => {
        if (retries <= 0) {
          reject(error);
          return;
        }
        setTimeout(() => {
          retryDynamicImport(fn, retries - 1, delay * 1.5)
            .then(resolve)
            .catch(reject);
        }, delay);
      });
  });
};

const LessonOfficialAssessments = dynamic(
  () => retryDynamicImport(() => import("../quiz/LessonOfficialAssessments").then((mod) => mod.LessonOfficialAssessments)),
  { ssr: false }
);
const QuizEngine = dynamic(
  () => retryDynamicImport(() => import("../quiz/QuizEngine").then((mod) => mod.QuizEngine)),
  { ssr: false }
);
const DeepComprehensionViewer = dynamic(
  () => retryDynamicImport(() => import("../quiz/DeepComprehensionViewer").then((mod) => mod.DeepComprehensionViewer)),
  { ssr: false }
);
const EssayQuestionsViewer = dynamic(
  () => retryDynamicImport(() => import("../quiz/EssayQuestionsViewer").then((mod) => mod.EssayQuestionsViewer)),
  { ssr: false }
);
const SimulatorRenderer = dynamic(
  () => retryDynamicImport(() => import("../simulators/SimulatorRenderer").then((mod) => mod.SimulatorRenderer)),
  { ssr: false }
);
const LessonPresentationView = dynamic(
  () => retryDynamicImport(() => import("../presentation/LessonPresentationView").then((mod) => mod.LessonPresentationView)),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-bold text-white">جاري تجهيز منصة العرض التقديمي...</p>
        </div>
      </div>
    ),
  }
);
import { HelpCircle, Sparkles, Lightbulb, CheckSquare, BookOpen, AlertCircle, FileCheck, ArrowLeft, ArrowRight, PenTool, Brain, ChevronRight, ChevronDown, ChevronUp, Award, BookmarkCheck, CheckCircle, Type } from "lucide-react";
import Link from "next/link";
import { EyeComfortText, formatInlineText } from "../common/EyeComfortText";
import { getAssetPath } from "@/lib/utils";

interface Props {
  lesson: Lesson;
  nextLesson?: { id: string; title: string; number: string; chapterId: string; slug: string };
  prevLesson?: { id: string; title: string; number: string; chapterId: string; slug: string };
}

function SectionNoteButton({ note }: { note: CalloutBox }) {
  const [isOpen, setIsOpen] = useState(false);

  const getNoteBadge = () => {
    switch (note.type) {
      case "pause_and_reflect":
        return {
          icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
          btnClass: "bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 shadow-amber-950/40",
          borderClass: "border-amber-500/40",
          bgBadge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          label: "توقّف وفكّر",
        };
      case "important_note":
        return {
          icon: <AlertCircle className="w-4 h-4 text-blue-400" />,
          btnClass: "bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 border-blue-500/40 shadow-blue-950/40",
          borderClass: "border-blue-500/40",
          bgBadge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          label: "ملحوظة مهمة",
        };
      case "enrichment":
      case "pro_tip":
      case "hint":
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-400" />,
          btnClass: "bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border-purple-500/40 shadow-purple-950/40",
          borderClass: "border-purple-500/40",
          bgBadge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          label: "لمحة خارج المنهج / تلميح",
        };
    }
  };

  const badge = getNoteBadge();

  return (
    <div className="relative inline-block text-right">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-lg hover:scale-105 ${badge.btnClass}`}
        title={note.title}
        aria-label={note.title}
      >
        {badge.icon}
        <span className="text-[11px] hidden md:inline">{badge.label}</span>
      </button>

      {/* Floating Popover on Hover/Click (rendered only when open to avoid GPU layer bloat) */}
      {isOpen && (
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className={`absolute left-0 top-full mt-2 w-72 sm:w-96 max-w-[90vw] p-4 bg-slate-950 border ${badge.borderClass} rounded-2xl shadow-2xl z-50 text-right animate-fadeIn`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bgBadge}`}>
              {badge.label}
            </span>
            <span className="text-xs font-bold text-white line-clamp-1">{note.title}</span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-normal mb-2.5 whitespace-pre-line">
            {note.content}
          </p>

          {note.question && (
            <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
              <strong className="text-amber-400 block mb-1 font-bold text-[11px]">الإجابة والتحليل:</strong>
              <p className="text-slate-300 leading-relaxed text-[11px] font-normal">{note.question}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function LessonContent({ lesson, nextLesson, prevLesson }: Props) {
  const [activeTab, setActiveTab] = useState<"lesson" | "quiz">("lesson");
  const [quizSubTab, setQuizSubTab] = useState<"official" | "textbook" | "essay" | "comprehension">("official");
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);
  const [isLessonHeaderOpen, setIsLessonHeaderOpen] = useState<boolean>(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState<boolean>(false);
  const [isEngineerOpen, setIsEngineerOpen] = useState<boolean>(false);
  const [isClosureRecapOpen, setIsClosureRecapOpen] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<LessonFontSize>("normal");

  // Floating Toast for Font Size Feedback
  const [fontToast, setFontToast] = useState<{ message: string; subtext: string } | null>(null);
  const fontToastTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const showFontToast = React.useCallback((message: string, subtext: string) => {
    if (fontToastTimeoutRef.current) {
      clearTimeout(fontToastTimeoutRef.current);
    }
    setFontToast({ message, subtext });
    fontToastTimeoutRef.current = setTimeout(() => {
      setFontToast(null);
    }, 1500);
  }, []);

  // Load font size preference from localStorage on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("lesson_font_size") as LessonFontSize;
      if (saved && ["normal", "large", "xlarge", "2xlarge", "3xlarge", "4xlarge", "5xlarge"].includes(saved)) {
        setFontSize(saved);
      }
    } catch {}
  }, []);

  const handleFontSizeChange = React.useCallback((size: LessonFontSize) => {
    setFontSize(size);
    try {
      localStorage.setItem("lesson_font_size", size);
    } catch {}
    if (size === "5xlarge") {
      showFontToast("أقصى تكبير للخط: 320% 🔍", "الحد الأقصى المطلق للتكبير (خط فائق الضخامة)");
    } else if (size === "4xlarge") {
      showFontToast("حجم الخط: فائق الضخامة (280%)", "اختصار: [-] تصغير | [0] عادي");
    } else if (size === "3xlarge") {
      showFontToast("حجم الخط: عملاق (240%)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
    } else if (size === "2xlarge") {
      showFontToast("حجم الخط: ضخم (200% - ضعف الحجم)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
    } else if (size === "xlarge") {
      showFontToast("حجم الخط: كبير جداً (165%)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
    } else if (size === "large") {
      showFontToast("حجم الخط: كبير (130%)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
    } else {
      showFontToast("حجم الخط: عادي (100% الافتراضي)", "الحجم القياسي • اختصار: [+] تكبير");
    }
  }, [showFontToast]);

  const increaseFontSize = React.useCallback(() => {
    setFontSize((prev) => {
      let next: LessonFontSize = prev;
      if (prev === "normal") {
        next = "large";
        showFontToast("تم تكبير الخط: كبير (130%)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
      } else if (prev === "large") {
        next = "xlarge";
        showFontToast("تم تكبير الخط: كبير جداً (165%)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
      } else if (prev === "xlarge") {
        next = "2xlarge";
        showFontToast("تم تكبير الخط: ضخم (200% - ضعف الحجم)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
      } else if (prev === "2xlarge") {
        next = "3xlarge";
        showFontToast("تم تكبير الخط: عملاق (240%)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
      } else if (prev === "3xlarge") {
        next = "4xlarge";
        showFontToast("تم تكبير الخط: فائق الضخامة (280%)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
      } else if (prev === "4xlarge") {
        next = "5xlarge";
        showFontToast("أقصى تكبير للخط: 320% 🔍", "الحد الأقصى المطلق للتكبير (خط فائق الضخامة)");
      } else {
        showFontToast("الحد الأقصى لحجم الخط (320% أقصى تكبير)", "استخدم [-] للتصغير أو [0] للاستعادة");
      }
      try {
        localStorage.setItem("lesson_font_size", next);
      } catch {}
      return next;
    });
  }, [showFontToast]);

  const decreaseFontSize = React.useCallback(() => {
    setFontSize((prev) => {
      let next: LessonFontSize = prev;
      if (prev === "5xlarge") {
        next = "4xlarge";
        showFontToast("تم تصغير الخط: فائق الضخامة (280%)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
      } else if (prev === "4xlarge") {
        next = "3xlarge";
        showFontToast("تم تصغير الخط: عملاق (240%)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
      } else if (prev === "3xlarge") {
        next = "2xlarge";
        showFontToast("تم تصغير الخط: ضخم (200%)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
      } else if (prev === "2xlarge") {
        next = "xlarge";
        showFontToast("تم تصغير الخط: كبير جداً (165%)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
      } else if (prev === "xlarge") {
        next = "large";
        showFontToast("تم تصغير الخط: كبير (130%)", "اختصار: [+] تكبير | [-] تصغير | [0] عادي");
      } else if (prev === "large") {
        next = "normal";
        showFontToast("تم استعادة حجم الخط: عادي (100% الافتراضي)", "الحجم القياسي • اختصار: [+] تكبير");
      } else {
        showFontToast("الحجم الافتراضي للخط (100% عادي)", "استخدم [+] للتكبير");
      }
      try {
        localStorage.setItem("lesson_font_size", next);
      } catch {}
      return next;
    });
  }, [showFontToast]);


  const resetFontSize = React.useCallback(() => {
    setFontSize("normal");
    showFontToast("تم استعادة حجم الخط: عادي (الافتراضي 100%)", "الحجم القياسي • اختصار: [+] تكبير");
    try {
      localStorage.setItem("lesson_font_size", "normal");
    } catch {}
  }, [showFontToast]);

  // Global Keyboard Shortcuts for Font Size Adjustment (+, -, 0, Ctrl++, Ctrl+-, Ctrl+0)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isTyping =
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.tagName === "SELECT" ||
          (activeEl as HTMLElement).isContentEditable);

      const isZoomInKey =
        e.key === "+" ||
        e.key === "=" ||
        e.code === "NumpadAdd" ||
        e.code === "Equal";

      const isZoomOutKey =
        e.key === "-" ||
        e.key === "_" ||
        e.code === "NumpadSubtract" ||
        e.code === "Minus";

      const isResetKey =
        e.key === "0" ||
        e.code === "Digit0" ||
        e.code === "Numpad0";

      // If Ctrl / Meta / Alt is held
      if (e.ctrlKey || e.metaKey || e.altKey) {
        if (isZoomInKey) {
          e.preventDefault();
          increaseFontSize();
          return;
        }
        if (isZoomOutKey) {
          e.preventDefault();
          decreaseFontSize();
          return;
        }
        if (isResetKey) {
          e.preventDefault();
          resetFontSize();
          return;
        }
      }

      // Single key when NOT typing in an input field
      if (!isTyping && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          increaseFontSize();
        } else if (e.key === "-" || e.key === "_") {
          e.preventDefault();
          decreaseFontSize();
        } else if (e.key === "0") {
          e.preventDefault();
          resetFontSize();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (fontToastTimeoutRef.current) clearTimeout(fontToastTimeoutRef.current);
    };
  }, [increaseFontSize, decreaseFontSize, resetFontSize]);

  // Reset optional accordions on lesson switch so they remain closed by default
  React.useEffect(() => {
    setIsSimulatorOpen(false);
    setIsEngineerOpen(false);
    setIsClosureRecapOpen(false);
  }, [lesson.id]);

  // Discover all simulators belonging to this lesson from SIMULATORS_DATA
  const lessonSimulators = React.useMemo(() => {
    const byNumber = SIMULATORS_DATA.filter((s) => s.lessonNumber === lesson.number);
    if (byNumber.length > 0) return byNumber;
    if (lesson.simulatorId) {
      const byId = SIMULATORS_DATA.filter((s) => s.id === lesson.simulatorId);
      if (byId.length > 0) return byId;
    }
    return [];
  }, [lesson.number, lesson.simulatorId]);

  const [selectedSimId, setSelectedSimId] = useState<string>("");

  React.useEffect(() => {
    if (lessonSimulators.length > 0) {
      setSelectedSimId(lessonSimulators[0].id);
    }
  }, [lessonSimulators]);

  // Official Ministry assessments for this lesson
  const officialAssessments = React.useMemo(() => {
    return getOfficialAssessmentsForLesson(lesson.number || lesson.id);
  }, [lesson.number, lesson.id]);

  const officialQuestions = React.useMemo(() => {
    return officialAssessments ? officialAssessments.questions : [];
  }, [officialAssessments]);

  // Split lesson questions into objective textbook exercises and essay writing questions
  const textbookQuestions = React.useMemo(() => {
    return (lesson.questions || []).filter((q) => q.type !== "essay");
  }, [lesson.questions]);

  const essayQuestions = React.useMemo(() => {
    return (lesson.questions || []).filter((q) => q.type === "essay");
  }, [lesson.questions]);

  const comprehensionQuestions = React.useMemo(() => {
    return getDeepQuestionsForLesson(lesson);
  }, [lesson]);

  const [selectedComprehensionSectionId, setSelectedComprehensionSectionId] = useState<string | null>(null);

  const sectionQuestionsCount = React.useMemo(() => {
    return countQuestionsPerSection(comprehensionQuestions, lesson);
  }, [comprehensionQuestions, lesson]);

  const handleJumpToSectionQuestions = (sectionId: string) => {
    setSelectedComprehensionSectionId(sectionId);
    setActiveTab("quiz");
    setQuizSubTab("comprehension");
  };

  const totalQuestionsCount =
    officialQuestions.length +
    textbookQuestions.length +
    essayQuestions.length +
    comprehensionQuestions.length;

  const hasClosureContent = Boolean(
    lesson.appliedTask ||
    lesson.solvedExample ||
    lesson.mainQuestionAnswer ||
    lesson.summary ||
    lesson.challengeYourself?.reflect ||
    lesson.challengeYourself?.challenge
  );

  const closureItemsCount = [
    lesson.appliedTask ? 1 : 0,
    lesson.solvedExample ? 1 : 0,
    lesson.mainQuestionAnswer ? 1 : 0,
    lesson.summary ? 1 : 0,
    lesson.challengeYourself?.reflect ? 1 : 0,
    lesson.challengeYourself?.challenge ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  const quizSectionRef = React.useRef<HTMLDivElement>(null);

  // Automatically scroll to top for lessons or main tabs, or smart-scroll to quiz section
  React.useEffect(() => {
    if (activeTab === "quiz") {
      const timer = setTimeout(() => {
        if (quizSectionRef.current) {
          // Use window.scrollTo instead of scrollIntoView to avoid browser viewport
          // recalibration on mobile (which causes the "zoom/grow" effect)
          const rect = quizSectionRef.current.getBoundingClientRect();
          const targetTop = window.scrollY + rect.top - 72; // 72px offset for sticky header
          window.scrollTo({ top: Math.max(0, targetTop), left: 0, behavior: "smooth" });
        }
      }, 60);
      return () => clearTimeout(timer);
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  }, [lesson.id, activeTab]);

  const isQuizMode = activeTab === "quiz";

  return (
    <article className={`max-w-5xl mx-auto w-full max-w-full overflow-x-clip min-w-0 ${isQuizMode ? "px-3 sm:px-4 py-3 sm:py-8" : "px-4 py-8"}`}>
      {/* Mobile Quiz Focus Mode: Compact Bar when practicing questions */}
      {isQuizMode && (
        <div className="md:hidden mb-2.5 p-2 px-3 bg-slate-900/95 border border-slate-800 rounded-2xl flex items-center justify-between shadow-md">
          <button
            type="button"
            onClick={() => setActiveTab("lesson")}
            className="flex items-center gap-1.5 min-w-0 text-right cursor-pointer group"
            title="العودة لشرح الدرس"
          >
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white shrink-0" />
            <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-indigo-600/30 text-indigo-300 font-mono font-black shrink-0">
              {lesson.number}
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[130px] xs:max-w-[170px]">
              {lesson.title}
            </span>
          </button>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("lesson")}
              className="text-[11px] font-bold text-indigo-300 hover:text-white px-2 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/30 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>الدرس 📖</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLessonHeaderOpen((prev) => !prev)}
              className="text-[11px] font-bold text-slate-300 hover:text-white px-2 py-1 rounded-lg bg-slate-800/90 border border-slate-700/60 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{isLessonHeaderOpen ? "طي ▴" : "الأهداف ▾"}</span>
            </button>
          </div>
        </div>
      )}

      {/* Lesson Header with TTS, Bookmark, Objectives, and Quiz Toggle (Always visible on desktop; collapsible on mobile in quiz mode) */}
      <div className={isQuizMode && !isLessonHeaderOpen ? "hidden md:block" : "block"}>
        <LessonHeader
          lesson={lesson}
          onOpenPresentation={() => setIsPresentationOpen(true)}
          activeTab={activeTab}
          onToggleTab={() => setActiveTab((prev) => (prev === "lesson" ? "quiz" : "lesson"))}
          questionsCount={totalQuestionsCount}
          fontSize={fontSize}
          onFontSizeChange={handleFontSizeChange}
        />
      </div>

      {/* Fullscreen Presentation Modal View */}
      {isPresentationOpen && (
        <ComponentErrorBoundary fallbackTitle="تعذر تشغيل العرض التقديمي">
          <LessonPresentationView
            lesson={lesson}
            onExitPresentation={() => setIsPresentationOpen(false)}
          />
        </ComponentErrorBoundary>
      )}

      {/* Main Lesson View */}
      {activeTab === "lesson" && (
        <div className={`space-y-8 lesson-font-${fontSize}`} data-font-size={fontSize}>


          {/* Detailed Sections with In-Section Notes Button */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 px-1">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h2 className="text-base sm:text-lg font-bold text-white">أقسام وشرح الدرس</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-mono">
                  ({lesson.sections.length} أقسام)
                </span>
              </div>
              <span className="text-xs text-slate-500">النص المعتمد من كتاب الوزارة</span>
            </div>

            {lesson.sections.map((sec, secIdx) => {
              const sectionNotes = [
                ...(sec.notes || []),
                ...(lesson.callouts || []).filter(
                  (c) => c.sectionId === sec.id || (!c.sectionId && secIdx === 0)
                ),
              ];

              return (
                <section
                  key={sec.id}
                  id={sec.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 md:p-8 text-white space-y-4 shadow-lg relative scroll-mt-24"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        القسم {secIdx + 1} من {lesson.sections.length}
                      </span>
                      <h3
                        className={`font-bold text-white leading-snug transition-all duration-200 ${
                          fontSize === "5xlarge"
                            ? "text-4xl sm:text-5xl md:text-6xl"
                            : fontSize === "4xlarge"
                            ? "text-3xl sm:text-4xl md:text-5xl"
                            : fontSize === "3xlarge"
                            ? "text-3xl sm:text-4xl"
                            : fontSize === "2xlarge"
                            ? "text-2xl sm:text-3xl"
                            : fontSize === "xlarge"
                            ? "text-2xl sm:text-3xl"
                            : fontSize === "large"
                            ? "text-xl sm:text-2xl"
                            : "text-lg sm:text-xl"
                        }`}
                      >
                        {sec.title}
                      </h3>
                      {sec.origin === "explanation" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          <span>💡</span>
                          <span>شرح وتوضيح إثرائي</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                          <span>📘</span>
                          <span>نص كتاب الوزارة المعتمد</span>
                        </span>
                      )}
                    </div>

                    {/* Header Actions: Simple Comprehension Icon + Section Notes */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Simple Minimalist Icon Button for Section Comprehension Questions */}
                      {(sectionQuestionsCount[sec.id] || 0) > 0 && (
                        <button
                          type="button"
                          onClick={() => handleJumpToSectionQuestions(sec.id)}
                          className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 hover:text-white border border-purple-500/30 hover:border-purple-400/50 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-sm hover:scale-105 active:scale-95"
                          title={`أسئلة الفهم الخاصة بهذا القسم (${sectionQuestionsCount[sec.id]} أسئلة)`}
                          aria-label={`أسئلة الفهم الخاصة بهذا القسم (${sectionQuestionsCount[sec.id]} أسئلة)`}
                        >
                          <Brain className="w-4 h-4 text-purple-400" />
                          <span className="text-[11px] font-mono font-bold hidden sm:inline">
                            {sectionQuestionsCount[sec.id]}
                          </span>
                        </button>
                      )}

                      {sectionNotes.length > 0 && (
                        sectionNotes.map((note) => (
                          <SectionNoteButton key={note.id} note={note} />
                        ))
                      )}
                    </div>
                  </div>

                  <div
                    className={`transition-all duration-200 ${
                      fontSize === "5xlarge"
                        ? "text-3xl sm:text-4xl md:text-5xl text-white leading-loose font-bold"
                        : fontSize === "4xlarge"
                        ? "text-2xl sm:text-3xl md:text-4xl text-slate-100 leading-loose font-semibold"
                        : fontSize === "3xlarge"
                        ? "text-xl sm:text-2xl md:text-3xl text-slate-100 leading-loose font-medium"
                        : fontSize === "2xlarge"
                        ? "text-lg sm:text-xl md:text-2xl text-slate-100 leading-loose font-medium"
                        : fontSize === "xlarge"
                        ? "text-base sm:text-lg md:text-xl text-slate-100 leading-loose font-medium"
                        : fontSize === "large"
                        ? "text-base sm:text-lg md:text-xl text-slate-200 leading-loose"
                        : "text-sm sm:text-base text-slate-300 leading-relaxed"
                    }`}
                  >
                    <EyeComfortText content={sec.content} theme="dark" fontSize={fontSize} />
                  </div>

                  {/* Section Diagram / Image with Compact Size & Lightbox */}
                  {sec.image && (
                    <SectionImageViewer image={sec.image} fontSize={fontSize} />
                  )}

                  {/* Section Table if present */}
                  {sec.table && (
                    <div className="overflow-x-auto my-4 rounded-xl border border-slate-800 bg-slate-950 custom-scrollbar">
                      <table
                        className={`w-full min-w-[420px] text-right transition-all duration-200 ${
                          fontSize === "5xlarge"
                            ? "text-2xl sm:text-3xl"
                            : fontSize === "4xlarge"
                            ? "text-xl sm:text-2xl"
                            : fontSize === "3xlarge" || fontSize === "2xlarge" || fontSize === "xlarge"
                            ? "text-base sm:text-lg"
                            : fontSize === "large"
                            ? "text-sm sm:text-base"
                            : "text-xs"
                        }`}
                      >
                        <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                          <tr>
                            {sec.table.headers.map((h, i) => (
                              <th
                                key={i}
                                className={`font-semibold text-slate-200 ${
                                  fontSize === "5xlarge"
                                    ? "p-6"
                                    : fontSize === "4xlarge"
                                    ? "p-5"
                                    : fontSize === "3xlarge" || fontSize === "2xlarge" || fontSize === "xlarge"
                                    ? "p-4"
                                    : fontSize === "large"
                                    ? "p-3.5"
                                    : "p-3"
                                }`}
                              >
                                {formatInlineText(h, "dark")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {sec.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`leading-relaxed ${
                                    fontSize === "5xlarge"
                                      ? "p-6"
                                      : fontSize === "4xlarge"
                                      ? "p-5"
                                      : fontSize === "3xlarge" || fontSize === "2xlarge" || fontSize === "xlarge"
                                      ? "p-4"
                                      : fontSize === "large"
                                      ? "p-3.5"
                                      : "p-3"
                                  }`}
                                >
                                  {formatInlineText(cell, "dark")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>

                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* Interactive Lesson Schematic & Concept Map */}
          {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
            <LessonConceptMap lesson={lesson} />
          )}



          {/* Optional Enrichment Section at End of Lesson (Hidden/Collapsed by default) */}
          {(lessonSimulators.length > 0 || lesson.engineerChallenge) && (
            <div className="pt-6 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="font-bold text-slate-300">أنشطة وتطبيقات إثرائية (اختيارية)</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25 font-mono">
                    ({(lessonSimulators.length > 0 ? lessonSimulators.length : 0) + (lesson.engineerChallenge ? 1 : 0)} أنشطة)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">مغلقة افتراضياً — اضغط للاستكشاف</span>
              </div>

              {/* 1. Collapsible Interactive Simulators */}
              {lessonSimulators.length > 0 && (
                <div className="border border-slate-800 hover:border-purple-500/30 bg-slate-900/60 rounded-2xl overflow-hidden transition-all duration-200 shadow-md">
                  <button
                    type="button"
                    onClick={() => setIsSimulatorOpen((prev) => !prev)}
                    className="w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-right hover:bg-slate-800/40 transition-colors cursor-pointer"
                    aria-expanded={isSimulatorOpen}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 text-purple-400">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 text-right">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-bold text-white">المحاكيات التفاعلية المعملية ⚡</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                            ({lessonSimulators.length} محاكيات)
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25">
                            إثرائي اختياري
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {lessonSimulators.length > 1
                            ? `يتوفر لهذا الدرس ${lessonSimulators.length} محاكيات تفاعلية لتجربة المفاهيم عملياً`
                            : "محاكاة تفاعلية لتجربة المفاهيم عملياً (غير مطلوب للامتحان)"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs shrink-0">
                      <span className="hidden sm:inline font-medium">
                        {isSimulatorOpen ? "إخفاء المحاكيات" : `فتح المحاكيات (${lessonSimulators.length})`}
                      </span>
                      {isSimulatorOpen ? (
                        <ChevronUp className="w-5 h-5 text-purple-400 transition-transform" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 transition-transform" />
                      )}
                    </div>
                  </button>

                  {isSimulatorOpen && (
                    <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/70 animate-fadeIn">
                      {/* Tabs switcher if lesson has multiple simulators */}
                      {lessonSimulators.length > 1 && (
                        <div className="flex flex-wrap gap-2 mb-6 p-2 bg-slate-900 border border-slate-800 rounded-2xl">
                          {lessonSimulators.map((sim, idx) => {
                            const isSelected = (selectedSimId || lessonSimulators[0].id) === sim.id;
                            return (
                              <button
                                key={sim.id}
                                type="button"
                                onClick={() => setSelectedSimId(sim.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                                  isSelected
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/40"
                                    : "bg-slate-950/60 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800"
                                }`}
                              >
                                <span className="font-mono text-[10px] opacity-75">#{idx + 1}</span>
                                <span>{sim.title.replace(/^\d+\.\s*/, "")}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <ComponentErrorBoundary fallbackTitle="تعذر تشغيل المحاكي التفاعلي">
                        <SimulatorRenderer simulatorId={selectedSimId || lessonSimulators[0].id} />
                      </ComponentErrorBoundary>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Collapsible Think Like an Engineer */}
              {lesson.engineerChallenge && (
                <div className="border border-slate-800 hover:border-amber-500/30 bg-slate-900/60 rounded-2xl overflow-hidden transition-all duration-200 shadow-md">
                  <button
                    type="button"
                    onClick={() => setIsEngineerOpen((prev) => !prev)}
                    className="w-full p-4 sm:p-4.5 flex items-center justify-between gap-3 text-right hover:bg-slate-800/40 transition-colors cursor-pointer"
                    aria-expanded={isEngineerOpen}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                        <Lightbulb className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 text-right">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm sm:text-base font-bold text-white">فكر كمهندس ⚙️ (التحدي الهندسي)</span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                            إثرائي اختياري
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                          {lesson.engineerChallenge.title || "تطبيق التفكير الهندسي وحل المشكلات"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs shrink-0">
                      <span className="hidden sm:inline font-medium">
                        {isEngineerOpen ? "إخفاء التحدي" : "فتح التحدي"}
                      </span>
                      {isEngineerOpen ? (
                        <ChevronUp className="w-5 h-5 text-amber-400 transition-transform" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400 transition-transform" />
                      )}
                    </div>
                  </button>

                  {isEngineerOpen && (
                    <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/70 animate-fadeIn">
                      <ThinkLikeEngineer challenge={lesson.engineerChallenge} />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Lesson Closure, Applied Practice & Solved Examples (Consolidated, Collapsed by Default) */}
          {hasClosureContent && (
            <div className="pt-4 border-t border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs px-1">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="font-bold text-slate-300">خلاصة وتطبيقات الدرس والحلول النموذجية</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 font-mono">
                    ({closureItemsCount} أقسام)
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">مغلق افتراضياً — اضغط للاستعراض</span>
              </div>

              <div className="border border-slate-800 hover:border-indigo-500/40 bg-slate-900/60 rounded-3xl overflow-hidden transition-all duration-200 shadow-xl">
                <button
                  type="button"
                  onClick={() => setIsClosureRecapOpen((prev) => !prev)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-right hover:bg-slate-800/40 transition-colors cursor-pointer"
                  aria-expanded={isClosureRecapOpen}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center shrink-0 text-indigo-400">
                      <BookmarkCheck className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 text-right">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-white">
                          خلاصة الدرس، الأنشطة التطبيقية والأمثلة المحلولة 📌
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                          ({closureItemsCount} أقسام)
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                          مغلق افتراضياً
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                        طبّق ما تعلمته • التدريب والحل النموذجي • مثال محلول من الكتاب • إجابة السؤال الرئيسي • خلاصة الدرس • تأمل وتحدّ
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs shrink-0">
                    <span className="hidden sm:inline font-medium">
                      {isClosureRecapOpen ? "إخفاء القسم" : `عرض الأقسام (${closureItemsCount})`}
                    </span>
                    {isClosureRecapOpen ? (
                      <ChevronUp className="w-5 h-5 text-indigo-400 transition-transform" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 transition-transform" />
                    )}
                  </div>
                </button>

                {isClosureRecapOpen && (
                  <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-950/80 animate-fadeIn space-y-6">
                    {/* 1. Applied Task (طبّق ما تعلمته) */}
                    {lesson.appliedTask && (
                      <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-5 sm:p-6 text-white shadow-lg space-y-4">
                        <div className="flex items-center justify-between gap-2 flex-wrap border-b border-slate-800/80 pb-3">
                          <div className="flex items-center gap-2.5 font-bold text-sm text-indigo-400">
                            <FileCheck className="w-5 h-5 text-indigo-400" />
                            <span>{lesson.appliedTask.title || "طبّق ما تعلمته"}</span>
                          </div>
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                            تطبيق عملي
                          </span>
                        </div>

                        {lesson.appliedTask.scenario && (
                          <div
                            className={`p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 leading-relaxed transition-all duration-200 ${
                              fontSize === "5xlarge"
                                ? "text-2xl sm:text-3xl text-slate-100 font-semibold"
                                : fontSize === "4xlarge"
                                ? "text-xl sm:text-2xl text-slate-100 font-medium"
                                : fontSize === "3xlarge" || fontSize === "2xlarge" || fontSize === "xlarge"
                                ? "text-base sm:text-lg text-slate-100 font-medium"
                                : fontSize === "large"
                                ? "text-sm sm:text-base text-slate-200"
                                : "text-xs text-slate-300"
                            }`}
                          >
                            <span className="font-bold text-indigo-400 ml-1">السيناريو:</span>
                            {lesson.appliedTask.scenario}
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <span
                            className={`font-bold text-slate-300 block transition-all duration-200 ${
                              fontSize === "5xlarge"
                                ? "text-2xl"
                                : fontSize === "4xlarge"
                                ? "text-xl"
                                : fontSize === "3xlarge" || fontSize === "2xlarge" || fontSize === "xlarge"
                                ? "text-base"
                                : fontSize === "large"
                                ? "text-sm"
                                : "text-xs"
                            }`}
                          >
                            التدريب المطلوب:
                          </span>
                          <p
                            className={`font-semibold text-slate-200 leading-relaxed transition-all duration-200 ${
                              fontSize === "5xlarge"
                                ? "text-3xl sm:text-4xl font-black"
                                : fontSize === "4xlarge"
                                ? "text-2xl sm:text-3xl font-black"
                                : fontSize === "3xlarge"
                                ? "text-xl sm:text-2xl font-black"
                                : fontSize === "2xlarge"
                                ? "text-lg sm:text-xl font-bold"
                                : fontSize === "xlarge"
                                ? "text-lg sm:text-xl font-bold"
                                : fontSize === "large"
                                ? "text-base sm:text-lg"
                                : "text-xs sm:text-sm"
                            }`}
                          >
                            {lesson.appliedTask.prompt}
                          </p>
                        </div>

                        {lesson.appliedTask.sampleAnswer && (
                          <div
                            className={`p-4 bg-emerald-950/25 rounded-xl border border-emerald-500/30 leading-relaxed text-slate-300 shadow-inner transition-all duration-200 ${
                              fontSize === "5xlarge"
                                ? "text-2xl sm:text-3xl text-slate-100"
                                : fontSize === "4xlarge"
                                ? "text-xl sm:text-2xl text-slate-100"
                                : fontSize === "3xlarge" || fontSize === "2xlarge" || fontSize === "xlarge"
                                ? "text-base sm:text-lg text-slate-100"
                                : fontSize === "large"
                                ? "text-sm sm:text-base text-slate-200"
                                : "text-xs text-slate-300"
                            }`}
                          >
                            <strong className="text-emerald-400 flex items-center gap-1.5 font-bold mb-1.5">
                              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                              <span>الحل النموذجي (نموذج الإجابة المقترحة):</span>
                            </strong>
                            <p className="text-slate-300 leading-relaxed">{lesson.appliedTask.sampleAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. Solved Examples (مثال محلول من الكتاب المدرسي / التدريب والحل النموذجي) */}
                    {lesson.solvedExample && (
                      <div className="rounded-2xl overflow-hidden">
                        <SolvedExampleAccordion example={lesson.solvedExample} fontSize={fontSize} />
                      </div>
                    )}

                    {/* 3. Main Question Official Answer (إجابة السؤال الرئيسي المعتمدة) */}
                    {lesson.mainQuestionAnswer && (
                      <div className="bg-slate-900 border border-indigo-500/25 rounded-2xl p-5 sm:p-6 text-white space-y-3 shadow-md">
                        <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                          <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0" />
                          <span>إجابة السؤال الرئيسي المعتمدة:</span>
                        </div>
                        {lesson.keyQuestion && (
                          <div
                            className={`p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl leading-relaxed transition-all duration-200 ${
                              fontSize === "5xlarge"
                                ? "text-2xl sm:text-3xl text-amber-50 font-semibold"
                                : fontSize === "4xlarge"
                                ? "text-xl sm:text-2xl text-amber-50 font-medium"
                                : fontSize === "3xlarge" || fontSize === "2xlarge" || fontSize === "xlarge"
                                ? "text-base sm:text-lg text-amber-50 font-medium"
                                : fontSize === "large"
                                ? "text-sm sm:text-base text-amber-100"
                                : "text-xs text-amber-200"
                            }`}
                          >
                            <span className="font-bold text-amber-400 ml-1">السؤال الرئيسي:</span>
                            <span>{lesson.keyQuestion}</span>
                          </div>
                        )}
                        <p
                          className={`leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800 transition-all duration-200 ${
                            fontSize === "5xlarge"
                              ? "text-3xl sm:text-4xl md:text-5xl text-white leading-loose font-bold"
                              : fontSize === "4xlarge"
                              ? "text-2xl sm:text-3xl md:text-4xl text-slate-100 leading-loose font-semibold"
                              : fontSize === "3xlarge"
                              ? "text-xl sm:text-2xl md:text-3xl text-slate-100 leading-loose font-semibold"
                              : fontSize === "2xlarge"
                              ? "text-lg sm:text-xl md:text-2xl text-slate-100 leading-loose font-medium"
                              : fontSize === "xlarge"
                              ? "text-lg sm:text-xl md:text-2xl text-slate-100 leading-loose font-medium"
                              : fontSize === "large"
                              ? "text-base sm:text-lg text-slate-200 leading-loose"
                              : "text-xs sm:text-sm text-slate-300"
                          }`}
                        >
                          {lesson.mainQuestionAnswer}
                        </p>
                      </div>
                    )}

                    {/* 4. Lesson Summary & Flashcard Takeaway (⭐ خلاصة وتذكرة الدرس) */}
                    {lesson.summary && (
                      <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-5 sm:p-6 text-white shadow-md space-y-3">
                        <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-amber-400">
                          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
                          <span>⭐ خلاصة وتذكرة الدرس:</span>
                        </div>
                        {Array.isArray(lesson.summary) ? (
                          <ul
                            className={`space-y-2.5 transition-all duration-200 ${
                              fontSize === "5xlarge"
                                ? "text-3xl sm:text-4xl text-slate-100 leading-loose font-bold"
                                : fontSize === "4xlarge"
                                ? "text-2xl sm:text-3xl text-slate-100 leading-loose font-semibold"
                                : fontSize === "3xlarge"
                                ? "text-xl sm:text-2xl text-slate-100 leading-loose font-semibold"
                                : fontSize === "2xlarge"
                                ? "text-lg sm:text-xl text-slate-100 leading-loose font-medium"
                                : fontSize === "xlarge"
                                ? "text-lg sm:text-xl text-slate-100 leading-loose font-medium"
                                : fontSize === "large"
                                ? "text-base sm:text-lg text-slate-200 leading-loose"
                                : "text-xs sm:text-sm text-slate-300"
                            }`}
                          >
                            {lesson.summary.map((sumItem, i) => (
                              <li key={i} className="flex items-start gap-2.5 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                                <span className="text-amber-400 font-bold text-base leading-none">•</span>
                                <span className="leading-relaxed">{sumItem}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p
                            className={`leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800 transition-all duration-200 ${
                              fontSize === "5xlarge"
                                ? "text-3xl sm:text-4xl text-slate-100 leading-loose font-bold"
                                : fontSize === "4xlarge"
                                ? "text-2xl sm:text-3xl text-slate-100 leading-loose font-semibold"
                                : fontSize === "3xlarge"
                                ? "text-xl sm:text-2xl text-slate-100 leading-loose font-semibold"
                                : fontSize === "2xlarge"
                                ? "text-lg sm:text-xl text-slate-100 leading-loose font-medium"
                                : fontSize === "xlarge"
                                ? "text-lg sm:text-xl text-slate-100 leading-loose font-medium"
                                : fontSize === "large"
                                ? "text-base sm:text-lg text-slate-200 leading-loose"
                                : "text-xs sm:text-sm text-slate-300"
                            }`}
                          >
                            {lesson.summary}
                          </p>
                        )}
                      </div>
                    )}

                    {/* 5 & 6. Challenge Yourself (⭐ تأمل ذاتي & ⚡ تحدّ نفسك) */}
                    {lesson.challengeYourself && (lesson.challengeYourself.reflect || lesson.challengeYourself.challenge) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lesson.challengeYourself.reflect && (
                          <div className="p-5 bg-slate-900 border border-purple-500/30 rounded-2xl shadow-md space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                              <Lightbulb className="w-4 h-4 text-purple-400 shrink-0" />
                              <span>⭐ تأمل ذاتي:</span>
                            </div>
                            <p
                              className={`leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 transition-all duration-200 ${
                                fontSize === "5xlarge"
                                  ? "text-2xl sm:text-3xl text-slate-100 leading-loose font-semibold"
                                  : fontSize === "4xlarge"
                                  ? "text-xl sm:text-2xl text-slate-100 leading-loose font-medium"
                                  : fontSize === "3xlarge" || fontSize === "2xlarge" || fontSize === "xlarge"
                                  ? "text-base sm:text-lg text-slate-100 leading-loose font-medium"
                                  : fontSize === "large"
                                  ? "text-sm sm:text-base text-slate-200 leading-loose"
                                  : "text-xs sm:text-sm text-slate-300"
                              }`}
                            >
                              {lesson.challengeYourself.reflect}
                            </p>
                          </div>
                        )}
                        {lesson.challengeYourself.challenge && (
                          <div className="p-5 bg-slate-900 border border-pink-500/30 rounded-2xl shadow-md space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-pink-400">
                              <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                              <span>⚡ تحدّ نفسك:</span>
                            </div>
                            <p
                              className={`leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 transition-all duration-200 ${
                                fontSize === "5xlarge"
                                  ? "text-2xl sm:text-3xl text-slate-100 leading-loose font-semibold"
                                  : fontSize === "4xlarge"
                                  ? "text-xl sm:text-2xl text-slate-100 leading-loose font-medium"
                                  : fontSize === "3xlarge" || fontSize === "2xlarge" || fontSize === "xlarge"
                                  ? "text-base sm:text-lg text-slate-100 leading-loose font-medium"
                                  : fontSize === "large"
                                  ? "text-sm sm:text-base text-slate-200 leading-loose"
                                  : "text-xs sm:text-sm text-slate-300"
                              }`}
                            >
                              {lesson.challengeYourself.challenge}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom of Lesson: Practice, Essay & Comprehension Hub Callout */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <CheckSquare className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-white">
                    جاهز للتدريب واختبار فهمك للدرس؟ 📝
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    اختر القسم الذي ترغب بالتدرب عليه مباشرة (3 أقسام منظمة):
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {officialQuestions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("quiz");
                    setQuizSubTab("official");
                  }}
                  className="p-3.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 text-amber-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Award className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>التقييمات الرسمية ({officialQuestions.length}) 🏛️</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveTab("quiz");
                  setQuizSubTab("textbook");
                }}
                className="p-3.5 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/30 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>أسئلة من الكتاب ({textbookQuestions.length}) 📘</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("quiz");
                  setQuizSubTab("essay");
                }}
                className="p-3.5 rounded-xl bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/30 text-blue-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <PenTool className="w-4 h-4 text-blue-400 shrink-0" />
                <span>أسئلة مقالية ({essayQuestions.length}) ✍️</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab("quiz");
                  setQuizSubTab("comprehension");
                }}
                className="p-3.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/30 text-purple-200 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <Brain className="w-4 h-4 text-purple-400 shrink-0" />
                <span>أسئلة الفهم ({comprehensionQuestions.length}) 🧠</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone Quiz & Exercise Hub (Enhanced: Exactly 4 Clear Tabs) */}
      {activeTab === "quiz" && (
        <div ref={quizSectionRef} className="space-y-4 sm:space-y-6 mobile-quiz-scroll-anchor">
          {/* Quick Return to Lesson Bar */}
          <div className="flex items-center justify-between gap-3 bg-slate-900/90 border border-slate-800/80 rounded-2xl px-4 py-2.5 shadow-md">
            <button
              type="button"
              onClick={() => setActiveTab("lesson")}
              className="flex items-center gap-2 text-xs sm:text-sm font-bold text-indigo-300 hover:text-white transition-colors cursor-pointer group"
            >
              <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>العودة إلى شرح الدرس 📖</span>
            </button>
            <span className="text-xs text-slate-400 font-medium">
              بنك الأسئلة والتمارين ({totalQuestionsCount})
            </span>
          </div>

          {/* Exactly 4 Clear Tabs Switcher: Sleek Horizontal Segmented Control */}
          <div
            role="tablist"
            aria-label="أقسام الأسئلة والتمارين"
            className="h-11 sm:h-12 p-1 bg-slate-900/95 border border-slate-800 rounded-2xl flex items-center gap-1 sm:gap-1.5 shadow-lg overflow-x-auto"
          >
            {/* 1. التقييمات الرسمية */}
            <button
              type="button"
              role="tab"
              aria-selected={quizSubTab === "official"}
              aria-current={quizSubTab === "official" ? "page" : undefined}
              onClick={() => setQuizSubTab("official")}
              className={`h-full min-w-0 flex-1 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                quizSubTab === "official"
                  ? "bg-amber-600 text-white shadow-md shadow-amber-600/30 font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 shrink-0" />
              <span className="truncate">التقييمات الرسمية ({officialQuestions.length})</span>
            </button>

            {/* 2. أسئلة من الكتاب */}
            <button
              type="button"
              role="tab"
              aria-selected={quizSubTab === "textbook"}
              aria-current={quizSubTab === "textbook" ? "page" : undefined}
              onClick={() => setQuizSubTab("textbook")}
              className={`h-full min-w-0 flex-1 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                quizSubTab === "textbook"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
              <span className="truncate">كتاب ({textbookQuestions.length})</span>
            </button>

            {/* 3. أسئلة مقالية محتاجة كتابة */}
            <button
              type="button"
              role="tab"
              aria-selected={quizSubTab === "essay"}
              aria-current={quizSubTab === "essay" ? "page" : undefined}
              onClick={() => setQuizSubTab("essay")}
              className={`h-full min-w-0 flex-1 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                quizSubTab === "essay"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-300 shrink-0" />
              <span className="truncate">مقالي ({essayQuestions.length})</span>
            </button>

            {/* 4. أسئلة الفهم */}
            <button
              type="button"
              role="tab"
              aria-selected={quizSubTab === "comprehension"}
              aria-current={quizSubTab === "comprehension" ? "page" : undefined}
              onClick={() => setQuizSubTab("comprehension")}
              className={`h-full min-w-0 flex-1 px-1.5 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1 sm:gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                quizSubTab === "comprehension"
                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/80"
              }`}
            >
              <Brain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-300 shrink-0" />
              <span className="truncate">فهم ({comprehensionQuestions.length})</span>
            </button>
          </div>

          {/* Tab 0 Content: التقييمات الرسمية للوزارة */}
          {quizSubTab === "official" && (
            <ComponentErrorBoundary fallbackTitle="تعذر تشغيل تقييمات الوزارة الرسمية">
              <LessonOfficialAssessments
                lesson={lesson}
                assessments={officialAssessments}
              />
            </ComponentErrorBoundary>
          )}

          {/* Tab 1 Content: أسئلة من الكتاب */}
          {quizSubTab === "textbook" && (
            <ComponentErrorBoundary fallbackTitle="تعذر تشغيل تمارين واختبار الدرس">
              <QuizEngine
                lessonId={lesson.id}
                questions={textbookQuestions}
                title="أسئلة وتمارين الكتاب المدرسي 📘"
                subtitle="الأسئلة الموضوعية الرسمية الواردة بالكتاب (اختيار من متعدد، صواب وخطأ، أكمل الفراغ) مع التصحيح الفوري"
              />
            </ComponentErrorBoundary>
          )}

          {/* Tab 2 Content: أسئلة مقالية محتاجة كتابة */}
          {quizSubTab === "essay" && (
            <ComponentErrorBoundary fallbackTitle="تعذر تشغيل الأسئلة المقالية">
              <EssayQuestionsViewer
                lessonId={lesson.id}
                questions={essayQuestions}
              />
            </ComponentErrorBoundary>
          )}

          {/* Tab 3 Content: أسئلة الفهم */}
          {quizSubTab === "comprehension" && (
            <ComponentErrorBoundary fallbackTitle="تعذر تشغيل أسئلة الفهم المعمقة">
              <DeepComprehensionViewer
                lesson={lesson}
                targetSectionId={selectedComprehensionSectionId}
                onClearTargetSection={() => setSelectedComprehensionSectionId(null)}
              />
            </ComponentErrorBoundary>
          )}
        </div>
      )}

      {/* Bottom Navigation between Lessons */}
      <footer className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mt-12 pt-6 border-t border-slate-800">
        {prevLesson ? (
          <Link
            href={`/chapters/${prevLesson.chapterId}/${prevLesson.slug}`}
            className="flex-1 p-3.5 sm:p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-right transition-all flex items-center gap-3 group"
          >
            <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform shrink-0" />
            <div className="min-w-0">
              <span className="text-[11px] text-slate-500 block">الدرس السابق ({prevLesson.number})</span>
              <span className="text-xs sm:text-sm font-bold text-white truncate block">{prevLesson.title}</span>
            </div>
          </Link>
        ) : (
          <div className="hidden sm:block flex-1" />
        )}

        {nextLesson ? (
          <Link
            href={`/chapters/${nextLesson.chapterId}/${nextLesson.slug}`}
            className="flex-1 p-3.5 sm:p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition-all flex items-center justify-end gap-3 group"
          >
            <div className="min-w-0 text-right sm:text-left">
              <span className="text-[11px] text-slate-500 block">الدرس التالي ({nextLesson.number})</span>
              <span className="text-xs sm:text-sm font-bold text-white truncate block">{nextLesson.title}</span>
            </div>
            <ArrowLeft className="w-5 h-5 text-indigo-400 group-hover:-translate-x-1 transition-transform shrink-0" />
          </Link>
        ) : (
          <div className="hidden sm:block flex-1" />
        )}
      </footer>

      {/* Floating Toast for Font Size Feedback */}
      {fontToast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl backdrop-blur-md flex items-center gap-3 animate-fadeIn text-white text-xs sm:text-sm font-bold pointer-events-none transition-all duration-200"
        >
          <div className="w-7 h-7 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
            <Type className="w-4 h-4" />
          </div>
          <div className="flex flex-col text-right">
            <span className="text-slate-100 font-extrabold">{fontToast.message}</span>
            <span className="text-[11px] text-slate-400 font-normal">{fontToast.subtext}</span>
          </div>
        </div>
      )}
    </article>
  );
}
