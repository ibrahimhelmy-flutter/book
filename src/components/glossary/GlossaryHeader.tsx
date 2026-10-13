"use client";

import { memo } from "react";
import { BookA, Star, Zap } from "lucide-react";
import type { ActiveTab } from "./glossary-meta";

interface GlossaryHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  termsCount: number;
  acronymsCount: number;
  bookmarkCount: number;
  onlyBookmarked: boolean;
  onToggleOnlyBookmarked: () => void;
}

/** Page banner: title, bookmarks-only toggle and the terms/acronyms tab switcher. */
export const GlossaryHeader = memo(function GlossaryHeader({
  activeTab,
  onTabChange,
  termsCount,
  acronymsCount,
  bookmarkCount,
  onlyBookmarked,
  onToggleOnlyBookmarked,
}: GlossaryHeaderProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl mb-6">
      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2.5 py-0.5 rounded-full w-fit">
            <BookA className="w-3.5 h-3.5" />
            <span>المعجم الأكاديمي المعتمد</span>
          </div>

          {bookmarkCount > 0 && (
            <button
              onClick={onToggleOnlyBookmarked}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                onlyBookmarked
                  ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30"
                  : "bg-slate-800/80 hover:bg-slate-800 text-amber-400 border-amber-500/30"
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${onlyBookmarked ? "fill-slate-950" : "fill-amber-400"}`} />
              <span>المفضلة للمراجعة ({bookmarkCount})</span>
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">قاموس المصطلحات والمفاهيم</h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              المصطلحات والمفاهيم العلمية المقررة، مع التعريف المعتمد، إمكانية النطق، والفلترة حسب الوحدات والدروس.
            </p>
          </div>

          {/* Tab Selector: Terms vs Acronyms */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            <button
              onClick={() => onTabChange("terms")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "terms"
                  ? "bg-pink-600 text-white shadow-md shadow-pink-600/30 font-extrabold"
                  : "bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <BookA className="w-3.5 h-3.5" />
              <span>المصطلحات ({termsCount})</span>
            </button>

            <button
              onClick={() => onTabChange("acronyms")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === "acronyms"
                  ? "bg-sky-600 text-white shadow-md shadow-sky-600/30 font-extrabold"
                  : "bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>الاختصارات ({acronymsCount})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});
