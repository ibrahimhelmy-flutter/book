"use client";

import React, { useState, useEffect } from "react";
import { CURRICULUM_DATA } from "@/data/curriculum";
import { GLOSSARY_DATA } from "@/data/glossary";
import { ACRONYMS_DATA } from "@/data/acronyms";
import { Search, X, BookOpen, Layers, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!isOpen) return null;

  const filteredLessons = CURRICULUM_DATA.flatMap((ch) =>
    ch.lessons
      .filter(
        (l) =>
          l.title.includes(query) ||
          l.englishTitle.toLowerCase().includes(query.toLowerCase()) ||
          l.coreIdea.includes(query) ||
          l.keyConcepts.some((k) => k.termAr.includes(query) || (k.termEn && k.termEn.toLowerCase().includes(query.toLowerCase())))
      )
      .map((l) => ({ ...l, chapterTitle: ch.title }))
  );

  const filteredGlossary = GLOSSARY_DATA.filter(
    (g) =>
      g.termAr.includes(query) ||
      g.termEn.toLowerCase().includes(query.toLowerCase()) ||
      g.definitionAr.includes(query)
  );

  const filteredAcronyms = ACRONYMS_DATA.filter(
    (a) =>
      a.short.toLowerCase().includes(query.toLowerCase()) ||
      a.fullEn.toLowerCase().includes(query.toLowerCase()) ||
      a.fullAr.includes(query) ||
      a.descriptionAr.includes(query)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Search Header */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-indigo-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الدروس والمفاهيم والمصطلحات (عربي أو إنجليزي)..."
            className="flex-1 bg-transparent text-sm sm:text-base text-white focus:outline-none placeholder:text-slate-500"
          />
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {query.trim() === "" ? (
            <div className="text-center py-10 text-xs text-slate-500">
              اكتب كلمة للبحث في فهرس المنهج، المصطلحات، وقواعد الأمن السيبراني والذكاء الاصطناعي...
            </div>
          ) : (
            <>
              {/* Lessons matches */}
              {filteredLessons.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block mb-2 px-2">
                    الدروس المطابقة ({filteredLessons.length}):
                  </span>
                  <div className="space-y-1.5">
                    {filteredLessons.map((l) => (
                      <Link
                        key={l.id}
                        href={`/chapters/${l.chapterId}/${l.slug}`}
                        onClick={onClose}
                        className="p-3 bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl flex items-center justify-between group transition-all block"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-mono rounded">
                              {l.number}
                            </span>
                            <span className="text-xs font-bold text-white group-hover:text-indigo-300">
                              {l.title}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{l.coreIdea}</p>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:-translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Acronyms / Shortcuts matches */}
              {filteredAcronyms.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-sky-400 uppercase tracking-wider block mb-2 px-2 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-sky-400" />
                    المختصرات والرموز التقنية ({filteredAcronyms.length}):
                  </span>
                  <div className="space-y-1.5">
                    {filteredAcronyms.map((a, idx) => (
                      <div key={idx} className="p-3 bg-slate-950/70 border border-sky-500/30 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 font-mono font-bold rounded-md">
                            {a.short}
                          </span>
                          <span className="text-[11px] font-mono text-sky-200 font-semibold dir-ltr">
                            {a.fullEn}
                          </span>
                        </div>
                        <p className="text-amber-300 font-bold text-xs">{a.fullAr}</p>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{a.descriptionAr}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Glossary matches */}
              {filteredGlossary.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wider block mb-2 px-2">
                    المصطلحات والمفاهيم ({filteredGlossary.length}):
                  </span>
                  <div className="space-y-1.5">
                    {filteredGlossary.map((g) => (
                      <div key={g.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-white font-bold">{g.termAr}</strong>
                          <span className="text-[10px] font-mono text-slate-400 dir-ltr">{g.termEn}</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed">{g.definitionAr}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredLessons.length === 0 && filteredGlossary.length === 0 && filteredAcronyms.length === 0 && (
                <div className="text-center py-8 text-xs text-slate-400">
                  لم يتم العثور على نتائج تطابق: "{query}"
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
