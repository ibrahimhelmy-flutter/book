"use client";

import { memo } from "react";
import { Volume2 } from "lucide-react";
import type { AcronymTerm } from "@/types";

interface AcronymCardProps {
  acronym: AcronymTerm;
  speechId: string;
  isPlaying: boolean;
  onSpeak: (id: string, text: string, lang?: string) => void;
}

/** One acronym: short form, category, full English/Arabic expansion, description and optional lesson ref. */
export const AcronymCard = memo(function AcronymCard({ acronym: acr, speechId, isPlaying, onSpeak }: AcronymCardProps) {
  return (
    <div className="p-4 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 rounded-2xl transition-all shadow-md flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between gap-2 border-b border-slate-800/70 pb-2 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 bg-sky-500/20 border border-sky-500/30 text-sky-300 rounded-lg font-mono font-black text-xs dir-ltr">
              {acr.short}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-950 border border-slate-800 text-slate-400">
              {acr.category}
            </span>
          </div>

          <button
            onClick={() => onSpeak(speechId, `${acr.short}. ${acr.fullEn}. ${acr.fullAr}`, "en-US")}
            className={`p-1 rounded border transition-all cursor-pointer ${
              isPlaying
                ? "bg-sky-500/20 border-sky-400 text-sky-300"
                : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
            }`}
            title="استمع للنطق"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mb-1 text-left dir-ltr">
          <h4 className="text-xs font-bold text-sky-200 font-mono leading-tight">{acr.fullEn}</h4>
        </div>

        <div className="mb-2 text-right">
          <p className="text-xs font-bold text-amber-300 leading-snug">{acr.fullAr}</p>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed pt-1.5 border-t border-slate-800/50">{acr.descriptionAr}</p>
      </div>

      {acr.lessonRef && (
        <div className="mt-3 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px] text-slate-500">
          <span>مرجع: {acr.lessonRef}</span>
          <span className="text-sky-400 font-mono">اختصار معتمد</span>
        </div>
      )}
    </div>
  );
});
