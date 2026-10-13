import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpen, ClipboardCheck } from "lucide-react";
import {
  companionHref,
  getCompanionLesson,
  lessonHref,
  partHref,
  requireCompanion,
  staticParams,
  type PartRouteParams,
} from "@/content";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { LessonOfficialAssessments } from "@/components/quiz/LessonOfficialAssessments";

interface Props {
  params: Promise<PartRouteParams & { companionSlug: string; chapterId: string; lessonSlug: string }>;
}

export function generateStaticParams() {
  return staticParams.companionLessons();
}

function load(params: Awaited<Props["params"]>) {
  const { chapterId, lessonSlug, ...rest } = params;
  const { part, companion } = requireCompanion(rest);
  const index = companion.lessons.findIndex((l) => l.chapterId === chapterId && l.slug === lessonSlug);
  const ref = companion.lessons[index];
  const data = ref ? getCompanionLesson(part.key, companion.slug, ref.lessonId) : null;
  return { part, companion, ref, data, prev: companion.lessons[index - 1], next: companion.lessons[index + 1] };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { part, companion, ref } = load(await params);
  if (!ref) return { title: "الدرس غير موجود" };
  return {
    title: `${companion.title}: ${ref.title} (${ref.lessonNumber}) | ${part.bookTitle} — ${part.partShortTitle}`,
    description: `${ref.totalQuestions} سؤالًا رسميًا من ${companion.title} (ص ${ref.bookletPages}) على درس ${ref.title}.`,
  };
}

/** A companion-book lesson: same reading layout as the textbook lesson, with the official questions as its body. */
export default async function CompanionLessonPage({ params }: Props) {
  const { part, companion, ref, data, prev, next } = load(await params);
  if (!ref || !data) notFound();

  return (
    <article className="max-w-5xl mx-auto w-full px-3 sm:px-4 py-6 sm:py-8 space-y-6">
      <Breadcrumbs
        items={[
          { label: `${part.bookTitle} — ${part.partShortTitle}`, href: partHref(part.key) },
          { label: companion.title, href: companionHref(part.key, companion.slug) },
          { label: `الدرس ${ref.lessonNumber}` },
        ]}
      />

      <header className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-amber-500/15 text-amber-300 font-bold rounded-md border border-amber-500/30 flex items-center gap-1.5">
            <ClipboardCheck className="w-3.5 h-3.5" /> {companion.title}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">الدرس {ref.lessonNumber}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono text-[11px]">ص الكتيب {ref.bookletPages}</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 font-mono text-[11px]">ص الكتاب {ref.textbookPages}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">{ref.title}</h1>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">{ref.totalQuestions} سؤالًا</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">{ref.mcqCount} اختيار من متعدد</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800">{ref.essayCount} مقالي</span>
        </div>
        <Link
          href={lessonHref(part.key, ref.chapterId, ref.slug)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>شرح الدرس في الكتاب المدرسي</span>
        </Link>
      </header>

      <LessonOfficialAssessments lesson={{ number: ref.lessonNumber, title: ref.title }} assessments={data} />

      <footer className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6 border-t border-slate-800">
        {prev ? (
          <Link
            href={companionHref(part.key, companion.slug, prev.chapterId, prev.slug)}
            className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center gap-3 sm:max-w-[48%]"
          >
            <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="min-w-0">
              <span className="text-[11px] text-slate-500 block">الدرس السابق ({prev.lessonNumber})</span>
              <span className="text-xs sm:text-sm font-bold text-white truncate block">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            href={companionHref(part.key, companion.slug, next.chapterId, next.slug)}
            className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl flex items-center justify-end gap-3 text-left sm:max-w-[48%]"
          >
            <span className="min-w-0 text-right">
              <span className="text-[11px] text-slate-500 block">الدرس التالي ({next.lessonNumber})</span>
              <span className="text-xs sm:text-sm font-bold text-white truncate block">{next.title}</span>
            </span>
            <ArrowLeft className="w-4 h-4 text-amber-400 shrink-0" />
          </Link>
        )}
      </footer>
    </article>
  );
}
