"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { LessonStoryline } from "@/types/storyline";
import { MilestoneCard } from "./MilestoneCard";
import {
  Compass,
  ArrowRight,
  BookOpen,
  CheckSquare,
  ShieldCheck,
  Sparkles,
  Layers,
  ShoppingCart,
  CheckCircle2,
  Lock,
  ChevronLeft,
} from "lucide-react";

interface Props {
  storyline: LessonStoryline;
}

export function StorylinePageContent({ storyline }: Props) {
  const [activeMilestoneId, setActiveMilestoneId] = useState<string>(
    storyline.milestones[0]?.id || ""
  );
  const [readingProgress, setReadingProgress] = useState<number>(0);

  // Scrollspy & Reading Progress Tracker
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.round((scrollY / docHeight) * 100)) : 0;
      setReadingProgress(progress);

      const sectionIds = [
        ...storyline.milestones.map((m) => m.id),
        "grand-finale-section",
      ];

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 160) {
            setActiveMilestoneId(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [storyline.milestones]);

  const scrollToMilestone = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Sticky Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Back to Lesson Link */}
          <Link
            href={`/chapters/${storyline.chapterId}/${storyline.lessonSlug}`}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 px-3 py-2 rounded-xl border border-slate-700/80 transition-all cursor-pointer shadow-sm group"
          >
            <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>العودة لشرح الدرس</span>
          </Link>

          {/* Breadcrumb Title */}
          <div className="hidden md:flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">الدرس {storyline.lessonNumber}</span>
            <span className="text-slate-600">•</span>
            <span className="text-white font-bold">{storyline.title}</span>
            <span className="text-slate-600">•</span>
            <span className="text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
              تسلسل الأفكار 🧭
            </span>
          </div>

          {/* Practice Questions Link */}
          <Link
            href={`/chapters/${storyline.chapterId}/${storyline.lessonSlug}`}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white bg-emerald-950/40 hover:bg-emerald-900/50 px-3 py-2 rounded-xl border border-emerald-500/40 transition-all cursor-pointer shadow-sm"
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">تمارين الدرس</span>
            <span>📝</span>
          </Link>
        </div>

        {/* Global Reading Progress Line */}
        <div className="w-full h-1 bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-150"
            style={{ width: `${readingProgress}%` }}
          />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <section className="mb-12 text-right rounded-3xl bg-gradient-to-b from-indigo-950/40 via-slate-900/60 to-slate-900/40 border border-indigo-500/30 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-indigo-600/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/40">
              <Compass className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: "12s" }} />
              <span>تسلسل الأفكار الهندسية الواقعية • الدرس {storyline.lessonNumber}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
              {storyline.title}:{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
                رواية نشأة الأمان الرقمي
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-4xl">
              {storyline.heroHook.leadParagraph}
            </p>

            {/* Core Question Spotlight */}
            <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-xs font-bold text-indigo-300 mb-1">
                  السؤال الجوهري الذي سنجيب عنه خطوة بخطوة:
                </strong>
                <p className="text-sm sm:text-base font-bold text-white">
                  "{storyline.heroHook.theCoreQuestion}"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Story Grid: Left Content (Milestones) + Right Sticky Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Story Column (Left on RTL) */}
          <div className="lg:col-span-8 space-y-8 relative">
            {/* Background Spine Line (Desktop) */}
            <div className="hidden sm:block absolute right-[17px] top-6 bottom-32 w-0.5 bg-gradient-to-b from-indigo-500/80 via-purple-500/50 to-emerald-500/80" />

            {/* Milestones Sequence */}
            {storyline.milestones.map((milestone, idx) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                isLast={idx === storyline.milestones.length - 1}
              />
            ))}

            {/* Grand Finale Section (محطة التتويج: سيمفونية الأمان في التسوق الإلكتروني) */}
            <section
              id="grand-finale-section"
              className="relative pl-0 sm:pr-12 md:pr-14 transition-all duration-300 scroll-mt-24 pt-6"
            >
              {/* Spine Node for Finale */}
              <div className="hidden sm:flex absolute right-0 top-10 w-9 h-9 rounded-full bg-emerald-950 border-2 border-emerald-400 items-center justify-center text-xs font-black text-emerald-300 shadow-lg shadow-emerald-950/60 z-10">
                ★
              </div>

              <div className="rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-b from-slate-900/95 to-emerald-950/20 p-6 sm:p-8 text-right space-y-6 shadow-2xl">
                {/* Header */}
                <div className="space-y-2 border-b border-emerald-500/20 pb-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>{storyline.grandFinale.title}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {storyline.grandFinale.scenarioTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {storyline.grandFinale.scenarioStory}
                  </p>
                </div>

                {/* Defense Matrix Table / Cards */}
                <div className="space-y-3">
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4" />
                    <span>مراحل حماية عملية الشراء خطوة بخطوة (من واقع كتاب الوزارة):</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {storyline.grandFinale.defenseMatrix.map((item) => (
                      <div
                        key={item.stepNumber}
                        className="p-3.5 sm:p-4 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-right"
                      >
                        <div className="flex items-start sm:items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                            {item.stepNumber}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-white mb-0.5">
                              {item.userAction}
                            </div>
                            <div className="text-[11px] text-indigo-300 font-semibold flex items-center gap-1.5">
                              <Lock className="w-3 h-3 text-indigo-400" />
                              <span>التقنية بالمنهج: {item.underTheHoodTech}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-[11px] text-emerald-200/90 sm:max-w-xs text-right w-full sm:w-auto">
                          🛡️ <strong>التهديد المدحور:</strong> {item.threatNeutralized}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curriculum Golden Takeaway */}
                <div className="p-4 sm:p-5 rounded-2xl bg-indigo-950/50 border border-indigo-500/30 text-right space-y-2">
                  <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs sm:text-sm">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>الخلاصة المستفادة للامتحان والحياة العملية:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    {storyline.grandFinale.curriculumTakeaway}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <Link
                    href={`/chapters/${storyline.chapterId}/${storyline.lessonSlug}`}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-indigo-400" />
                    <span>مراجعة نص الدرس الكامل</span>
                  </Link>

                  <Link
                    href={`/chapters/${storyline.chapterId}/${storyline.lessonSlug}`}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 cursor-pointer"
                  >
                    <CheckSquare className="w-4 h-4" />
                    <span>حل تدريبات وأسئلة الدرس 📝</span>
                  </Link>
                </div>
              </div>
            </section>
          </div>

          {/* Right Sticky Sidebar (Navigator & Milestone Jump) */}
          <aside className="lg:col-span-4 sticky top-24 space-y-5 hidden lg:block">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 backdrop-blur-md p-5 text-right shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  محطات تسلسل الأفكار
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                  {readingProgress}% مقروء
                </span>
              </div>

              {/* Milestones List */}
              <nav className="space-y-1.5 text-xs">
                {storyline.milestones.map((m) => {
                  const isActive = activeMilestoneId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => scrollToMilestone(m.id)}
                      className={`w-full text-right p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isActive
                          ? "bg-indigo-600 text-white font-bold shadow-md shadow-indigo-950/50 scale-[1.02]"
                          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0 font-bold ${
                            isActive
                              ? "bg-white text-indigo-600"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {m.stageNumber}
                        </span>
                        <span className="truncate text-xs">{m.title}</span>
                      </div>
                      {isActive && <ChevronLeft className="w-4 h-4 shrink-0" />}
                    </button>
                  );
                })}

                {/* Grand Finale Nav Button */}
                <button
                  type="button"
                  onClick={() => scrollToMilestone("grand-finale-section")}
                  className={`w-full text-right p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 mt-2 ${
                    activeMilestoneId === "grand-finale-section"
                      ? "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-950/50 scale-[1.02]"
                      : "text-emerald-300 hover:bg-emerald-950/40"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-[10px] shrink-0 font-bold">
                      ★
                    </span>
                    <span className="truncate text-xs font-bold">محطة التتويج: التسوق الإلكتروني</span>
                  </div>
                  {activeMilestoneId === "grand-finale-section" && (
                    <ChevronLeft className="w-4 h-4 shrink-0" />
                  )}
                </button>
              </nav>

              {/* Quick Info Box */}
              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>مربوط حرفياً بمصطلحات المنهج</span>
                </div>
                <p>كل محطة تعالج مشكلة واقعية وصولاً للمفهوم المقرر في الامتحان.</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
