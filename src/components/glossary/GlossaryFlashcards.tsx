"use client";

import { ChevronLeft, ChevronRight, Shuffle, Star, Volume2 } from "lucide-react";
import type { GlossaryTerm } from "@/types";
import type { ChapterMeta } from "./glossary-meta";

export interface FlashcardState {
  index: number;
  flipped: boolean;
}

interface GlossaryFlashcardsProps {
  terms: GlossaryTerm[];
  chapterMap: Record<string, ChapterMeta>;
  bookmarkedSet: Set<string>;
  state: FlashcardState;
  onStateChange: (next: FlashcardState | ((prev: FlashcardState) => FlashcardState)) => void;
  onSpeak: (id: string, text: string, lang?: string) => void;
  onToggleBookmark: (id: string) => void;
}

/** Flashcard study mode: one term at a time, click to flip to its definition, prev/next/shuffle. */
export function GlossaryFlashcards({
  terms,
  chapterMap,
  bookmarkedSet,
  state,
  onStateChange,
  onSpeak,
  onToggleBookmark,
}: GlossaryFlashcardsProps) {
  if (terms.length === 0) return <div className="max-w-xl mx-auto py-4 animate-fadeIn" />;

  const { index, flipped } = state;
  const currentTerm = terms[index] || terms[0];
  const chapterMeta = chapterMap[currentTerm.chapterId];
  const isBookmarked = bookmarkedSet.has(currentTerm.id);
  const toggleFlip = () => onStateChange((prev) => ({ ...prev, flipped: !prev.flipped }));

  return (
    <div className="max-w-xl mx-auto py-4 animate-fadeIn">
      <div className="space-y-4">
        {/* Top Controls */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-white font-bold">
            {index + 1} / {terms.length}
          </span>

          <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
              style={{ width: `${((index + 1) / terms.length) * 100}%` }}
            />
          </div>

          <button
            onClick={() => onStateChange({ index: Math.floor(Math.random() * terms.length), flipped: false })}
            className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[11px]"
          >
            <Shuffle className="w-3 h-3" />
            <span>عشوائي</span>
          </button>
        </div>

        {/* Flashcard */}
        <div
          onClick={toggleFlip}
          className="min-h-[260px] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 shadow-xl cursor-pointer flex flex-col justify-between transition-all select-none"
        >
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/60 pb-2">
            <span>
              و{chapterMeta?.number || currentTerm.chapterId} • درس {currentTerm.lessonNumber}
            </span>
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => onToggleBookmark(currentTerm.id)} className="p-1 rounded text-slate-500 hover:text-amber-400">
                <Star className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
              </button>
              <button
                onClick={() => onSpeak(currentTerm.id, flipped ? currentTerm.definitionAr : currentTerm.termAr, "ar-SA")}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="py-6 text-center">
            {!flipped ? (
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-white">{currentTerm.termAr}</h2>
                <p className="text-sm font-mono text-slate-400 dir-ltr">{currentTerm.termEn}</p>
                <span className="inline-block mt-4 text-xs text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                  انقر لكشف التعريف
                </span>
              </div>
            ) : (
              <div className="space-y-2 text-right">
                <div className="text-[11px] text-slate-400 font-bold mb-1">{currentTerm.termAr}:</div>
                <p className="text-sm sm:text-base text-slate-200 leading-relaxed">{currentTerm.definitionAr}</p>
              </div>
            )}
          </div>

          <div className="text-[10px] text-slate-500 text-center border-t border-slate-800/60 pt-2">انقر لقلب البطاقة</div>
        </div>

        {/* Nav Controls */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => onStateChange((prev) => ({ index: Math.max(0, prev.index - 1), flipped: false }))}
            disabled={index === 0}
            className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>السابق</span>
          </button>

          <button
            onClick={toggleFlip}
            className="py-2 px-4 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 rounded-xl text-xs font-bold text-purple-200 transition-all cursor-pointer"
          >
            {flipped ? "إخفاء التعريف" : "كشف التعريف"}
          </button>

          <button
            onClick={() =>
              onStateChange((prev) => ({ index: Math.min(terms.length - 1, prev.index + 1), flipped: false }))
            }
            disabled={index === terms.length - 1}
            className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>التالي</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
