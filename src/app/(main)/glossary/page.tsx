"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { GLOSSARY_DATA } from "@/data/glossary";
import { ACRONYMS_DATA } from "@/data/acronyms";
import { CURRICULUM_DATA } from "@/data/curriculum";
import {
  BookA,
  Search,
  Volume2,
  VolumeX,
  Zap,
  Layers,
  BookOpen,
  Check,
  Star,
  Copy,
  CheckCheck,
  RotateCcw,
  X,
  LayoutGrid,
  List,
  Brain,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";

import { matchesSearch } from "@/lib/arabic";
import { GlossaryTerm } from "@/types";

type CategoryFilter = "ALL" | "AI" | "Cybersecurity" | "WebDev" | "Design" | "General" | "Hardware" | "Networking";
type ActiveTab = "terms" | "acronyms";
type ViewMode = "grid" | "compact" | "flashcards";

export default function GlossaryPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("terms");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("ALL");

  // Filtering by Unit(s) and Lesson(s)
  const [selectedChapters, setSelectedChapters] = useState<string[]>([]); // Empty = ALL
  const [selectedLessons, setSelectedLessons] = useState<string[]>([]); // Empty = ALL within selected chapters

  // View modes & interactivity
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [onlyBookmarked, setOnlyBookmarked] = useState<boolean>(false);

  // Flashcards mode state
  const [flashcardIndex, setFlashcardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Load bookmarks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("glossary_bookmarks_v1");
      if (saved) {
        setBookmarkedIds(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setBookmarkedIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("glossary_bookmarks_v1", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Category list metadata
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

  // Helper Maps for Chapters & Lessons metadata
  const chapterMap = useMemo(() => {
    const map: Record<string, { title: string; number: number; colorTheme: string }> = {};
    CURRICULUM_DATA.forEach((chap) => {
      map[chap.id] = {
        title: chap.title,
        number: chap.number,
        colorTheme: chap.colorTheme || "",
      };
    });
    return map;
  }, []);

  const lessonMap = useMemo(() => {
    const map: Record<string, { title: string; number: string; chapterId: string; pageRange: string }> = {};
    CURRICULUM_DATA.forEach((chap) => {
      chap.lessons.forEach((l) => {
        map[l.number] = {
          title: l.title,
          number: l.number,
          chapterId: chap.id,
          pageRange: l.pageRange,
        };
      });
    });
    return map;
  }, []);

  // Term counts for each chapter & lesson
  const chapterTermCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    GLOSSARY_DATA.forEach((t) => {
      counts[t.chapterId] = (counts[t.chapterId] || 0) + 1;
    });
    return counts;
  }, []);

  const lessonTermCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    GLOSSARY_DATA.forEach((t) => {
      counts[t.lessonNumber] = (counts[t.lessonNumber] || 0) + 1;
    });
    return counts;
  }, []);

  // Available lessons list (filtered by selected chapters if any)
  const availableLessons = useMemo(() => {
    const lessons: { id: string; number: string; title: string; chapterId: string; chapterNumber: number }[] = [];
    CURRICULUM_DATA.forEach((chap) => {
      if (selectedChapters.length === 0 || selectedChapters.includes(chap.id)) {
        chap.lessons.forEach((l) => {
          lessons.push({
            id: l.id,
            number: l.number,
            title: l.title,
            chapterId: chap.id,
            chapterNumber: chap.number,
          });
        });
      }
    });
    return lessons;
  }, [selectedChapters]);

  // Unit toggle handler (multi-select)
  const toggleChapter = (chapterId: string) => {
    setSelectedChapters((prev) => {
      let updated: string[];
      if (prev.includes(chapterId)) {
        updated = prev.filter((id) => id !== chapterId);
      } else {
        updated = [...prev, chapterId];
      }
      // Clean up lessons that don't belong to updated chapters
      if (updated.length > 0) {
        setSelectedLessons((prevLessons) =>
          prevLessons.filter((num) => {
            const lessonMeta = lessonMap[num];
            return lessonMeta && updated.includes(lessonMeta.chapterId);
          })
        );
      }
      return updated;
    });
  };

  // Lesson toggle handler (multi-select)
  const toggleLesson = (lessonNumber: string) => {
    setSelectedLessons((prev) => {
      if (prev.includes(lessonNumber)) {
        return prev.filter((num) => num !== lessonNumber);
      } else {
        const lessonMeta = lessonMap[lessonNumber];
        if (lessonMeta && selectedChapters.length > 0 && !selectedChapters.includes(lessonMeta.chapterId)) {
          setSelectedChapters((prevChaps) => [...prevChaps, lessonMeta.chapterId]);
        }
        return [...prev, lessonNumber];
      }
    });
  };

  // Reset all filters to "الكل"
  const resetAllFilters = () => {
    setSelectedChapters([]);
    setSelectedLessons([]);
    setSelectedCategory("ALL");
    setSearchTerm("");
    setOnlyBookmarked(false);
    setFlashcardIndex(0);
    setIsFlipped(false);
  };

  // Select all lessons for currently active units
  const selectAllActiveLessons = () => {
    setSelectedLessons(availableLessons.map((l) => l.number));
  };

  // Clear lesson selections only
  const clearLessonSelections = () => {
    setSelectedLessons([]);
  };

  // Filtering Glossary Terms
  const filteredTerms = useMemo(() => {
    return GLOSSARY_DATA.filter((item) => {
      const matchesChapter =
        selectedChapters.length === 0 || selectedChapters.includes(item.chapterId);
      const matchesLesson =
        selectedLessons.length === 0 || selectedLessons.includes(item.lessonNumber);
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      const matchesBookmark = !onlyBookmarked || bookmarkedIds.includes(item.id);
      const termMatches =
        matchesSearch(item.termAr, searchTerm) ||
        matchesSearch(item.termEn, searchTerm) ||
        matchesSearch(item.definitionAr, searchTerm) ||
        (item.definitionEn ? matchesSearch(item.definitionEn, searchTerm) : false);

      return matchesChapter && matchesLesson && matchesCategory && matchesBookmark && termMatches;
    });
  }, [selectedChapters, selectedLessons, selectedCategory, onlyBookmarked, bookmarkedIds, searchTerm]);

  // Filtering Acronyms
  const filteredAcronyms = useMemo(() => {
    return ACRONYMS_DATA.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      const acronymMatches =
        matchesSearch(item.short, searchTerm) ||
        matchesSearch(item.fullEn, searchTerm) ||
        matchesSearch(item.fullAr, searchTerm) ||
        matchesSearch(item.descriptionAr, searchTerm);
      return matchesCategory && acronymMatches;
    });
  }, [selectedCategory, searchTerm]);

  // Reset flashcard index if terms change
  useEffect(() => {
    setFlashcardIndex(0);
    setIsFlipped(false);
  }, [selectedChapters, selectedLessons, selectedCategory, onlyBookmarked, searchTerm]);

  // Audio Pronunciation
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

  // Copy to clipboard
  const handleCopy = (term: GlossaryTerm) => {
    const chapterName = chapterMap[term.chapterId]?.title || "";
    const lessonName = lessonMap[term.lessonNumber]?.title || "";
    const primaryPage = term.source?.primaryPage ? `صفحة ${term.source.primaryPage}` : "";
    const textToCopy = `المصطلح: ${term.termAr} (${term.termEn})
التعريف العلمي: ${term.definitionAr}${term.definitionEn ? `\nDefinition: ${term.definitionEn}` : ""}
الوحدة: ${chapterName}
الدرس: ${term.lessonNumber} - ${lessonName}
${primaryPage ? `الكتاب المدرسي: ${primaryPage}` : ""}`.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(term.id);
    setTimeout(() => {
      setCopiedId((curr) => (curr === term.id ? null : curr));
    }, 2000);
  };

  const getCategoryLabel = (catId: string) => {
    const found = categories.find((c) => c.id === catId);
    return found ? found.label.replace(/\s*\(.*?\)/, "") : catId;
  };

  const hasActiveFilters =
    selectedChapters.length > 0 ||
    selectedLessons.length > 0 ||
    selectedCategory !== "ALL" ||
    searchTerm.trim() !== "" ||
    onlyBookmarked;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6">
      {/* ========================================================================= */}
      {/* 1. Header Banner */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-xl mb-6">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-mono text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2.5 py-0.5 rounded-full w-fit">
              <BookA className="w-3.5 h-3.5" />
              <span>المعجم الأكاديمي المعتمد</span>
            </div>

            {bookmarkedIds.length > 0 && (
              <button
                onClick={() => setOnlyBookmarked(!onlyBookmarked)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                  onlyBookmarked
                    ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/30"
                    : "bg-slate-800/80 hover:bg-slate-800 text-amber-400 border-amber-500/30"
                }`}
              >
                <Star className={`w-3.5 h-3.5 ${onlyBookmarked ? "fill-slate-950" : "fill-amber-400"}`} />
                <span>المفضلة للمراجعة ({bookmarkedIds.length})</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                قاموس المصطلحات والمفاهيم
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
                المصطلحات والمفاهيم العلمية المقررة، مع التعريف المعتمد، إمكانية النطق، والفلترة حسب الوحدات والدروس.
              </p>
            </div>

            {/* Tab Selector: Terms vs Acronyms */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <button
                onClick={() => setActiveTab("terms")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "terms"
                    ? "bg-pink-600 text-white shadow-md shadow-pink-600/30 font-extrabold"
                    : "bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <BookA className="w-3.5 h-3.5" />
                <span>المصطلحات ({GLOSSARY_DATA.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("acronyms")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "acronyms"
                    ? "bg-sky-600 text-white shadow-md shadow-sky-600/30 font-extrabold"
                    : "bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>الاختصارات ({ACRONYMS_DATA.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. Filter Center */}
      {/* ========================================================================= */}
      {activeTab === "terms" && (
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4 sm:p-5 shadow-xl mb-6 space-y-4">
          {/* Top Row: Search Input + View Mode Switcher */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث بالاسم العربي أو الإنجليزي أو داخل التعريف..."
                className="w-full pr-10 pl-9 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500 placeholder:text-slate-500 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                  title="مسح البحث"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* View Mode Controls */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 self-end sm:self-auto">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-pink-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
                title="عرض بطاقات"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>بطاقات</span>
              </button>

              <button
                onClick={() => setViewMode("compact")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "compact"
                    ? "bg-pink-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
                title="عرض قائمة مدمجة"
              >
                <List className="w-3.5 h-3.5" />
                <span>قائمة</span>
              </button>

              <button
                onClick={() => setViewMode("flashcards")}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "flashcards"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                }`}
                title="بطاقات الحفظ والمراجعة"
              >
                <Brain className="w-3.5 h-3.5 text-purple-300" />
                <span>حفظ</span>
              </button>
            </div>
          </div>

          {/* Unit Filter (الوحدة أو أكثر من وحدة + الكل) */}
          <div className="space-y-2 pt-3 border-t border-slate-800/70">
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <Layers className="w-3.5 h-3.5 text-pink-400" />
                <span>الوحدات الدراسية:</span>
                <span className="text-[11px] text-slate-400 font-normal">(اختر وحدة أو أكثر)</span>
              </div>

              {selectedChapters.length > 0 && (
                <button
                  onClick={() => setSelectedChapters([])}
                  className="text-[11px] text-pink-400 hover:text-pink-300 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>عرض الكل</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* Button: All Units (الكل) */}
              <button
                onClick={() => setSelectedChapters([])}
                className={`px-3 py-2 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between ${
                  selectedChapters.length === 0
                    ? "bg-pink-600 text-white border-pink-500 shadow-md shadow-pink-600/20 font-bold"
                    : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800"
                }`}
              >
                <span className="text-xs font-bold">الكل</span>
                <span className="text-[10px] font-mono opacity-80">{GLOSSARY_DATA.length}</span>
              </button>

              {/* Units List */}
              {CURRICULUM_DATA.map((chapter) => {
                const isSelected = selectedChapters.includes(chapter.id);
                const count = chapterTermCounts[chapter.id] || 0;
                return (
                  <button
                    key={chapter.id}
                    onClick={() => toggleChapter(chapter.id)}
                    className={`px-3 py-2 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between min-w-0 ${
                      isSelected
                        ? "bg-pink-600/20 border-pink-500 text-pink-200 font-bold ring-1 ring-pink-500/50"
                        : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800"
                    }`}
                  >
                    <span className="text-xs truncate" title={chapter.title}>
                      و{chapter.number}: {chapter.title}
                    </span>
                    <span className="text-[10px] font-mono opacity-80 mr-1 flex-shrink-0">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lessons Filter (الدرس أو أكثر من درس) */}
          <div className="space-y-2 pt-3 border-t border-slate-800/70">
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span>الدروس:</span>
                <span className="text-[11px] text-slate-400 font-normal">
                  {selectedChapters.length > 0 ? `(دروس الوحدات المختارة)` : `(اختر درساً أو أكثر)`}
                </span>
              </div>

              {selectedLessons.length > 0 ? (
                <button
                  onClick={clearLessonSelections}
                  className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors cursor-pointer flex items-center gap-1 font-semibold"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>كل دروس الوحدة</span>
                </button>
              ) : (
                <button
                  onClick={selectAllActiveLessons}
                  className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  تحديد كل الدروس
                </button>
              )}
            </div>

            {/* Lessons Pills Grid */}
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              <button
                onClick={clearLessonSelections}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  selectedLessons.length === 0
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <span>الكل</span>
              </button>

              {availableLessons.map((lesson) => {
                const isSelected = selectedLessons.includes(lesson.number);
                const count = lessonTermCounts[lesson.number] || 0;
                return (
                  <button
                    key={lesson.id}
                    onClick={() => toggleLesson(lesson.number)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] transition-all cursor-pointer flex items-center gap-1.5 border ${
                      isSelected
                        ? "bg-sky-500/20 border-sky-400 text-sky-200 font-bold ring-1 ring-sky-400/40"
                        : "bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800"
                    }`}
                  >
                    <span className="font-mono text-sky-400 font-bold">{lesson.number}</span>
                    <span className="truncate max-w-[140px]" title={lesson.title}>
                      {lesson.title}
                    </span>
                    <span className="text-[10px] opacity-70 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Filters Summary Bar */}
          {hasActiveFilters && (
            <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-500 font-medium">الفلاتر:</span>

                {selectedChapters.map((chapId) => {
                  const chap = chapterMap[chapId];
                  return (
                    <span
                      key={chapId}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-pink-500/15 text-pink-300 border border-pink-500/30"
                    >
                      <span>و{chap?.number || chapId}</span>
                      <button onClick={() => toggleChapter(chapId)} className="hover:text-white">
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  );
                })}

                {selectedLessons.map((num) => (
                  <span
                    key={num}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-sky-500/15 text-sky-300 border border-sky-500/30"
                  >
                    <span>درس {num}</span>
                    <button onClick={() => toggleLesson(num)} className="hover:text-white">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                ))}

                {selectedCategory !== "ALL" && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    <span>{getCategoryLabel(selectedCategory)}</span>
                    <button onClick={() => setSelectedCategory("ALL")} className="hover:text-white">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {searchTerm && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                    <span>"{searchTerm}"</span>
                    <button onClick={() => setSearchTerm("")} className="hover:text-white">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}

                {onlyBookmarked && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    <Star className="w-2.5 h-2.5 fill-amber-400" />
                    <span>المفضلة</span>
                    <button onClick={() => setOnlyBookmarked(false)} className="hover:text-white">
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">
                  <span className="text-pink-400 font-mono font-bold">{filteredTerms.length}</span> من{" "}
                  <span className="font-mono">{GLOSSARY_DATA.length}</span>
                </span>
                <button
                  onClick={resetAllFilters}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] transition-all cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>مسح</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. View 1: Main Glossary Terms */}
      {/* ========================================================================= */}
      {activeTab === "terms" && (
        <>
          {/* 3A: Grid View - Compact, Focused on Name & Definition */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fadeIn">
              {filteredTerms.map((term, idx) => {
                const chapterMeta = chapterMap[term.chapterId];
                const isBookmarked = bookmarkedIds.includes(term.id);
                const isCopied = copiedId === term.id;
                const isPlaying = playingId === term.id;

                return (
                  <div
                    key={`${term.id}-${term.chapterId || idx}`}
                    className="bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-4 transition-all hover:shadow-lg flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header: Term Name (Ar + En) + Subtle Discreet Actions */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-black text-white group-hover:text-pink-300 transition-colors leading-snug">
                            {term.termAr}
                          </h3>
                          {term.termEn && (
                            <span className="text-[11px] font-mono text-slate-400 dir-ltr text-right block mt-0.5">
                              {term.termEn}
                            </span>
                          )}
                        </div>

                        {/* Discrete Actions (Low visual footprint to focus on the term) */}
                        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          {/* Audio Pronunciation Button */}
                          <button
                            onClick={() =>
                              speakText(term.id, `${term.termAr}. ${term.definitionAr}`, "ar-SA")
                            }
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isPlaying
                                ? "bg-pink-500/20 border-pink-500 text-pink-300 animate-pulse"
                                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                            }`}
                            title={isPlaying ? "إيقاف" : "نطق بالعربية"}
                          >
                            {isPlaying ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>

                          {/* Pronounce English Term */}
                          {term.termEn && (
                            <button
                              onClick={() => speakText(`${term.id}-en`, term.termEn, "en-US")}
                              className={`px-1.5 py-1 rounded-lg border text-[10px] font-mono transition-all cursor-pointer ${
                                playingId === `${term.id}-en`
                                  ? "bg-sky-500/20 border-sky-400 text-sky-300"
                                  : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                              }`}
                              title="نطق بالإنجليزية"
                            >
                              EN
                            </button>
                          )}

                          {/* Quick Copy Button */}
                          <button
                            onClick={() => handleCopy(term)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isCopied
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-300"
                                : "bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700"
                            }`}
                            title="نسخ"
                          >
                            {isCopied ? <CheckCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {/* Bookmark Button */}
                          <button
                            onClick={() => toggleBookmark(term.id)}
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
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal mt-2">
                        {term.definitionAr}
                      </p>

                      {term.definitionEn && (
                        <p className="text-[11px] text-slate-500 italic mt-1.5 dir-ltr text-left font-sans">
                          {term.definitionEn}
                        </p>
                      )}
                    </div>

                    {/* Discreet Bottom Bar: Small, Subtle, Out of the way */}
                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <span>و{chapterMeta?.number || term.chapterId}</span>
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
              })}

              {/* Empty State */}
              {filteredTerms.length === 0 && (
                <div className="col-span-full text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 space-y-3">
                  <div className="w-12 h-12 bg-slate-800/80 rounded-full flex items-center justify-center mx-auto text-slate-500">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-white">لا توجد مصطلحات مطابقة للفلترة الحالية</h3>
                  <button
                    onClick={resetAllFilters}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-pink-600/30 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>إعادة ضبط الفلاتر (عرض الكل)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 3B: Compact List View */}
          {viewMode === "compact" && (
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
                    {filteredTerms.map((term, idx) => {
                      const chapterMeta = chapterMap[term.chapterId];
                      const isBookmarked = bookmarkedIds.includes(term.id);
                      const isCopied = copiedId === term.id;
                      const isPlaying = playingId === term.id;

                      return (
                        <tr key={term.id} className="hover:bg-slate-800/50 transition-colors">
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500 text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-white text-xs">{term.termAr}</div>
                            <div className="text-[10px] font-mono text-slate-400 dir-ltr text-right">
                              {term.termEn}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 leading-relaxed text-slate-300 text-xs">
                            {term.definitionAr}
                          </td>
                          <td className="py-2.5 px-3 text-[11px] text-slate-400">
                            <div>و{chapterMeta?.number || term.chapterId} • درس {term.lessonNumber}</div>
                            {term.source?.primaryPage && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                ص {term.source.primaryPage}
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() =>
                                  speakText(term.id, `${term.termAr}. ${term.definitionAr}`, "ar-SA")
                                }
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
                                onClick={() => handleCopy(term)}
                                className="p-1 rounded border bg-slate-950 border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                                title="نسخ"
                              >
                                {isCopied ? <CheckCheck className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                              <button
                                onClick={() => toggleBookmark(term.id)}
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
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3C: Flashcards Study Mode */}
          {viewMode === "flashcards" && (
            <div className="max-w-xl mx-auto py-4 animate-fadeIn">
              {filteredTerms.length > 0 ? (
                (() => {
                  const currentTerm = filteredTerms[flashcardIndex] || filteredTerms[0];
                  const chapterMeta = chapterMap[currentTerm.chapterId];
                  const isBookmarked = bookmarkedIds.includes(currentTerm.id);

                  return (
                    <div className="space-y-4">
                      {/* Top Controls */}
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-mono text-white font-bold">
                          {flashcardIndex + 1} / {filteredTerms.length}
                        </span>

                        <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-300"
                            style={{
                              width: `${((flashcardIndex + 1) / filteredTerms.length) * 100}%`,
                            }}
                          />
                        </div>

                        <button
                          onClick={() => {
                            const rand = Math.floor(Math.random() * filteredTerms.length);
                            setFlashcardIndex(rand);
                            setIsFlipped(false);
                          }}
                          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-[11px]"
                        >
                          <Shuffle className="w-3 h-3" />
                          <span>عشوائي</span>
                        </button>
                      </div>

                      {/* Flashcard */}
                      <div
                        onClick={() => setIsFlipped(!isFlipped)}
                        className="min-h-[260px] bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 shadow-xl cursor-pointer flex flex-col justify-between transition-all select-none"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/60 pb-2">
                          <span>و{chapterMeta?.number || currentTerm.chapterId} • درس {currentTerm.lessonNumber}</span>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => toggleBookmark(currentTerm.id)}
                              className="p-1 rounded text-slate-500 hover:text-amber-400"
                            >
                              <Star className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                            </button>
                            <button
                              onClick={() =>
                                speakText(
                                  currentTerm.id,
                                  isFlipped ? currentTerm.definitionAr : currentTerm.termAr,
                                  "ar-SA"
                                )
                              }
                              className="p-1 rounded text-slate-400 hover:text-white"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="py-6 text-center">
                          {!isFlipped ? (
                            <div className="space-y-2">
                              <h2 className="text-2xl sm:text-3xl font-black text-white">
                                {currentTerm.termAr}
                              </h2>
                              <p className="text-sm font-mono text-slate-400 dir-ltr">
                                {currentTerm.termEn}
                              </p>
                              <span className="inline-block mt-4 text-xs text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
                                انقر لكشف التعريف
                              </span>
                            </div>
                          ) : (
                            <div className="space-y-2 text-right">
                              <div className="text-[11px] text-slate-400 font-bold mb-1">
                                {currentTerm.termAr}:
                              </div>
                              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                                {currentTerm.definitionAr}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="text-[10px] text-slate-500 text-center border-t border-slate-800/60 pt-2">
                          انقر لقلب البطاقة
                        </div>
                      </div>

                      {/* Nav Controls */}
                      <div className="flex items-center justify-between gap-3">
                        <button
                          onClick={() => {
                            setFlashcardIndex((prev) => Math.max(0, prev - 1));
                            setIsFlipped(false);
                          }}
                          disabled={flashcardIndex === 0}
                          className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                          <span>السابق</span>
                        </button>

                        <button
                          onClick={() => setIsFlipped(!isFlipped)}
                          className="py-2 px-4 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/40 rounded-xl text-xs font-bold text-purple-200 transition-all cursor-pointer"
                        >
                          {isFlipped ? "إخفاء التعريف" : "كشف التعريف"}
                        </button>

                        <button
                          onClick={() => {
                            setFlashcardIndex((prev) => Math.min(filteredTerms.length - 1, prev + 1));
                            setIsFlipped(false);
                          }}
                          disabled={flashcardIndex === filteredTerms.length - 1}
                          className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>التالي</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : null}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* 4. View 2: Acronyms & Technical Shortcuts */}
      {/* ========================================================================= */}
      {activeTab === "acronyms" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-fadeIn">
          {filteredAcronyms.map((acr, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 rounded-2xl transition-all shadow-md flex flex-col justify-between group"
            >
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
                    onClick={() => speakText(`acr-${idx}`, `${acr.short}. ${acr.fullEn}. ${acr.fullAr}`, "en-US")}
                    className={`p-1 rounded border transition-all cursor-pointer ${
                      playingId === `acr-${idx}`
                        ? "bg-sky-500/20 border-sky-400 text-sky-300"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                    title="استمع للنطق"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mb-1 text-left dir-ltr">
                  <h4 className="text-xs font-bold text-sky-200 font-mono leading-tight">
                    {acr.fullEn}
                  </h4>
                </div>

                <div className="mb-2 text-right">
                  <p className="text-xs font-bold text-amber-300 leading-snug">
                    {acr.fullAr}
                  </p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pt-1.5 border-t border-slate-800/50">
                  {acr.descriptionAr}
                </p>
              </div>

              {acr.lessonRef && (
                <div className="mt-3 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[10px] text-slate-500">
                  <span>مرجع: {acr.lessonRef}</span>
                  <span className="text-sky-400 font-mono">اختصار معتمد</span>
                </div>
              )}
            </div>
          ))}

          {filteredAcronyms.length === 0 && (
            <div className="col-span-full text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              لا توجد اختصارات مطابقة لمعايير البحث الحالية.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
