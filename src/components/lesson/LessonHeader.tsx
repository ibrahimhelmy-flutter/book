"use client";

import React, { useState, useEffect } from "react";
import { Lesson } from "@/types";
import { Bookmark, CheckCircle, Volume2, VolumeX, Clock, BookOpen, Share2, Users } from "lucide-react";
import { toggleBookmark, toggleLessonComplete, getStoredProgress } from "@/lib/storage";

interface Props {
  lesson: Lesson;
}

export function LessonHeader({ lesson }: Props) {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showExplorePopover, setShowExplorePopover] = useState<boolean>(false);

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
    <header className="bg-slate-900/80 backdrop-blur-md border border-slate-800/80 rounded-2xl p-5 sm:p-7 text-white shadow-xl mb-6">
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

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Explore in Pairs Hover Button */}
          {lesson.exploreInPairs && (
            <div className="relative group">
              <button
                type="button"
                onClick={() => setShowExplorePopover((prev) => !prev)}
                onMouseEnter={() => setShowExplorePopover(true)}
                onMouseLeave={() => setShowExplorePopover(false)}
                className="px-2.5 py-1.5 rounded-lg border border-purple-500/30 bg-purple-950/30 hover:bg-purple-900/50 text-purple-300 hover:text-white text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                title="استكشف في ثنائيات"
              >
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span className="hidden sm:inline">نشاط تعاوني</span>
              </button>

              {/* Hover Popover */}
              <div
                onMouseEnter={() => setShowExplorePopover(true)}
                onMouseLeave={() => setShowExplorePopover(false)}
                className={`absolute left-0 top-full mt-2 w-72 sm:w-80 p-3.5 bg-slate-950/95 backdrop-blur-xl border border-purple-500/40 rounded-xl shadow-2xl z-50 transition-all duration-200 text-right ${
                  showExplorePopover
                    ? "opacity-100 visible pointer-events-auto"
                    : "opacity-0 invisible pointer-events-none"
                }`}
              >
                <div className="flex items-center gap-1.5 text-purple-400 font-bold text-xs mb-1.5 border-b border-purple-500/20 pb-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>نشاط تفاعلي تعاوني:</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-normal">
                  {lesson.exploreInPairs}
                </p>
              </div>
            </div>
          )}

          {/* Audio TTS */}
          <button
            onClick={handleTTSAudio}
            className={`px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-xs font-medium ${
              isPlayingAudio
                ? "bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse"
                : "bg-slate-800/60 hover:bg-slate-700 border-slate-700/60 text-slate-300"
            }`}
            title="القارئ الصوتي"
          >
            {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPlayingAudio ? "إيقاف" : "استماع"}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkToggle}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isBookmarked
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-slate-800/60 hover:bg-slate-700 border-slate-700/60 text-slate-300"
            }`}
            title={isBookmarked ? "إزالة الإشارة المرجعية" : "حفظ في الإشارات المرجعية"}
          >
            <Bookmark className="w-3.5 h-3.5" />
          </button>

          {/* Complete Toggle Button */}
          <button
            onClick={handleCompleteToggle}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              isCompleted
                ? "bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20"
                : "bg-slate-800/60 hover:bg-slate-700 border-slate-700/60 text-slate-300"
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{isCompleted ? "مكتمل ✅" : "تحديد كمكتمل"}</span>
          </button>
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

      {/* Simplified Core Idea */}
      <div className="bg-slate-950/60 border-r-4 border-r-indigo-500 border border-slate-800/80 rounded-xl p-3.5 sm:p-4 text-slate-200 text-xs sm:text-sm leading-relaxed mb-3">
        <span className="font-bold text-indigo-400 ml-1.5">💡 الفكرة الأساسية:</span>
        <span>{lesson.coreIdea}</span>
      </div>

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
