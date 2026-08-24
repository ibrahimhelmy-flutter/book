"use client";

import React, { useState } from "react";
import { GLOSSARY_DATA } from "@/data/glossary";
import { BookA, Search, Volume2, VolumeX, Sparkles, Filter, Layers } from "lucide-react";

type CategoryFilter = "ALL" | "AI" | "Cybersecurity" | "WebDev" | "Design" | "General";

export default function GlossaryPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ALL");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const categories = [
    { id: "ALL", label: "جميع المصطلحات" },
    { id: "AI", label: "الذكاء الاصطناعي (AI)" },
    { id: "Cybersecurity", label: "الأمن السيبراني" },
    { id: "WebDev", label: "تطبيقات الويب" },
    { id: "Design", label: "تصميم الوسائط و UX" },
    { id: "General", label: "عام وحوسبة" },
  ];

  const filteredTerms = GLOSSARY_DATA.filter((item) => {
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch =
      item.termAr.includes(searchTerm) ||
      item.termEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definitionAr.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const speakTerm = (term: (typeof GLOSSARY_DATA)[0]) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (playingId === term.id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`${term.termAr}. ${term.definitionAr}`);
      utterance.lang = "ar-SA";
      utterance.rate = 0.9;
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
      setPlayingId(term.id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-2xl mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-pink-400 mb-2">
          <BookA className="w-4 h-4" />
          <span>المعجم الأكاديمي الشامل</span>
        </div>
        <h1 className="text-3xl font-black mb-2">قاموس المصطلحات والمفاهيم الأساسية</h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          جميع المفاهيم والمصطلحات التقنية الواردة في كتاب البرمجة والذكاء الاصطناعي (الصف الثاني الثانوي) مع الترجمة الإنجليزية والتعريف العلمي الدقيق.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xl mb-8 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن مصطلح باللغة العربية أو الإنجليزية..."
            className="w-full pr-11 pl-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-pink-500 placeholder:text-slate-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as CategoryFilter)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-pink-600 text-white shadow-md shadow-pink-600/25"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Term Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredTerms.map((term) => (
          <div
            key={term.id}
            className="p-6 bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 rounded-2xl transition-all shadow-lg flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 className="text-lg font-black text-white group-hover:text-pink-300 transition-colors">
                    {term.termAr}
                  </h3>
                  <span className="text-xs font-mono text-pink-400 font-semibold dir-ltr text-right block mt-0.5">
                    {term.termEn}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => speakTerm(term)}
                    className={`p-2 rounded-xl border transition-all cursor-pointer ${
                      playingId === term.id
                        ? "bg-pink-500/20 border-pink-500 text-pink-300 animate-pulse"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                    title="نطق التعريف صوتياً"
                  >
                    {playingId === term.id ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-3">
                {term.definitionAr}
              </p>

              {term.definitionEn && (
                <p className="text-xs text-slate-400 italic mt-2.5 pt-2.5 border-t border-slate-800/60 dir-ltr text-left">
                  {term.definitionEn}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="px-2 py-0.5 bg-slate-950 rounded border border-slate-800 font-mono">
                الدرس {term.lessonNumber}
              </span>
              <span className="text-slate-400">{term.category}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredTerms.length === 0 && (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
          لا توجد مصطلحات مطابقة لمعايير البحث الحالية.
        </div>
      )}
    </div>
  );
}
