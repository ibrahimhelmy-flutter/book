"use client";

import React, { useState, useRef, useEffect } from "react";
import { Book } from "@/types";
import { getAllBooks, CURRENT_BOOK, getBookStats } from "@/data/books";
import { BookOpen, ChevronDown, Check, Sparkles, Layers, GraduationCap } from "lucide-react";
import Link from "next/link";

interface BookSelectorProps {
  currentBookId?: string;
  onSelectBook?: (bookId: string) => void;
  className?: string;
  variant?: "navbar" | "card" | "compact";
}

export function BookSelector({
  currentBookId = CURRENT_BOOK.id,
  onSelectBook,
  className = "",
  variant = "navbar",
}: BookSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const books = getAllBooks();
  const activeBook = books.find((b) => b.id === currentBookId) || CURRENT_BOOK;
  const activeStats = getBookStats(activeBook);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (books.length <= 1 && variant === "compact") {
    return (
      <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700 font-mono">
        {activeBook.grade}
      </span>
    );
  }

  return (
    <div className={`relative inline-block text-right ${className}`} ref={dropdownRef} dir="rtl">
      {/* Trigger Button */}
      {variant === "navbar" && (
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all cursor-pointer group"
          title="اختيار الكتاب أو المنهاج الدراسي"
        >
          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
          <span className="truncate max-w-[140px] sm:max-w-[200px]">{activeBook.grade}</span>
          <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      )}

      {variant === "card" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-slate-400 font-mono">{activeBook.grade} • {activeBook.term}</span>
              <h4 className="text-sm font-bold text-white">{activeBook.title}</h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>تغيير الكتاب ({books.length})</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-950/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1.5">
          <div className="px-3 py-2 border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>المناهج والكتب الدراسية المتاحة:</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              {books.length} كتاب
            </span>
          </div>

          <div className="space-y-1 max-h-72 overflow-y-auto custom-scrollbar">
            {books.map((book) => {
              const isSelected = book.id === activeBook.id;
              const stats = getBookStats(book);

              return (
                <div
                  key={book.id}
                  onClick={() => {
                    if (onSelectBook) onSelectBook(book.id);
                    setIsOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? "bg-indigo-950/70 border-indigo-500/50 shadow-md shadow-indigo-950/40"
                      : "bg-slate-900/60 hover:bg-slate-800/80 border-slate-800/80"
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{book.title}</span>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                          الحالي
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {book.grade} • {book.term}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-0.5">
                      <span>{stats.totalChapters} فصول</span>
                      <span>•</span>
                      <span>{stats.totalLessons} درساً</span>
                      <span>•</span>
                      <span>{stats.totalSimulators} محاكيات</span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
