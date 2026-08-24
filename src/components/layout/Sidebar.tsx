"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CURRICULUM_DATA } from "@/data/curriculum";
import { ChevronDown, ChevronUp, CheckCircle, Circle, BookOpen, Layers } from "lucide-react";
import { getStoredProgress } from "@/lib/storage";

export function Sidebar() {
  const pathname = usePathname();
  const [completedList, setCompletedList] = useState<string[]>([]);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({
    "chapter-1": true,
    "chapter-2": true,
    "chapter-3": true,
    "chapter-4": true,
  });

  useEffect(() => {
    const p = getStoredProgress();
    setCompletedList(p.completedLessons);
  }, [pathname]);

  const toggleChapter = (id: string) => {
    setExpandedChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <aside className="w-80 shrink-0 hidden lg:block bg-slate-950/60 border-l border-slate-800/80 p-5 overflow-y-auto min-h-[calc(100vh-4rem)] custom-scrollbar">
      <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-xs text-white uppercase tracking-wider">فهرس المنهج الدراسي</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          {completedList.length} / 14 منجز
        </span>
      </div>

      {/* Chapters Tree */}
      <div className="space-y-4">
        {CURRICULUM_DATA.map((chapter) => {
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
    </aside>
  );
}
