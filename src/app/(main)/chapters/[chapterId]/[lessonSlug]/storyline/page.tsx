import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CURRICULUM_DATA } from "@/data/curriculum";
import { getStorylineForLesson, getAllStorylinesList } from "@/data/storylines";
import { StorylinePageContent } from "@/components/storyline/StorylinePageContent";

interface Props {
  params: Promise<{
    chapterId: string;
    lessonSlug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { chapterId, lessonSlug } = resolvedParams;

  const storyline = getStorylineForLesson(chapterId, lessonSlug);
  const chapter = CURRICULUM_DATA.find((c) => c.id === chapterId);
  const lesson = chapter?.lessons.find((l) => l.slug === lessonSlug);

  if (!storyline && !lesson) {
    return { title: "تسلسل الأفكار غير موجود" };
  }

  const title = storyline
    ? `تسلسل الأفكار: ${storyline.title} (${storyline.lessonNumber})`
    : `تسلسل الأفكار: ${lesson?.title || ""}`;

  return {
    title: `${title} | منصة التعلم الذكي`,
    description:
      storyline?.subtitle ||
      "الشرح الروائي المتسلسل للمفاهيم والمصطلحات الهندسية بحسب كتاب الوزارة المعتمد.",
    openGraph: {
      title,
      description: storyline?.subtitle,
    },
  };
}

export default async function StorylinePage({ params }: Props) {
  const resolvedParams = await params;
  const { chapterId, lessonSlug } = resolvedParams;

  const chapter = CURRICULUM_DATA.find((c) => c.id === chapterId);
  if (!chapter) return notFound();

  const lesson = chapter.lessons.find((l) => l.slug === lessonSlug);
  if (!lesson) return notFound();

  const storyline = getStorylineForLesson(chapterId, lessonSlug);

  // If this lesson doesn't have an authored storyline yet, render a polite coming-soon placeholder
  if (!storyline) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 text-center">
        <div className="max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto text-xl font-bold">
            🧭
          </div>
          <h1 className="text-xl font-black text-white">تسلسل الأفكار قيد الإعداد</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            يجري حالياً إعداد الرواية الهندسية المتسلسلة لدرس &quot;{lesson.title}&quot;. النموذج الرائد متوفر حالياً لدرس &quot;تقنيات التشفير والمصادقة (2-1)&quot;.
          </p>
          <a
            href={`/chapters/${chapterId}/${lessonSlug}`}
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
          >
            العودة لشرح الدرس
          </a>
        </div>
      </div>
    );
  }

  return <StorylinePageContent storyline={storyline} />;
}

export function generateStaticParams() {
  const list = getAllStorylinesList();
  if (list.length > 0) {
    return list.map((item) => ({
      chapterId: item.chapterId,
      lessonSlug: item.lessonSlug,
    }));
  }

  // Fallback to all lessons
  return CURRICULUM_DATA.flatMap((chapter) =>
    chapter.lessons.map((lesson) => ({
      chapterId: chapter.id,
      lessonSlug: lesson.slug,
    }))
  );
}
