"use client";

import { memo } from "react";
import { CheckCheck, Copy, Star, Volume2, VolumeX } from "lucide-react";
import type { GlossaryTerm } from "@/types";
import type { ChapterMeta } from "./glossary-meta";
import type { TermActions } from "./GlossaryTermCard";

interface GlossaryTermRowProps extends TermActions {
  term: GlossaryTerm;
  index: number;
  chapterLabel: number | string;
  isBookmarked: boolean;
  isCopied: boolean;
  isPlaying: boolean;
}

const GlossaryTermRow = memo(function GlossaryTermRow({
  term,
  index,
  chapterLabel,
  isBookmarked,
  isCopied,
  isPlaying,
  onSpeak,
  onCopy,
  onToggleBookmark,
}: GlossaryTermRowProps) {
  return (
    <tr className="hover:bg-slate-800/50 transition-colors">
      <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-[11px]">{index + 1}</td>
      <td className="py-2.5 px-3">
        <div className="font-bold text-white text-xs">{term.termAr}</div>
        <div className="text-[10px] font-mono text-slate-400 dir-ltr text-right">{term.termEn}</div>
      </td>
      <td className="py-2.5 px-3 leading-relaxed text-slate-300 text-xs">{term.definitionAr}</td>
      <td className="py-2.5 px-3 text-[11px] text-slate-400">
        <div>
          و{chapterLabel} • درس {term.lessonNumber}
        </div>
        {term.source?.primaryPage && (
          <span className="text-[10px] text-slate-500 font-mono">ص {term.source.primaryPage}</span>
        )}
      </td>
      <td className="py-2.5 px-3 text-center">
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => onSpeak(term.id, `${term.termAr}. ${term.definitionAr}`, "ar-SA")}
            className={`p-1 rounded border transition-all cursor-pointer ${
              isPlaying
                ? "bg-pink-500/20 border-pink-500 text-pink-300"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
            title="نطق"
          >
            {isPlaying ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
          </button>
          <button
            onClick={() => onCopy(term)}
            className="p-1 rounded border bg-slate-950 border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="نسخ"
          >
            {isCopied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          </button>
          <button
            onClick={() => onToggleBookmark(term.id)}
            className={`p-1 rounded border transition-all cursor-pointer ${
              isBookmarked
                ? "bg-amber-500/20 border-amber-500 text-amber-300"
                : "bg-slate-950 border-slate-800 text-slate-500 hover:text-amber-400"
            }`}
            title="المفضلة"
          >
            <Star className={`w-3 h-3 ${isBookmarked ? "fill-amber-400" : ""}`} />
          </button>
        </div>
      </td>
    </tr>
  );
});

interface GlossaryTermTableProps extends TermActions {
  terms: GlossaryTerm[];
  chapterMap: Record<string, ChapterMeta>;
  bookmarkedSet: Set<string>;
  copiedId: string | null;
  playingId: string | null;
}

/** Compact list view: one table row per term with inline speak/copy/bookmark tools. */
export function GlossaryTermTable({
  terms,
  chapterMap,
  bookmarkedSet,
  copiedId,
  playingId,
  onSpeak,
  onCopy,
  onToggleBookmark,
}: GlossaryTermTableProps) {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl animate-fadeIn">
      <div className="overflow-x-auto">
        <table className="w-full text-right text-xs">
          <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[11px] font-bold">
            <tr>
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-3 min-w-[180px]">المصطلح العلمي</th>
              <th className="py-3 px-3 min-w-[300px]">التعريف العلمي</th>
              <th className="py-3 px-3 min-w-[130px]">الوحدة والدرس</th>
              <th className="py-3 px-3 w-24 text-center">أدوات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70 text-slate-300">
            {terms.map((term, idx) => (
              <GlossaryTermRow
                key={term.id}
                term={term}
                index={idx}
                chapterLabel={chapterMap[term.chapterId]?.number || term.chapterId}
                isBookmarked={bookmarkedSet.has(term.id)}
                isCopied={copiedId === term.id}
                isPlaying={playingId === term.id}
                onSpeak={onSpeak}
                onCopy={onCopy}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
