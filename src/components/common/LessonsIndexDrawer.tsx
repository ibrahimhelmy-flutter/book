"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CURRICULUM_DATA } from "@/data/curriculum";
import {
  X,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Circle,
  Search,
  Sparkles,
  GraduationCap
} from "lucide-react";
import { getStoredProgress } from "@/lib/storage";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function LessonsIndexDrawer({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  const [completedList, setCompletedList] = useState<string[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CURRICULUM_DATA.forEach((ch) => {
      initial[ch.id] = true;
    });
    return initial;
  });

  // Load user progress
  useEffect(() => {
    if (isOpen) {
      const p = getStoredProgress();
      setCompletedList(p.completedLessons);
    }
  }, [isOpen, pathname]);

  // Handle ESC key and scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const totalLessons = useMemo(() => {
    return CURRICULUM_DATA.reduce((acc, ch) => acc + (ch.lessons ? ch.lessons.length : 0), 0);
  }, []);

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!isOpen) return null;

  const normalizedSearch = searchTerm.trim().toLowerCase();

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn" dir="rtl">
      {/* Dark Overlay Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <div className="fixed inset-y-0 right-0 max-w-full w-full sm:w-[420px] bg-slate-950 border-l border-slate-800 shadow-2xl flex flex-col z-50">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-900/70 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white">
                فهرس المنهج والدروس 📚
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className="text-indigo-400 font-bold">{completedList.length}</span> من {totalLessons} درس مكتمل
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            aria-label="إغلاق الفهرس"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search Bar */}
        <div className="p-3.5 border-b border-slate-800/80 bg-slate-950">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن اسم الدرس أو رقمه..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pr-9 pl-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs cursor-pointer p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Chapters & Lessons List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar">
          {CURRICULUM_DATA.map((chapter) => {
            const filteredLessons = chapter.lessons.filter((l) => {
              if (!normalizedSearch) return true;
              return (
                l.title.toLowerCase().includes(normalizedSearch) ||
                l.number.includes(normalizedSearch) ||
                l.englishTitle.toLowerCase().includes(normalizedSearch)
              );
            });

            if (normalizedSearch && filteredLessons.length === 0) {
              return null;
            }

            const isExpanded = normalizedSearch ? true : expandedChapters[chapter.id];
            const chapterCompletedCount = chapter.lessons.filter((l) => completedList.includes(l.id)).length;

            return (
              <div
                key={chapter.id}
                className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden transition-all"
              >
                {/* Chapter Header Button */}
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter.id)}
                  className="w-full p-3.5 text-right flex items-center justify-between gap-2 hover:bg-slate-900 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-indigo-500/30">
                      {chapter.number}
                    </span>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-slate-100 block truncate">
                        {chapter.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {chapterCompletedCount} / {chapter.lessons.length} منجز
                      </span>
                    </div>
                  </div>

                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>

                {/* Lessons List in Chapter */}
                {isExpanded && (
                  <div className="p-2 pt-0 space-y-1">
                    {filteredLessons.map((lesson) => {
                      const isLessonActive = pathname.includes(lesson.slug);
                      const isDone = completedList.includes(lesson.id);

                      return (
                        <Link
                          key={lesson.id}
                          href={`/chapters/${chapter.id}/${lesson.slug}`}
                          onClick={onClose}
                          className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all block ${
                            isLessonActive
                              ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                              : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-950/60 border border-slate-800/80 text-indigo-300 font-bold shrink-0">
                              {lesson.number}
                            </span>
                            <span className="truncate">{lesson.title}</span>
                          </div>

                          {isDone ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Quick Links */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-xs text-slate-400">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            <span>لوحة الإنجاز</span>
          </Link>

          <Link
            href="/exams"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>الامتحانات</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
