"use client";

import React, { useState, useEffect } from "react";
import { Lesson } from "@/types";
import { Bookmark, CheckCircle, Volume2, VolumeX, Clock, BookOpen, Share2 } from "lucide-react";
import { toggleBookmark, toggleLessonComplete, getStoredProgress } from "@/lib/storage";

interface Props {
  lesson: Lesson;
}

export function LessonHeader({ lesson }: Props) {
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

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
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("القارئ الصوتي غير مدعوم في هذا المتصفح.");
      return;
    }

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
  };

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl mb-8">
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 bg-indigo-600/20 text-indigo-400 font-bold rounded-lg border border-indigo-500/30">
            الدرس {lesson.number}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400">الفصل {lesson.chapterNumber}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-400">الصفحات في الكتاب: {lesson.pageRange}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Audio TTS */}
          <button
            onClick={handleTTSAudio}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
              isPlayingAudio
                ? "bg-amber-500/20 border-amber-500 text-amber-300 animate-pulse"
                : "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300"
            }`}
            title="القارئ الصوتي الذكي (TTS)"
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPlayingAudio ? "إيقاف الصوت" : "استماع للشرح"}</span>
          </button>

          {/* Bookmark Button */}
          <button
            onClick={handleBookmarkToggle}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isBookmarked
                ? "bg-purple-600 border-purple-500 text-white"
                : "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300"
            }`}
            title={isBookmarked ? "إزالة الإشارة المرجعية" : "حفظ في الإشارات المرجعية"}
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Complete Toggle Button */}
          <button
            onClick={handleCompleteToggle}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              isCompleted
                ? "bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/25"
                : "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300"
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{isCompleted ? "تم إتمام الدرس ✅" : "تحديد كمكتمل"}</span>
          </button>
        </div>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-snug mb-3">
        {lesson.title}
      </h1>
      <p className="text-sm font-medium text-slate-400 font-mono mb-6 dir-ltr text-right">
        {lesson.englishTitle}
      </p>

      {/* Core Idea Highlight Box */}
      <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-5 mb-6 text-indigo-200">
        <div className="text-xs font-bold text-indigo-400 mb-1 flex items-center gap-1.5">
          <span>⭐ الفكرة الأساسية للدرس:</span>
        </div>
        <p className="text-sm sm:text-base font-semibold leading-relaxed text-slate-100">
          {lesson.coreIdea}
        </p>
      </div>

      {/* Learning Objectives Grid */}
      <div className="space-y-2.5">
        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">أهداف التعلم المستهدفة:</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {lesson.learningObjectives.map((obj, i) => (
            <div
              key={i}
              className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-300 leading-relaxed flex items-start gap-2.5"
            >
              <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono shrink-0 text-[11px] border border-indigo-500/30">
                {i + 1}
              </span>
              <span>{obj}</span>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
