"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import type { BookQuote, BookTable, IdeaStep, LessonStoryline } from "@/types/storyline";
import { ArrowDown, ArrowRight, BookOpen, Compass, Flag, HelpCircle } from "lucide-react";

interface Props {
  storyline: LessonStoryline;
  /** Route of the lesson this storyline belongs to. */
  lessonUrl: string;
}

function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      {text.split("\n").map((line, i) => (
        <p key={i}>{line}</p>
      ))}
    </div>
  );
}

/** علامة توضح أن المحتوى شرح إضافي وليس نص الكتاب */
function AuthoredTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[11px] font-bold text-amber-300/90 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md">
      {children}
    </span>
  );
}

function BookQuotes({ quotes }: { quotes: BookQuote[] }) {
  return (
    <ul className="space-y-2.5">
      {quotes.map((q, i) => (
        <li key={i} className="text-sm leading-relaxed text-slate-200">
          {q.label && <strong className="text-emerald-300 ml-1.5">{q.label}:</strong>}
          <span>{q.text}</span>
          <span className="mr-2 text-[11px] font-mono text-slate-500 whitespace-nowrap">(ص {q.page})</span>
        </li>
      ))}
    </ul>
  );
}

function BookTableView({ table }: { table: BookTable }) {
  return (
    <div className="space-y-1.5">
      <div className="overflow-x-auto rounded-xl border border-emerald-500/20">
        <table className="w-full min-w-[480px] text-right text-xs sm:text-sm">
          <thead className="bg-emerald-950/50 text-emerald-200">
            <tr>
              {table.headers.map((h, i) => (
                <th key={i} className="px-3 py-2 font-bold align-top">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {table.rows.map((row, r) => (
              <tr key={r} className="bg-slate-950/60">
                {row.map((cell, c) => (
                  <td key={c} className={`px-3 py-2 align-top leading-relaxed ${c === 0 ? "font-bold text-white" : "text-slate-300"}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11px] font-mono text-slate-500">جدول من الكتاب (ص {table.page})</p>
    </div>
  );
}

function StepCard({ step, index, total }: { step: IdeaStep; index: number; total: number }) {
  return (
    <article
      id={step.id}
      className="scroll-mt-24 rounded-3xl border border-slate-800 bg-slate-900/80 p-5 sm:p-7 space-y-5 shadow-xl"
    >
      {/* Title */}
      <header className="flex items-start gap-3">
        <span className="w-9 h-9 rounded-full bg-indigo-600 text-white text-sm font-black flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-slate-500">
            الخطوة {index + 1} من {total}
          </span>
          <h2 className="text-lg sm:text-xl font-black text-white leading-snug">{step.title}</h2>
        </div>
      </header>

      {/* The question this step answers */}
      <div className="flex items-start gap-2 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 px-4 py-3">
        <HelpCircle className="w-5 h-5 text-indigo-300 shrink-0 mt-0.5" />
        <p className="text-sm sm:text-base font-bold text-indigo-100">{step.question}</p>
      </div>

      {/* Simple explanation */}
      <div className="space-y-2">
        <AuthoredTag>💡 توضيح إضافي: الفكرة ببساطة</AuthoredTag>
        <Paragraphs text={step.explanation} className="text-sm sm:text-[15px] leading-loose text-slate-200" />
      </div>

      {/* From the book */}
      {(step.fromBook.length > 0 || step.bookTable) && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
            <BookOpen className="w-4 h-4" />
            <span>هكذا قالها الكتاب</span>
          </div>
          {step.fromBook.length > 0 && <BookQuotes quotes={step.fromBook} />}
          {step.bookTable && <BookTableView table={step.bookTable} />}
        </div>
      )}

      {/* Everyday example */}
      {step.example && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-950/10 p-4 space-y-2">
          <AuthoredTag>🔗 مثال من الواقع</AuthoredTag>
          <p className="text-sm leading-relaxed text-slate-200">{step.example}</p>
        </div>
      )}

      {/* Book term, named after the idea is understood */}
      {step.bookTerms && step.bookTerms.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-slate-400">اسمها في الكتاب:</span>
          {step.bookTerms.map((term) => (
            <span
              key={term.ar}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white"
            >
              {term.ar}
              {term.en && <span className="font-mono text-[11px] text-indigo-300 mr-1.5" dir="ltr">{term.en}</span>}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

/** الجملة التي تربط الخطوة بالتي تليها */
function Bridge({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 py-3 text-center">
      <ArrowDown className="w-5 h-5 text-indigo-400" />
      <p className="max-w-xl text-sm font-semibold text-indigo-200 bg-indigo-500/10 border border-indigo-500/25 rounded-2xl px-4 py-2 leading-relaxed">
        {text}
      </p>
      <ArrowDown className="w-5 h-5 text-indigo-400" />
    </div>
  );
}

export function StorylinePageContent({ storyline, lessonUrl }: Props) {
  const [readingProgress, setReadingProgress] = useState(0);
  const lessonHref = lessonUrl;
  const total = storyline.steps.length;

  useEffect(() => {
    const handleScroll = () => {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setReadingProgress(docHeight > 0 ? Math.min(100, Math.round((window.scrollY / docHeight) * 100)) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link
            href={lessonHref}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-3 py-2 rounded-xl border border-slate-700/80 transition-all"
          >
            <ArrowRight className="w-4 h-4 text-indigo-400" />
            <span>العودة لشرح الدرس</span>
          </Link>
          <span className="text-xs font-bold text-indigo-300 truncate">
            تسلسل الأفكار 🧭 • الدرس {storyline.lessonNumber}
          </span>
        </div>
        <div className="w-full h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-l from-indigo-500 to-emerald-400 transition-all duration-150"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-10">
        {/* Starting point */}
        <section className="rounded-3xl bg-gradient-to-b from-indigo-950/50 to-slate-900/60 border border-indigo-500/30 p-5 sm:p-8 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/40">
            <Compass className="w-4 h-4" />
            <span>تسلسل الأفكار • الدرس {storyline.lessonNumber}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">{storyline.title}</h1>

          <div className="space-y-2">
            <AuthoredTag>🚩 نقطة البداية</AuthoredTag>
            <p className="text-sm sm:text-base text-slate-200 leading-loose">{storyline.startingPoint}</p>
          </div>

          <div className="rounded-2xl bg-slate-950/60 border border-emerald-500/30 p-4 space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <BookOpen className="w-4 h-4" />
              <span>السؤال الرئيسي للدرس (من الكتاب، ص {storyline.keyQuestion.page})</span>
            </div>
            <p className="text-sm sm:text-base font-bold text-white leading-relaxed">{storyline.keyQuestion.text}</p>
          </div>
        </section>

        {/* Roadmap: the whole sequence at a glance */}
        <nav aria-label="خريطة الأفكار" className="mt-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-5 space-y-3">
          <h2 className="text-sm font-black text-white">خريطة الأفكار: سنمشي بهذا الترتيب</h2>
          <ol className="space-y-1.5">
            {storyline.steps.map((step, i) => (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => scrollTo(step.id)}
                  className="w-full flex items-center gap-2.5 text-right p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-indigo-300 text-[11px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-sm text-slate-200">{step.title}</span>
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => scrollTo("wrap-up")}
                className="w-full flex items-center gap-2.5 text-right p-2 rounded-xl hover:bg-slate-800/80 transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-emerald-900/60 text-emerald-300 flex items-center justify-center shrink-0">
                  <Flag className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm font-bold text-emerald-300">الخلاصة</span>
              </button>
            </li>
          </ol>
        </nav>

        {/* Steps, each linked to the next */}
        <div className="mt-8">
          {storyline.steps.map((step, i) => (
            <React.Fragment key={step.id}>
              <StepCard step={step} index={i} total={total} />
              {step.bridge ? <Bridge text={step.bridge} /> : <div className="h-6" />}
            </React.Fragment>
          ))}
        </div>

        {/* Wrap-up */}
        <section
          id="wrap-up"
          className="scroll-mt-24 rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900 to-emerald-950/20 p-5 sm:p-7 space-y-5"
        >
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg sm:text-xl font-black text-white">الخلاصة: الأفكار بالترتيب</h2>
          </div>

          <ol className="space-y-2.5">
            {storyline.wrapUp.chain.map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm sm:text-[15px] text-slate-200 leading-relaxed">{line}</span>
              </li>
            ))}
          </ol>

          <div className="rounded-2xl border border-emerald-500/30 bg-slate-950/60 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <BookOpen className="w-4 h-4" />
              <span>خلاصة الكتاب (ص {storyline.wrapUp.bookSummary.page})</span>
            </div>
            <Paragraphs text={storyline.wrapUp.bookSummary.text} className="text-sm text-white leading-relaxed" />
          </div>

          <Link
            href={lessonHref}
            className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>ارجع لنص الدرس وحل تدريباته</span>
          </Link>
        </section>
      </main>
    </div>
  );
}
