import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Award, ClipboardCheck, Sparkles } from "lucide-react";
import {
  bookHref,
  chapterHref,
  companionHref,
  findPart,
  gradeHref,
  lessonHref,
  partHref,
  requirePart,
  staticParams,
  type PartRouteParams,
} from "@/content";
import { ContentIcon } from "@/components/common/ContentIcon";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";

interface Props {
  params: Promise<PartRouteParams>;
}

export function generateStaticParams() {
  return staticParams.parts();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ref = await params;
  const part = requirePart(ref);
  return {
    title: `${part.bookTitle} — ${part.gradeTitle} (${part.partTitle})`,
    description: findPart(ref)?.book.description,
  };
}

export default async function PartHomePage({ params }: Props) {
  const ref = await params;
  const part = requirePart(ref);
  const { book } = findPart(ref)!;
  const { stats, chapters } = part;
  const firstChapter = chapters[0];
  const firstLesson = firstChapter?.lessons[0];
  const assessments = part.companions.find((c) => c.kind === "assessments" && c.status === "available");

  return (
    <div className="flex-1 text-white">
      <section className="relative overflow-hidden pt-8 pb-14 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10 space-y-6">
          <Breadcrumbs
            items={[
              { label: "الكتب الدراسية", href: "/" },
              { label: part.gradeTitle, href: gradeHref(ref.gradeId) },
              { label: part.bookTitle, href: bookHref(ref.gradeId, ref.bookSlug) },
              { label: part.partShortTitle },
            ]}
          />
          <div className="text-center space-y-4">
            {book.accreditation && book.accreditation.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="text-xs text-slate-400 font-bold">عن الكتاب المدرسي:</span>
                {book.accreditation.map((badge) => (
                  <span key={badge} className="px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                    {badge}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">{part.bookTitle}</span>
              <br />
              <span className="text-slate-200 text-xl sm:text-3xl font-extrabold">
                {part.gradeTitle} ({part.partTitle})
              </span>
            </h1>
            {book.description && <p className="max-w-3xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">{book.description}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {firstChapter && firstLesson && (
              <Link
                href={lessonHref(part.key, firstChapter.id, firstLesson.slug)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 group"
              >
                <span>ابدأ دراسة الدرس الأول ({firstLesson.number})</span>
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              </Link>
            )}
            {assessments && (
              <Link
                href={companionHref(part.key, assessments.slug)}
                className="px-6 py-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-200 font-bold text-sm transition-all flex items-center gap-2"
              >
                <ClipboardCheck className="w-4 h-4 text-amber-400" />
                <span>
                  {assessments.title} ({assessments.totalQuestions} سؤالًا)
                </span>
              </Link>
            )}
            {stats.totalSimulators > 0 && (
              <Link
                href={partHref(part.key, "simulators")}
                className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span>معمل المحاكيات التفاعلية ({stats.totalSimulators} تجارب)</span>
              </Link>
            )}
            <Link
              href={partHref(part.key, "exams")}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>بنك الأسئلة والامتحانات</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-4 text-center">
            <Stat value={`${stats.totalChapters} فصول`} label={`شاملة لكامل ${part.partTitle}`} color="text-indigo-400" />
            <Stat value={`${stats.totalLessons} درساً`} label="مع أمثلة وتمارين وتطبيق" color="text-purple-400" />
            <Stat value={`${stats.totalSimulators} محاكيات`} label="تجارب تفاعلية حية" color="text-emerald-400" />
            <Stat value={`${stats.totalGlossaryTerms}+ مصطلح`} label="معجم المصطلحات المعتمدة" color="text-pink-400" />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-white">فصول المنهج الدراسي ({part.partTitle})</h2>
          <p className="text-xs sm:text-sm text-slate-400">انقر على أي فصل أو درس للانتقال المباشر للمحتوى والشرح التفاعلي</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chapters.map((chapter) => (
            <div
              key={chapter.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl group"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                      <ContentIcon name={chapter.icon} className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-indigo-400">الفصل {chapter.number}</span>
                      <h3 className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors">{chapter.title}</h3>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
                    ص {chapter.pageStart} - {chapter.pageEnd}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">{chapter.description}</p>
                <div className="space-y-2 mb-6">
                  <span className="text-[11px] font-bold text-slate-400 block mb-2">دروس الفصل:</span>
                  {chapter.lessons.map((lesson) => (
                    <Link
                      key={lesson.id}
                      href={lessonHref(part.key, chapter.id, lesson.slug)}
                      className="p-3 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl flex items-center justify-between transition-all group/item"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-8 h-6 rounded-lg bg-slate-900 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-slate-800">
                          {lesson.number}
                        </span>
                        <span className="text-xs font-bold text-slate-200 group-hover/item:text-white truncate">{lesson.title}</span>
                      </div>
                      <ArrowLeft className="w-4 h-4 text-slate-600 group-hover/item:text-indigo-400 group-hover/item:-translate-x-1 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>
              <Link
                href={chapterHref(part.key, chapter.id)}
                className="w-full py-3 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-2"
              >
                <span>استكشاف دروس الفصل {chapter.number}</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
      <div className={`text-xl sm:text-2xl font-black font-mono ${color}`}>{value}</div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
    </div>
  );
}
