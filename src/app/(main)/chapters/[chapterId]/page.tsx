import React from "react";
import { notFound } from "next/navigation";
import { CURRICULUM_DATA } from "@/data/curriculum";
import Link from "next/link";
import { BookOpen, ArrowLeft, Layers, CheckCircle } from "lucide-react";

interface Props {
  params: Promise<{
    chapterId: string;
  }>;
}

export default async function ChapterOverviewPage({ params }: Props) {
  const resolvedParams = await params;
  const { chapterId } = resolvedParams;

  const chapter = CURRICULUM_DATA.find((c) => c.id === chapterId);
  if (!chapter) return notFound();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Chapter Overview Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-2xl mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 mb-2">
          <span>الفصل الدراسي {chapter.number}</span>
          <span>•</span>
          <span>الصفحات من {chapter.pageStart} إلى {chapter.pageEnd}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black mb-3">{chapter.title}</h1>
        <p className="text-sm font-mono text-slate-400 mb-4 dir-ltr text-right">{chapter.englishTitle}</p>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-6">
          {chapter.description}
        </p>

        <Link
          href={`/chapters/${chapter.id}/${chapter.lessons[0].slug}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/25"
        >
          <span>بدء دراسة الفصل ({chapter.lessons[0].title})</span>
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Lessons List Grid */}
      <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-indigo-400" />
        <span>قائمة دروس الفصل {chapter.number}:</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chapter.lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/chapters/${chapter.id}/${lesson.slug}`}
            className="p-6 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 rounded-2xl transition-all flex flex-col justify-between group shadow-lg"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold rounded-lg border border-indigo-500/30">
                  الدرس {lesson.number}
                </span>
                <span className="text-[11px] font-mono text-slate-400">ص {lesson.pageRange}</span>
              </div>
              <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                {lesson.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                {lesson.coreIdea}
              </p>
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
    </div>
  );
}

export function generateStaticParams() {
  return CURRICULUM_DATA.map((chapter) => ({
    chapterId: chapter.id,
  }));
}
