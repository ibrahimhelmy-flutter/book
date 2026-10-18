import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Layers } from "lucide-react";
import { chapterHref, getLesson, lessonHref, partHref, requirePart, staticParams, type PartRouteParams } from "@/content";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { ChapterQuestionBank } from "@/components/quiz/ChapterQuestionBank";
import { breadcrumbJsonLd, pageMetadata, partTrail } from "@/lib/seo";

interface Props {
  params: Promise<PartRouteParams & { chapterId: string }>;
}

export function generateStaticParams() {
  return staticParams.chapters();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chapterId, ...ref } = await params;
  const part = requirePart(ref);
  const chapter = part.chapters.find((c) => c.id === chapterId);
  if (!chapter) return { title: "الفصل غير موجود" };
  return pageMetadata({
    title: `${chapter.title} - الفصل ${chapter.number} | ${part.bookTitle} — ${part.partShortTitle}`,
    description: chapter.description,
    path: chapterHref(part.key, chapter.id),
  });
}

export default async function ChapterOverviewPage({ params }: Props) {
  const { chapterId, ...ref } = await params;
  const part = requirePart(ref);
  const chapter = part.chapters.find((c) => c.id === chapterId);
  if (!chapter) notFound();
  const lessons = chapter.lessons.map((l) => getLesson(part.key, l.id)!).filter(Boolean);
  const reviewCount = part.deepQuestionCounts[`${chapter.number}-review`] || 0;

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8">
      <JsonLd data={breadcrumbJsonLd([...partTrail(part), { name: `الفصل ${chapter.number}: ${chapter.title}`, path: chapterHref(part.key, chapter.id) }])} />
      <div className="mb-4">
        <Breadcrumbs items={[{ label: `${part.bookTitle} — ${part.partShortTitle}`, href: partHref(part.key) }, { label: `الفصل ${chapter.number}` }]} />
      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-2xl mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-2">
          <span>الفصل الدراسي {chapter.number}</span>
          <span>•</span>
          <span>
            الصفحات من {chapter.pageStart} إلى {chapter.pageEnd}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-3">{chapter.title}</h1>
        <p className="text-sm font-mono text-slate-400 mb-4 dir-ltr text-right">{chapter.englishTitle}</p>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">{chapter.description}</p>
        {lessons[0] && (
          <Link
            href={lessonHref(part.key, chapter.id, lessons[0].slug)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25"
          >
            <span>بدء دراسة الفصل ({lessons[0].title})</span>
            <ArrowLeft className="w-4 h-4" />
          </Link>
        )}
      </div>

      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-indigo-400" />
        <span>قائمة دروس الفصل {chapter.number}:</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={lessonHref(part.key, chapter.id, lesson.slug)}
            className="p-6 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 rounded-2xl transition-all flex flex-col justify-between group shadow-lg"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold rounded-lg border border-indigo-500/30">
                  الدرس {lesson.number}
                </span>
                <span className="text-[11px] font-mono text-slate-400">ص {lesson.pageRange}</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">{lesson.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">{lesson.coreIdea}</p>
            </div>
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>{lesson.learningObjectives.length} أهداف تعليمية</span>
              <span className="text-indigo-400 font-semibold group-hover:-translate-x-1 transition-transform flex items-center gap-1">
                دخول الدرس <ArrowLeft className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {reviewCount > 0 && (
        <div className="mt-8">
          <ChapterQuestionBank
            partKey={part.key}
            chapterNumber={chapter.number}
            lessons={lessons.map((l) => ({ id: l.id, number: l.number, title: l.title }))}
            count={reviewCount}
          />
        </div>
      )}
    </div>
  );
}
