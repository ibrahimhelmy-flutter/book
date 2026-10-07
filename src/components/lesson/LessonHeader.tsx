"use client";

import React, { useState, useEffect } from "react";
import { Lesson } from "@/types";
import Link from "next/link";
import { Bookmark, CheckCircle, Volume2, VolumeX, Users, Presentation, CheckSquare, BookOpen, Compass, MoreVertical, Type, Plus, Minus } from "lucide-react";
import { toggleBookmark, toggleLessonComplete, getStoredProgress } from "@/lib/storage";

export type LessonFontSize = "normal" | "large" | "xlarge" | "2xlarge" | "3xlarge" | "4xlarge" | "5xlarge";

interface Props {
  lesson: Lesson;
  onOpenPresentation?: () => void;
  activeTab?: "lesson" | "quiz";
  onToggleTab?: () => void;
  questionsCount?: number;
  fontSize?: LessonFontSize;
  onFontSizeChange?: (size: LessonFontSize) => void;
}

export function LessonHeader({
  lesson,
  onOpenPresentation,
  activeTab = "lesson",
  onToggleTab,
  questionsCount,
  fontSize = "normal",
  onFontSizeChange,
}: Props) {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState<boolean>(false);
  const actionsMenuRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target as Node)) {
        setIsActionsMenuOpen(false);
      }
    }
    if (isActionsMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActionsMenuOpen]);

  useEffect(() => {
    setIsActionsMenuOpen(false);
  }, [lesson.id]);

  useEffect(() => {
    const p = getStoredProgress();
    setIsBookmarked(p.bookmarks.includes(lesson.id));
    setIsCompleted(p.completedLessons.includes(lesson.id));
  }, [lesson.id]);

  const handleBookmarkToggle = () => {
    const updated = toggleBookmark(lesson.id);
    setIsBookmarked(updated.bookmarks.includes(lesson.id));
  };

  const handleCompleteToggle = () => {
    const updated = toggleLessonComplete(lesson.id);
    setIsCompleted(updated.completedLessons.includes(lesson.id));
  };

  const handleTTSAudio = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      return;
    }

    try {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        window.speechSynthesis.cancel();
        const textToRead = `${lesson.title}. الفكرة الأساسية: ${lesson.coreIdea}. السؤال الرئيسي: ${lesson.keyQuestion}.`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = "ar-SA";
        utterance.rate = 0.9;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    } catch {
      setIsPlayingAudio(false);
    }
  };

  const [showObjectives, setShowObjectives] = useState<boolean>(false);

  return (
    <header className="bg-slate-900 border border-slate-800/80 sm:bg-slate-900/80 sm:backdrop-blur-md rounded-2xl p-5 sm:p-7 text-white shadow-xl mb-6">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4 mb-5">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-indigo-500/15 text-indigo-300 font-bold rounded-md border border-indigo-500/30">
            الدرس {lesson.number}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-medium">الفصل {lesson.chapterNumber}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono text-[11px]">ص {lesson.pageRange}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Thought Sequence / Storyline Link */}
          <Link
            href={`/chapters/${lesson.chapterId || "chapter-2"}/${lesson.slug}/storyline`}
            className="px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/60 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm shadow-purple-950/40"
            title="تسلسل أفكار الدرس: الرواية الهندسية الواقعية خطوة بخطوة"
          >
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>تسلسل الأفكار 🧭</span>
          </Link>

          {/* Exercises & Practice Toggle Button */}
          {onToggleTab && (
            <button
              type="button"
              onClick={onToggleTab}
              className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                activeTab === "quiz"
                  ? "bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white shadow-indigo-600/20"
                  : "bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-emerald-600/20"
              }`}
              title={activeTab === "quiz" ? "العودة لشرح الدرس" : "الانتقال إلى تمارين وأسئلة الدرس"}
            >
              {activeTab === "quiz" ? (
                <>
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>شرح الدرس 📖</span>
                </>
              ) : (
                <>
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>تمارين وأسئلة {questionsCount ? `(${questionsCount})` : ""} 📝</span>
                </>
              )}
            </button>
          )}

          {/* Optional Compact Presentation Launcher */}
          {onOpenPresentation && (
            <button
              type="button"
              onClick={onOpenPresentation}
              className="p-1.5 px-2 rounded-lg border border-blue-500/40 bg-blue-950/30 hover:bg-blue-900/50 text-blue-300 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
              title="بدء العرض التقديمي (شرائح البروجيكتور)"
            >
              <Presentation className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">عرض تقديمي</span>
            </button>
          )}

          {/* Single Icon Actions Menu (استماع، حفظ، إكمال، نشاط تعاوني) */}
          <div className="relative" ref={actionsMenuRef}>
            <button
              type="button"
              onClick={() => setIsActionsMenuOpen((prev) => !prev)}
              className={`relative p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center shadow-sm ${
                isActionsMenuOpen
                  ? "bg-indigo-600 border-indigo-500 text-white ring-2 ring-indigo-500/30 shadow-indigo-600/20"
                  : isPlayingAudio
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse"
                  : isCompleted
                  ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                  : isBookmarked
                  ? "bg-purple-950/50 border-purple-500/40 text-purple-300"
                  : "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
              }`}
              title="أدوات وإجراءات الدرس (استماع، حفظ، إكمال، نشاط تعاوني)"
              aria-label="أدوات الدرس"
              aria-expanded={isActionsMenuOpen}
            >
              <MoreVertical className="w-4 h-4" />
              {(isPlayingAudio || isCompleted || isBookmarked) && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  {isPlayingAudio ? (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  ) : null}
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                      isPlayingAudio
                        ? "bg-amber-500"
                        : isCompleted
                        ? "bg-emerald-500"
                        : "bg-purple-500"
                    }`}
                  />
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            {isActionsMenuOpen && (
              <div className="absolute left-0 top-full mt-2 w-72 sm:w-80 p-3 bg-slate-950/95 border border-slate-800 backdrop-blur-md rounded-2xl shadow-2xl z-50 text-right space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 px-1 text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span>أدوات وإجراءات الدرس</span>
                  </span>
                  <span className="text-[10px] text-slate-500">إجراءات سريعة</span>
                </div>

                {/* Font Size Zoom Controller with 7 Shortcuts */}
                <div className="p-2.5 bg-slate-900/90 border border-slate-800/90 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300 px-0.5">
                    <div className="flex items-center gap-1.5 text-indigo-400">
                      <Type className="w-4 h-4 shrink-0" />
                      <span className="text-slate-200 font-bold">حجم خط الدرس</span>
                      <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-flex items-center gap-1">
                        <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]" title="اختصار تكبير الخط">+</kbd>
                        <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]" title="اختصار تصغير الخط">-</kbd>
                        <kbd className="px-1 py-0.2 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]" title="اختصار الحجم الافتراضي">0</kbd>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-black border border-indigo-500/30">
                        {fontSize === "normal" && "100%"}
                        {fontSize === "large" && "130%"}
                        {fontSize === "xlarge" && "165%"}
                        {fontSize === "2xlarge" && "200%"}
                        {fontSize === "3xlarge" && "240%"}
                        {fontSize === "4xlarge" && "280%"}
                        {fontSize === "5xlarge" && "320%"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (fontSize === "5xlarge") onFontSizeChange?.("4xlarge");
                          else if (fontSize === "4xlarge") onFontSizeChange?.("3xlarge");
                          else if (fontSize === "3xlarge") onFontSizeChange?.("2xlarge");
                          else if (fontSize === "2xlarge") onFontSizeChange?.("xlarge");
                          else if (fontSize === "xlarge") onFontSizeChange?.("large");
                          else if (fontSize === "large") onFontSizeChange?.("normal");
                        }}
                        disabled={fontSize === "normal"}
                        className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                        title="تصغير الخط (اختصار: - أو Ctrl + -)"
                        aria-label="تصغير الخط (اختصار: - أو Ctrl + -)"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (fontSize === "normal") onFontSizeChange?.("large");
                          else if (fontSize === "large") onFontSizeChange?.("xlarge");
                          else if (fontSize === "xlarge") onFontSizeChange?.("2xlarge");
                          else if (fontSize === "2xlarge") onFontSizeChange?.("3xlarge");
                          else if (fontSize === "3xlarge") onFontSizeChange?.("4xlarge");
                          else if (fontSize === "4xlarge") onFontSizeChange?.("5xlarge");
                        }}
                        disabled={fontSize === "5xlarge"}
                        className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-200 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer"
                        title="تكبير الخط (اختصار: + أو Ctrl + +)"
                        aria-label="تكبير الخط (اختصار: + أو Ctrl + +)"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* 7 Presets: Row 1 (Standard to Double) & Row 2 (Huge to Maximum) */}
                  <div className="space-y-1 p-1 bg-slate-950 rounded-lg border border-slate-800/80">
                    <div className="grid grid-cols-4 gap-1">
                      <button
                        type="button"
                        onClick={() => onFontSizeChange?.("normal")}
                        className={`py-1.5 px-0.5 rounded-md text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          fontSize === "normal"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                        title="حجم الخط الافتراضي (عادي 100%)"
                      >
                        <span className="text-[11px] font-bold">A</span>
                        <span className="text-[9px] truncate">عادي</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onFontSizeChange?.("large")}
                        className={`py-1.5 px-0.5 rounded-md text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          fontSize === "large"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                        title="حجم خط كبير (130%)"
                      >
                        <span className="text-xs font-bold">A</span>
                        <span className="text-[9px] truncate">كبير</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onFontSizeChange?.("xlarge")}
                        className={`py-1.5 px-0.5 rounded-md text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          fontSize === "xlarge"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                        title="حجم خط كبير جداً (165%)"
                      >
                        <span className="text-sm font-bold">A</span>
                        <span className="text-[9px] truncate">كبير جداً</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onFontSizeChange?.("2xlarge")}
                        className={`py-1.5 px-0.5 rounded-md text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          fontSize === "2xlarge"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                        title="حجم خط ضخم (200% - ضعف الحجم)"
                      >
                        <span className="text-base font-black">A</span>
                        <span className="text-[9px] truncate">ضخم (2x)</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-0.5 border-t border-slate-850">
                      <button
                        type="button"
                        onClick={() => onFontSizeChange?.("3xlarge")}
                        className={`py-1.5 px-0.5 rounded-md text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          fontSize === "3xlarge"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                        title="حجم خط عملاق (240%)"
                      >
                        <span className="text-lg font-black">A</span>
                        <span className="text-[9px] truncate">عملاق</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onFontSizeChange?.("4xlarge")}
                        className={`py-1.5 px-0.5 rounded-md text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          fontSize === "4xlarge"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                        title="حجم خط فائق الضخامة (280%)"
                      >
                        <span className="text-xl font-black">A</span>
                        <span className="text-[9px] truncate">فائق</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onFontSizeChange?.("5xlarge")}
                        className={`py-1.5 px-0.5 rounded-md text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                          fontSize === "5xlarge"
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                        }`}
                        title="أقصى تكبير ممكن (320%) 🔍"
                      >
                        <span className="text-2xl font-black leading-none">A</span>
                        <span className="text-[9px] truncate">أقصى تكبير</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 1. استماع (TTS) */}
                <button
                  type="button"
                  onClick={handleTTSAudio}
                  className={`w-full p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-semibold ${
                    isPlayingAudio
                      ? "bg-amber-500/20 border-amber-500/40 text-amber-300 animate-pulse"
                      : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isPlayingAudio ? "bg-amber-500/30 text-amber-300" : "bg-slate-800 text-slate-400"}`}>
                      {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </div>
                    <div className="text-right">
                      <span className="block font-bold">القارئ الصوتي للدرس</span>
                      <span className="text-[10px] text-slate-400">
                        {isPlayingAudio ? "جاري القراءة (اضغط للإيقاف)" : "استماع للشرح والملخص"}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                    {isPlayingAudio ? "إيقاف" : "استماع"}
                  </span>
                </button>

                {/* 2. حفظ في الإشارات المرجعية */}
                <button
                  type="button"
                  onClick={handleBookmarkToggle}
                  className={`w-full p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-semibold ${
                    isBookmarked
                      ? "bg-purple-950/40 border-purple-500/40 text-purple-300"
                      : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-1.5 rounded-lg ${
                        isBookmarked ? "bg-purple-500/20 text-purple-400" : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="block font-bold">الإشارة المرجعية</span>
                      <span className="text-[10px] text-slate-400">
                        {isBookmarked ? "محفوظ في إشاراتك المرجعية" : "حفظ الدرس للرجوع إليه لاحقاً"}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md border font-mono ${
                      isBookmarked
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    }`}
                  >
                    {isBookmarked ? "محفوظ 🔖" : "حفظ"}
                  </span>
                </button>

                {/* 3. تحديد كمكتمل */}
                <button
                  type="button"
                  onClick={handleCompleteToggle}
                  className={`w-full p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between text-xs font-semibold ${
                    isCompleted
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                      : "bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isCompleted ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="block font-bold">حالة إكمال الدرس</span>
                      <span className="text-[10px] text-slate-400">
                        {isCompleted ? "تمت المذاكرة والإكمال" : "اضغط لتمييزه كمكتمل"}
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md border font-mono ${
                    isCompleted
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}>
                    {isCompleted ? "مكتمل ✅" : "تحديد كمكتمل"}
                  </span>
                </button>

                {/* 4. نشاط تعاوني */}
                {lesson.exploreInPairs && (
                  <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl space-y-1.5 text-right">
                    <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs">
                      <Users className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>نشاط تعاوني (استكشف في ثنائيات):</span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-normal">
                      {lesson.exploreInPairs}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-1.5">
          {lesson.title}
        </h1>
        <p className="text-xs sm:text-sm font-medium text-slate-400 font-mono dir-ltr text-right">
          {lesson.englishTitle}
        </p>
      </div>

      {/* Core Idea & Key Question */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="bg-slate-950/60 border-r-4 border-r-indigo-500 border border-slate-800/80 rounded-xl p-3.5 sm:p-4 text-slate-200 text-xs sm:text-sm leading-relaxed">
          <span className="font-bold text-indigo-400 ml-1.5">💡 الفكرة الأساسية:</span>
          <span>{lesson.coreIdea}</span>
        </div>
        {lesson.keyQuestion && (
          <div className="bg-slate-950/60 border-r-4 border-r-amber-500 border border-slate-800/80 rounded-xl p-3.5 sm:p-4 text-slate-200 text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-amber-400 ml-1.5">❓ السؤال الرئيسي:</span>
            <span>{lesson.keyQuestion}</span>
          </div>
        )}
      </div>

      {/* Learning Path */}
      {lesson.learningPath?.current && (
        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-3 px-1">
          <span className="text-slate-500 font-medium">مسار التعلم:</span>
          <span className="text-slate-300 font-semibold">{lesson.learningPath.current}</span>
        </div>
      )}

      {/* Compact Learning Objectives Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowObjectives((prev) => !prev)}
          className="text-xs font-medium text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer py-1 transition-colors"
        >
          <span>🎯 أهداف التعلم ({lesson.learningObjectives.length})</span>
          <span className="text-[10px] text-slate-500">{showObjectives ? "▲ إخفاء" : "▼ عرض"}</span>
        </button>

        {showObjectives && (
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 animate-fadeIn">
            {lesson.learningObjectives.map((obj, i) => (
              <div
                key={i}
                className="p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-lg text-xs text-slate-300 leading-relaxed flex items-start gap-2"
              >
                <span className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono shrink-0 text-[10px]">
                  {i + 1}
                </span>
                <span>{obj}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
