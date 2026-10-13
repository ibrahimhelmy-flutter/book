"use client";

import { RotateCcw, Search } from "lucide-react";
import type { AcronymTerm, GlossaryTerm } from "@/types";
import type { ChapterMeta } from "./glossary-meta";
import { GlossaryTermCard, type TermActions } from "./GlossaryTermCard";
import { AcronymCard } from "./AcronymCard";

interface GlossaryTermGridProps extends TermActions {
  terms: GlossaryTerm[];
  chapterMap: Record<string, ChapterMeta>;
  bookmarkedSet: Set<string>;
  copiedId: string | null;
  playingId: string | null;
  onResetFilters: () => void;
}

/** Grid view of term cards, with the "no matches" empty state. */
export function GlossaryTermGrid({
  terms,
  chapterMap,
  bookmarkedSet,
  copiedId,
  playingId,
  onResetFilters,
  onSpeak,
  onCopy,
  onToggleBookmark,
}: GlossaryTermGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fadeIn">
      {terms.map((term, idx) => (
        <GlossaryTermCard
          key={`${term.id}-${term.chapterId || idx}`}
          term={term}
          chapterLabel={chapterMap[term.chapterId]?.number || term.chapterId}
          isBookmarked={bookmarkedSet.has(term.id)}
          isCopied={copiedId === term.id}
          isPlaying={playingId === term.id}
          isPlayingEn={playingId === `${term.id}-en`}
          onSpeak={onSpeak}
          onCopy={onCopy}
          onToggleBookmark={onToggleBookmark}
        />
      ))}

      {terms.length === 0 && (
        <div className="col-span-full text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 space-y-3">
          <div className="w-12 h-12 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto text-slate-500">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-white">لا توجد مصطلحات مطابقة للفلترة الحالية</h3>
          <button
            onClick={onResetFilters}
            className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-600/30 cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط الفلاتر (عرض الكل)</span>
          </button>
        </div>
      )}
    </div>
  );
}

interface AcronymGridProps {
  acronyms: AcronymTerm[];
  playingId: string | null;
  onSpeak: (id: string, text: string, lang?: string) => void;
}

/** Acronyms tab: grid of acronym cards, with an empty state. */
export function AcronymGrid({ acronyms, playingId, onSpeak }: AcronymGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fadeIn">
      {acronyms.map((acr, idx) => {
        // Content-based id so the "playing" highlight stays on the same card when the filtered list changes.
        const speechId = `acr-${acr.short}-${acr.fullEn}`;
        return (
          <AcronymCard
            key={`${acr.short}-${idx}`}
            acronym={acr}
            speechId={speechId}
            isPlaying={playingId === speechId}
            onSpeak={onSpeak}
          />
        );
      })}

      {acronyms.length === 0 && (
        <div className="col-span-full text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
          لا توجد اختصارات مطابقة لمعايير البحث الحالية.
        </div>
      )}
    </div>
  );
}
