"use client";

import React, { useState } from "react";
import { GLOSSARY_DATA } from "@/data/glossary";
import { ACRONYMS_DATA } from "@/data/acronyms";
import { BookA, Search, Volume2, VolumeX, Sparkles, Filter, Layers, Zap, Info } from "lucide-react";

type CategoryFilter = "ALL" | "AI" | "Cybersecurity" | "WebDev" | "Design" | "General" | "Hardware" | "Networking";
type ActiveTab = "terms" | "acronyms";

export default function GlossaryPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("terms");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ALL");
  const [playingId, setPlayingId] = useState<string | null>(null);

  const categories = [
    { id: "ALL", label: "جميع التصنيفات" },
    { id: "AI", label: "الذكاء الاصطناعي (AI)" },
    { id: "Cybersecurity", label: "الأمن السيبراني" },
    { id: "Hardware", label: "العتاد والحواسيب" },
    { id: "WebDev", label: "تطبيقات الويب" },
    { id: "Networking", label: "الشبكات والاتصالات" },
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

  const filteredAcronyms = ACRONYMS_DATA.filter((item) => {
    const matchesCategory = selectedCategory === "ALL" || item.category === selectedCategory;
    const matchesSearch =
      item.short.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fullEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fullAr.includes(searchTerm) ||
      item.descriptionAr.includes(searchTerm);
    return matchesCategory && matchesSearch;
  });

  const speakText = (id: string, text: string, lang = "ar-SA") => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (playingId === id) {
      window.speechSynthesis.cancel();
      setPlayingId(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      window.speechSynthesis.speak(utterance);
      setPlayingId(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-2xl mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-pink-400 mb-2">
          <BookA className="w-4 h-4" />
          <span>المعجم الأكاديمي الشامل والمختصرات التقنية</span>
        </div>
        <h1 className="text-3xl font-black mb-2">قاموس المصطلحات والمختصرات التقنية</h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          جميع المفاهيم والمصطلحات والرموز المختصرة (مثل ENIAC و CPU و 2FA و AI) مع أسمائها الكاملة وترجمتها وشرحها العلمي.
        </p>

        {/* Tab Toggle */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setActiveTab("terms")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "terms"
                ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30 font-extrabold"
                : "bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <BookA className="w-4 h-4" />
            <span>قاموس المفاهيم والمصطلحات ({GLOSSARY_DATA.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("acronyms")}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === "acronyms"
                ? "bg-sky-600 text-white shadow-lg shadow-sky-600/30 font-extrabold"
                : "bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>قاموس الاختصارات والرموز (Shortcuts & Acronyms) ({ACRONYMS_DATA.length})</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-xl mb-8 space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              activeTab === "terms"
                ? "ابحث عن مصطلح باللغة العربية أو الإنجليزية..."
                : "ابحث عن اختصار مثل ENIAC أو CPU أو 2FA أو اسمها الكامل..."
            }
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
                  ? activeTab === "acronyms"
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/25"
                    : "bg-pink-600 text-white shadow-md shadow-pink-600/25"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* View 1: Main Glossary Terms */}
      {activeTab === "terms" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
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
                      onClick={() => speakText(term.id, `${term.termAr}. ${term.definitionAr}`, "ar-SA")}
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

          {filteredTerms.length === 0 && (
            <div className="col-span-full text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              لا توجد مصطلحات مطابقة لمعايير البحث الحالية.
            </div>
          )}
        </div>
      )}

      {/* View 2: Acronyms & Technical Shortcuts */}
      {activeTab === "acronyms" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
          {filteredAcronyms.map((acr, idx) => (
            <div
              key={idx}
              className="p-5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/40 rounded-2xl transition-all shadow-lg flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Shortcut Badge + Category + Sound */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-sky-500/20 border border-sky-500/40 text-sky-300 rounded-xl font-mono font-black text-sm dir-ltr tracking-wider">
                      {acr.short}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400 font-medium">
                      {acr.category}
                    </span>
                  </div>

                  <button
                    onClick={() => speakText(`acr-${idx}`, `${acr.short}. ${acr.fullEn}. ${acr.fullAr}`, "en-US")}
                    className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                      playingId === `acr-${idx}`
                        ? "bg-sky-500/20 border-sky-400 text-sky-300 animate-pulse"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                    title="استمع للنطق بالإنجليزية"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* English Full Name */}
                <div className="mb-2 text-left dir-ltr">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                    Full Name:
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-sky-200 font-mono leading-snug">
                    {acr.fullEn}
                  </h4>
                </div>

                {/* Arabic Name & Meaning */}
                <div className="mb-2.5 text-right">
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    المعنى والاسم بالعربية:
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-amber-300 leading-snug">
                    {acr.fullAr}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed pt-2 border-t border-slate-800/60">
                  {acr.descriptionAr}
                </p>
              </div>

              {acr.lessonRef && (
                <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>مرجع الدرس: {acr.lessonRef}</span>
                  <span className="text-sky-400 font-mono">اختصار معتمد</span>
                </div>
              )}
            </div>
          ))}

          {filteredAcronyms.length === 0 && (
            <div className="col-span-full text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              لا توجد اختصارات مطابقة لمعايير البحث الحالية.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

