"use client";

import { memo } from "react";
import { CheckCheck, Copy, Star, Volume2, VolumeX } from "lucide-react";
import type { GlossaryTerm } from "@/types";
import { getCategoryLabel } from "./glossary-meta";

export interface TermActions {
  onSpeak: (id: string, text: string, lang?: string) => void;
  onCopy: (term: GlossaryTerm) => void;
  onToggleBookmark: (id: string) => void;
}

interface GlossaryTermCardProps extends TermActions {
  term: GlossaryTerm;
  /** Chapter number, or the chapter id when the chapter is unknown. */
  chapterLabel: number | string;
  isBookmarked: boolean;
  isCopied: boolean;
  isPlaying: boolean;
  isPlayingEn: boolean;
}

/** Grid-view card: term (Ar + En), definition, discreet speak/copy/bookmark actions and a source footer. */
export const GlossaryTermCard = memo(function GlossaryTermCard({
  term,
  chapterLabel,
  isBookmarked,
  isCopied,
  isPlaying,
  isPlayingEn,
  onSpeak,
  onCopy,
  onToggleBookmark,
}: GlossaryTermCardProps) {
  return (
    <div className="bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 transition-all hover:shadow-lg flex flex-col justify-between group">
      <div>
        {/* Top Header: Term Name (Ar + En) + Subtle Discreet Actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-white group-hover:text-pink-300 transition-colors leading-snug">
              {term.termAr}
            </h3>
            {term.termEn && (
              <span className="text-[11px] font-mono text-slate-400 dir-ltr text-right block mt-0.5">{term.termEn}</span>
            )}
          </div>

          {/* Discrete Actions (Low visual footprint to focus on the term) */}
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
            <button
              onClick={() => onSpeak(term.id, `${term.termAr}. ${term.definitionAr}`, "ar-SA")}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isPlaying
                  ? "bg-pink-500/20 border-pink-500 text-pink-300 animate-pulse"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
              title={isPlaying ? "إيقاف" : "نطق بالعربية"}
            >
              {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {term.termEn && (
              <button
                onClick={() => onSpeak(`${term.id}-en`, term.termEn, "en-US")}
                className={`px-1.5 py-1 rounded-lg border text-[10px] font-mono transition-all cursor-pointer ${
                  isPlayingEn
                    ? "bg-sky-500/20 border-sky-400 text-sky-300"
                    : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                }`}
                title="نطق بالإنجليزية"
              >
                EN
              </button>
            )}

            <button
              onClick={() => onCopy(term)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isCopied
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
              }`}
              title="نسخ"
            >
              {isCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => onToggleBookmark(term.id)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                isBookmarked
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                  : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-amber-400 hover:border-slate-700"
              }`}
              title={isBookmarked ? "إزالة من المفضلة" : "حفظ في المفضلة"}
            >
              <Star className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Main Focus: Scientific Definition */}
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal mt-2">{term.definitionAr}</p>

        {term.definitionEn && (
          <p className="text-[11px] text-slate-500 italic mt-1.5 dir-ltr text-left font-sans">{term.definitionEn}</p>
        )}
      </div>

      {/* Discreet Bottom Bar */}
      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <span>و{chapterLabel}</span>
          <span>•</span>
          <span>درس {term.lessonNumber}</span>
          {term.source?.primaryPage && (
            <>
              <span>•</span>
              <span className="font-mono">ص {term.source.primaryPage}</span>
            </>
          )}
        </div>

        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950/60 border border-slate-800 text-slate-400">
          {getCategoryLabel(term.category)}
        </span>
      </div>
    </div>
  );
});
