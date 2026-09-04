"use client";

import React, { useState, useEffect } from "react";
import { Book } from "@/core/domain/entities/Book";
import { getExamEngineContainer } from "@/core/infrastructure/bootstrap";
import { BookOpen, ChevronDown, Check, Plus } from "lucide-react";

interface BookSelectorProps {
  selectedBookId: string;
  onSelectBook: (bookId: string) => void;
  onOpenImportModal?: () => void;
}

export function EngineBookSelector({
  selectedBookId,
  onSelectBook,
  onOpenImportModal,
}: BookSelectorProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const container = getExamEngineContainer();
    container.bookRepository.getAll().then((bList) => setBooks(bList));
  }, []);

  const selectedBook = books.find((b) => b.id === selectedBookId) || books[0];

  return (
    <div className="relative inline-block text-right w-full sm:w-auto">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl border border-slate-700 shadow-md transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-bold cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate max-w-[220px] sm:max-w-[320px]">
              {selectedBook ? selectedBook.title : "اختر الكتاب المدرسي..."}
            </span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {onOpenImportModal && (
          <button
            type="button"
            onClick={onOpenImportModal}
            className="px-3.5 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 rounded-2xl border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="استيراد كتاب جديد (Import New Book)"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">إضافة كتاب جديد</span>
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-40 space-y-1 animate-fadeIn">
            <div className="px-3 py-2 text-[11px] font-mono text-slate-400 border-b border-slate-800/80">
              الكتب والمناهج الدراسية المسجلة بالمنظومة ({books.length})
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-1">
              {books.map((b) => {
                const isSelected = b.id === selectedBook?.id;
                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      onSelectBook(b.id);
                      setIsOpen(false);
                    }}
                    className={`p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 text-xs ${
                      isSelected
                        ? "bg-indigo-600 text-white font-bold shadow-md"
                        : "text-slate-300 hover:bg-slate-900 hover:text-white"
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="truncate font-semibold">{b.title}</div>
                      <div className={`text-[11px] ${isSelected ? "text-indigo-200" : "text-slate-400"}`}>
                        {b.gradeNameAr} • {b.chapters.length} فصول
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 shrink-0" />}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
