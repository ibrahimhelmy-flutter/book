"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CURRICULUM_TOC, TOTAL_CURRICULUM_LESSONS } from "@/data/curriculum-toc";
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  ChevronsUpDown,
  ChevronsDownUp,
  CheckCircle,
  Circle,
  BookOpen,
  Smartphone,
  Download,
  DownloadCloud,
} from "lucide-react";
import { getStoredProgress } from "@/lib/storage";
import { usePWA } from "@/context/PWAContext";

export function Sidebar() {
  const pathname = usePathname();
  const {
    isInstalled,
    promptInstall,
    isOfflinePackReady,
    setIsOfflinePackModalOpen,
  } = usePWA();
  const [completedList, setCompletedList] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(true); // افتراضياً مفتوحة
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    CURRICULUM_TOC.forEach((ch) => {
      initial[ch.id] = true;
    });
    return initial;
  });

  const totalLessons = TOTAL_CURRICULUM_LESSONS;

  // Find active lesson from current pathname
  const currentLesson = React.useMemo(() => {
    for (const chapter of CURRICULUM_TOC) {
      for (const lesson of chapter.lessons) {
        if (pathname.includes(lesson.slug) || (lesson.id && pathname.includes(lesson.id))) {
          return { lesson, chapter };
        }
      }
    }
    return null;
  }, [pathname]);

  // Restore sidebar preference from localStorage (default open)
  useEffect(() => {
    try {
      const saved = localStorage.getItem("curriculum_sidebar_open");
      if (saved !== null) {
        setIsOpen(saved === "true");
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen to keyboard shortcut (Ctrl+B / Cmd+B) and custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };

    const handleCustomToggle = () => toggleSidebar();
    const handleCustomOpen = () => {
      setIsOpen(true);
      try {
        localStorage.setItem("curriculum_sidebar_open", "true");
      } catch {
        // ignore
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("toggle-curriculum-sidebar", handleCustomToggle);
    window.addEventListener("open-curriculum-sidebar", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("toggle-curriculum-sidebar", handleCustomToggle);
      window.removeEventListener("open-curriculum-sidebar", handleCustomOpen);
    };
  }, []);

  useEffect(() => {
    const p = getStoredProgress();
    setCompletedList(p.completedLessons);
  }, [pathname]);

  const toggleSidebar = () => {
    setIsOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("curriculum_sidebar_open", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const areAllExpanded = Object.values(expandedChapters).some(Boolean);

  const toggleAllChapters = () => {
    const nextState = !areAllExpanded;
    const updated: Record<string, boolean> = {};
    CURRICULUM_TOC.forEach((ch) => {
      updated[ch.id] = nextState;
    });
    setExpandedChapters(updated);
  };

  return (
    <>
      {/* Floating launcher when sidebar is collapsed (Desktop) - Displays only the current lesson name */}
      {!isOpen && (
        <aside className="hidden lg:block shrink-0 w-0">
          <button
            type="button"
            onClick={toggleSidebar}
            className="fixed right-0 top-20 z-40 flex items-center gap-2.5 py-2 px-3.5 bg-slate-900/95 hover:bg-slate-850 text-indigo-400 hover:text-white border-y border-l border-indigo-500/40 hover:border-indigo-400 rounded-l-2xl shadow-2xl backdrop-blur-md transition-all cursor-pointer group hover:pr-4.5 max-w-sm"
            title={
              currentLesson
                ? `${currentLesson.lesson.title} - انقر لفتح الفهرس كاملاً (Ctrl+B)`
                : "انقر لفتح فهرس المنهج الدراسي كاملاً (Ctrl+B)"
            }
            aria-label="فتح فهرس المنهج الدراسي"
          >
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
            {currentLesson ? (
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                  {currentLesson.lesson.number}
                </span>
                <span className="text-xs font-bold text-slate-100 truncate max-w-[240px] text-right">
                  {currentLesson.lesson.title}
                </span>
              </div>
            ) : (
              <span className="text-xs font-bold text-slate-100 truncate max-w-[240px] text-right">
                فهرس المنهج الدراسي
              </span>
            )}
            <ChevronLeft className="w-4 h-4 text-slate-400 shrink-0 group-hover:text-white group-hover:-translate-x-0.5 transition-transform" />
          </button>
        </aside>
      )}

      {/* Main Sidebar */}
      <aside
        className={`shrink-0 hidden lg:block bg-slate-950/60 border-l border-slate-800/80 sticky top-0 self-start h-[calc(100vh-4rem)] transition-all duration-300 ease-in-out relative ${
          isOpen
            ? "w-80 p-5 overflow-y-auto custom-scrollbar opacity-100"
            : "w-0 p-0 border-l-0 overflow-hidden opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-[17.5rem] min-w-[17.5rem]">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-bold text-xs text-white uppercase tracking-wider truncate">
                فهرس المنهج الدراسي
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className="text-[11px] font-mono text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded-md border border-slate-800"
                title={`${completedList.length} درس مكتمل من أصل ${totalLessons}`}
              >
                {completedList.length}/{totalLessons}
              </span>

              {/* Toggle all chapters expand/collapse */}
              <button
                type="button"
                onClick={toggleAllChapters}
                className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-850 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
                title={areAllExpanded ? "طي جميع الفصول" : "توسيع جميع الفصول"}
                aria-label={areAllExpanded ? "طي جميع الفصول" : "توسيع جميع الفصول"}
              >
                {areAllExpanded ? (
                  <ChevronsDownUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Close/Collapse sidebar button */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-850 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
                title="إغلاق / طي فهرس المنهج الدراسي (Ctrl+B)"
                aria-label="إغلاق الفهرس"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chapters Tree */}
          <div className="space-y-4">
            {CURRICULUM_TOC.map((chapter) => {
              const isExpanded = expandedChapters[chapter.id];
              const chapterCompletedCount = chapter.lessons.filter((l) => completedList.includes(l.id)).length;

              return (
                <div key={chapter.id} className="bg-slate-900/60 border border-slate-800/80 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => toggleChapter(chapter.id)}
                    className="w-full p-3.5 text-right flex items-center justify-between gap-2 hover:bg-slate-900 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 text-right truncate">
                      <span className="w-5 h-5 rounded-md bg-indigo-500/20 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0">
                        {chapter.number}
                      </span>
                      <div className="truncate">
                        <span className="font-bold text-xs text-slate-100 block truncate">{chapter.title}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {chapterCompletedCount} / {chapter.lessons.length} دروس
                        </span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  {isExpanded && (
                    <div className="p-2 pt-0 space-y-1">
                      {chapter.lessons.map((lesson) => {
                        const isLessonActive = pathname.includes(lesson.slug);
                        const isDone = completedList.includes(lesson.id);

                        return (
                          <Link
                            key={lesson.id}
                            href={`/chapters/${chapter.id}/${lesson.slug}`}
                            className={`p-2.5 rounded-xl text-xs flex items-center justify-between gap-2 transition-all block ${
                              isLessonActive
                                ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/30"
                                : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="font-mono text-[11px] opacity-75 shrink-0">{lesson.number}</span>
                              <span className="truncate">{lesson.title}</span>
                            </div>
                            {isDone ? (
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Circle className="w-3 h-3 text-slate-600 shrink-0" />
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

          {/* PWA & Offline Quick Launcher in Sidebar */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
            <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  تطبيق المنصة (PWA)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold font-mono">
                  {isOfflinePackReady ? "محفوظ محلياً ✓" : "بدون إنترنت ⚡"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {!isInstalled ? (
                  <button
                    type="button"
                    onClick={() => promptInstall()}
                    className="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                    <span>تثبيت التطبيق</span>
                  </button>
                ) : (
                  <div className="py-1.5 px-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold rounded-xl flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    <span>تطبيق مثبت</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsOfflinePackModalOpen(true)}
                  className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <DownloadCloud className="w-3 h-3 text-emerald-400" />
                  <span>حزمة المنهج</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

