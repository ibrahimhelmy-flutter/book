import React from "react";
import Link from "next/link";
import { CURRENT_BOOK, getBookStats } from "@/data/books";
import { BookSelector } from "@/components/common/BookSelector";
import { BookOpen, Sparkles, ShieldCheck, Globe, Palette, ArrowLeft, Award, CheckCircle, Cpu, Zap, Activity } from "lucide-react";

export default function HomePage() {
  const stats = getBookStats(CURRENT_BOOK);
  const chapters = CURRENT_BOOK.chapters || [];
  const firstChapter = chapters[0];
  const firstLesson = firstChapter?.lessons?.[0];
  const firstLessonHref = firstChapter && firstLesson ? `/chapters/${firstChapter.id}/${firstLesson.slug}` : "/chapters";

  const chapterIcons = {
    "chapter-1": Cpu,
    "chapter-2": ShieldCheck,
    "chapter-3": Globe,
    "chapter-4": Palette,
  };

  return (
    <div className="flex-1 bg-slate-950 text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          {/* Official Accreditation Badges */}
          {CURRENT_BOOK.accreditation && CURRENT_BOOK.accreditation.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {CURRENT_BOOK.accreditation.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-mono"
                >
                  {badge}
                </span>
              ))}
            </div>
          )}

          {/* Dynamic Book Switcher Banner */}
          <div className="flex justify-center">
            <BookSelector variant="navbar" />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
            منهاج <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">{CURRENT_BOOK.title}</span>
            <br />
            <span className="text-slate-200 text-2xl sm:text-4xl font-extrabold">{CURRENT_BOOK.grade} ({CURRENT_BOOK.term})</span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            {CURRENT_BOOK.description}
          </p>

          {/* Quick CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href={firstLessonHref}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2 group"
            >
              <span>ابدأ دراسة الدرس الأول ({firstLesson?.number || "1-1"})</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/simulators"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>معمل المحاكيات التفاعلية ({stats.totalSimulators} تجارب)</span>
            </Link>

            <Link
              href="/exams"
              className="px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>بنك أسئلة الامتحانات ({stats.totalExamQuestions} أسئلة)</span>
            </Link>
          </div>

          {/* Highlights summary pills calculated 100% dynamically */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <div className="text-2xl font-black text-indigo-400 font-mono">{stats.totalChapters} فصول</div>
              <div className="text-xs text-slate-400 mt-0.5">شاملة لكامل {CURRENT_BOOK.term}</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <div className="text-2xl font-black text-purple-400 font-mono">{stats.totalLessons} درساً</div>
              <div className="text-xs text-slate-400 mt-0.5">مع أمثلة وتمارين وتطبيق</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <div className="text-2xl font-black text-emerald-400 font-mono">{stats.totalSimulators} محاكيات</div>
              <div className="text-xs text-slate-400 mt-0.5">تجارب تفاعلية حية</div>
            </div>
            <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl">
              <div className="text-2xl font-black text-pink-400 font-mono">{stats.totalGlossaryTerms}+ مصطلح</div>
              <div className="text-xs text-slate-400 mt-0.5">معجم المصطلحات المعتمدة</div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapters Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white">فصول المنهج الدراسي ({CURRENT_BOOK.term})</h2>
          <p className="text-xs sm:text-sm text-slate-400">انقر على أي فصل أو درس للانتقال المباشر للمحتوى والشرح التفاعلي</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chapters.map((chapter) => {
            const Icon = chapterIcons[chapter.id as keyof typeof chapterIcons] || BookOpen;

            return (
              <div
                key={chapter.id}
                className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 hover:border-slate-700 transition-all flex flex-col justify-between shadow-xl group"
              >
                <div>
                  {/* Chapter Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                        <Icon className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-indigo-400">الفصل {chapter.number}</span>
                        <h3 className="text-xl font-black text-white group-hover:text-indigo-300 transition-colors">
                          {chapter.title}
                        </h3>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800">
                      ص {chapter.pageStart} - {chapter.pageEnd}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                    {chapter.description}
                  </p>

                  {/* Lessons List within Chapter */}
                  <div className="space-y-2 mb-6">
                    <span className="text-[11px] font-bold text-slate-400 block mb-2">دروس الفصل:</span>
                    {chapter.lessons.map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/chapters/${chapter.id}/${lesson.slug}`}
                        className="p-3 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/80 rounded-xl flex items-center justify-between transition-all group/item block"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shrink-0 border border-slate-800">
                            {lesson.number}
                          </span>
                          <span className="text-xs font-bold text-slate-200 group-hover/item:text-white truncate">
                            {lesson.title}
                          </span>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-slate-600 group-hover/item:text-indigo-400 group-hover/item:-translate-x-1 transition-all shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>

                <Link
                  href={`/chapters/${chapter.id}/${chapter.lessons[0].slug}`}
                  className="w-full py-3 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white font-bold text-xs rounded-xl transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>استكشاف دروس الفصل {chapter.number}</span>
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

