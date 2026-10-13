import React from "react";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck, Clock } from "lucide-react";
import type { CatalogBook } from "@/types/catalog";
import { bookHref, companionHref, partHref } from "@/content/paths";
import { ContentIcon } from "@/components/common/ContentIcon";

/** A book with its parts (terms) and companion books; coming-soon entries are shown but not linked. */
export function BookCard({ gradeId, book }: { gradeId: string; book: CatalogBook }) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col gap-4 shadow-xl hover:border-slate-700 transition-colors">
      <Link href={bookHref(gradeId, book.slug)} className="flex items-start gap-3 group">
        <div className={`p-3 rounded-2xl bg-gradient-to-br ${book.colorTheme || "from-indigo-600 to-purple-600"} text-white shadow-lg shrink-0`}>
          <ContentIcon name={book.icon} className="w-6 h-6" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">{book.title}</h3>
          {book.englishTitle && <p className="text-[11px] font-mono text-slate-500 dir-ltr text-right">{book.englishTitle}</p>}
        </div>
      </Link>

      {book.description && <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{book.description}</p>}

      <div className="space-y-2">
        {book.parts.map((part) =>
          part.status === "available" ? (
            <div key={part.key} className="rounded-2xl border border-slate-800 bg-slate-950/60 p-3 space-y-2">
              <Link href={partHref(part.key)} className="flex items-center justify-between gap-2 group/part">
                <div className="min-w-0">
                  <span className="text-sm font-bold text-white group-hover/part:text-indigo-300">{part.shortTitle}</span>
                  {part.stats && (
                    <span className="block text-[11px] text-slate-500">
                      {part.stats.totalChapters} فصول • {part.stats.totalLessons} درسًا
                    </span>
                  )}
                </div>
                <ArrowLeft className="w-4 h-4 text-slate-500 group-hover/part:text-indigo-400 group-hover/part:-translate-x-1 transition-all shrink-0" />
              </Link>
              {part.companions.map((c) =>
                c.status === "available" ? (
                  <Link
                    key={c.slug}
                    href={companionHref(part.key, c.slug)}
                    className="flex items-center gap-2 text-xs text-amber-300 hover:text-amber-200 px-2 py-1.5 rounded-xl bg-amber-500/5 border border-amber-500/20"
                  >
                    <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{c.title}</span>
                  </Link>
                ) : (
                  <div
                    key={c.slug}
                    aria-disabled
                    className="flex items-center justify-between gap-2 text-xs text-slate-500 px-2 py-1.5 rounded-xl bg-slate-900/60 border border-dashed border-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <ClipboardCheck className="w-3.5 h-3.5 shrink-0" />
                      {c.title}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" /> قريبًا
                    </span>
                  </div>
                )
              )}
            </div>
          ) : (
            <div
              key={part.key}
              aria-disabled
              className="rounded-2xl border border-dashed border-slate-800 p-3 flex items-center justify-between text-slate-500"
            >
              <span className="text-sm font-bold">{part.shortTitle}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center gap-1">
                <Clock className="w-3 h-3" /> قريبًا
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
