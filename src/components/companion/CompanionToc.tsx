import React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import type { CompanionManifest, NavChapter } from "@/types/catalog";
import { companionHref } from "@/content/paths";

/** Companion book table of contents, grouped by the textbook's chapters. */
export function CompanionToc({
  partKey,
  companion,
  chapters,
}: {
  partKey: string;
  companion: CompanionManifest;
  chapters: NavChapter[];
}) {
  return (
    <div className="space-y-6">
      {chapters.map((chapter) => {
        const lessons = companion.lessons.filter((l) => l.chapterId === chapter.id);
        if (lessons.length === 0) return null;
        return (
          <section key={chapter.id} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
            <Link href={companionHref(partKey, companion.slug, chapter.id)} className="flex items-center justify-between group">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400">الفصل {chapter.number}</span>
                <h2 className="text-lg font-black text-white group-hover:text-amber-200">{chapter.title}</h2>
              </div>
              <span className="text-[11px] text-slate-400">{lessons.reduce((n, l) => n + l.totalQuestions, 0)} سؤالًا</span>
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {lessons.map((l) => (
                <Link
                  key={l.lessonId}
                  href={companionHref(partKey, companion.slug, l.chapterId, l.slug)}
                  className="p-3 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl flex items-center justify-between gap-3 transition-all group/item"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-8 h-6 rounded-lg bg-slate-900 text-amber-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-slate-800">
                      {l.lessonNumber}
                    </span>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-slate-200 group-hover/item:text-white truncate block">{l.title}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <FileText className="w-3 h-3" /> ص {l.bookletPages} • {l.mcqCount} اختيار • {l.essayCount} مقالي
                      </span>
                    </div>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-slate-600 group-hover/item:text-amber-400 shrink-0" />
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
