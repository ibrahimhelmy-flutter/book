"use client";

import React, { useState } from "react";
import { Lesson } from "@/types";
import { LessonHeader } from "./LessonHeader";
import { ThinkLikeEngineer } from "./ThinkLikeEngineer";
import { SolvedExampleAccordion } from "./SolvedExampleAccordion";
import { QuizEngine } from "../quiz/QuizEngine";
import { SimulatorRenderer } from "../simulators/SimulatorRenderer";
import { HelpCircle, Sparkles, Lightbulb, CheckSquare, MessageSquare, BookOpen, AlertCircle, FileCheck, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Props {
  lesson: Lesson;
  nextLesson?: { id: string; title: string; number: string; chapterId: string; slug: string };
  prevLesson?: { id: string; title: string; number: string; chapterId: string; slug: string };
}

export function LessonContent({ lesson, nextLesson, prevLesson }: Props) {
  const [activeTab, setActiveTab] = useState<"lesson" | "simulator" | "quiz" | "engineer">("lesson");

  return (
    <article className="max-w-5xl mx-auto px-4 py-8">
      {/* Lesson Header with TTS, Bookmark, and Objectives */}
      <LessonHeader lesson={lesson} />

      {/* Interactive Tabs Ribbon for Quick Jumping */}
      <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-lg mb-8 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab("lesson")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "lesson"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <BookOpen className="w-4 h-4" /> نص الدرس والشرح
        </button>

        {lesson.simulatorId && (
          <button
            onClick={() => setActiveTab("simulator")}
            className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "simulator"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Sparkles className="w-4 h-4" /> المحاكي التفاعلي ⚡
          </button>
        )}

        <button
          onClick={() => setActiveTab("engineer")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "engineer"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Lightbulb className="w-4 h-4" /> فكر كمهندس ⚙️
        </button>

        <button
          onClick={() => setActiveTab("quiz")}
          className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === "quiz"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <CheckSquare className="w-4 h-4" /> تمارين واختبار الدرس 📝
        </button>
      </div>

      {/* Main Lesson View */}
      {activeTab === "lesson" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Key Question & Learning Path */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-2">
                <HelpCircle className="w-4 h-4" />
                <span>السؤال الرئيسي للدرس:</span>
              </div>
              <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                {lesson.keyQuestion}
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs mb-2">
                <Sparkles className="w-4 h-4" />
                <span>مسار التعلم (Learning Path):</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {lesson.learningPath.current}
              </p>
            </div>
          </div>

          {/* Explore in Pairs */}
          {lesson.exploreInPairs && (
            <div className="bg-purple-950/30 border border-purple-500/30 rounded-2xl p-5 text-purple-200">
              <div className="flex items-center gap-2 font-bold text-xs text-purple-400 mb-1.5">
                <MessageSquare className="w-4 h-4" />
                <span>استكشف في ثنائيات (نشاط تفاعلي تعاوني):</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {lesson.exploreInPairs}
              </p>
            </div>
          )}

          {/* Key Concepts Dictionary Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-indigo-400 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>المفاهيم والمصطلحات الأساسية للدرس:</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lesson.keyConcepts.map((concept, i) => (
                <div key={i} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <strong className="text-white font-bold text-sm">{concept.termAr}</strong>
                    {concept.termEn && (
                      <span className="text-[11px] font-mono text-indigo-400 dir-ltr">{concept.termEn}</span>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed">{concept.definition}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Sections */}
          <div className="space-y-6">
            {lesson.sections.map((sec) => (
              <section key={sec.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white space-y-4 shadow-lg">
                <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-3">{sec.title}</h3>
                <div className="text-sm sm:text-base text-slate-300 leading-relaxed whitespace-pre-line">
                  {sec.content}
                </div>

                {/* Section Diagram / Image from PDF if present */}
                {sec.image && (
                  <div className="my-5 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 p-2">
                    <div className="relative rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center max-h-96">
                      <img
                        src={sec.image.src}
                        alt={sec.image.alt || sec.image.caption}
                        className="max-h-96 w-auto object-contain rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    {sec.image.caption && (
                      <p className="text-center text-xs text-slate-400 mt-2 font-medium">
                        📷 {sec.image.caption}
                      </p>
                    )}
                  </div>
                )}

                {/* Section Table if present */}
                {sec.table && (
                  <div className="overflow-x-auto my-4 rounded-xl border border-slate-800 bg-slate-950">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                        <tr>
                          {sec.table.headers.map((h, i) => (
                            <th key={i} className="p-3">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-slate-300">
                        {sec.table.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                            {row.map((cell, cIdx) => (
                              <td key={cIdx} className="p-3 leading-relaxed">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Embedded Simulator in Reading flow */}
          {lesson.simulatorId && (
            <div className="my-8">
              <SimulatorRenderer simulatorId={lesson.simulatorId} />
            </div>
          )}

          {/* Callouts (Pause and Reflect, Important Notes) */}
          <div className="space-y-4">
            {lesson.callouts.map((callout) => (
              <div
                key={callout.id}
                className={`p-5 rounded-2xl border ${
                  callout.type === "pause_and_reflect"
                    ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                    : "bg-blue-950/20 border-blue-500/40 text-blue-200"
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-2 text-white">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  <span>{callout.title}</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200 mb-2">
                  {callout.content}
                </p>
                {callout.question && (
                  <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 text-xs text-slate-300">
                    <strong className="text-amber-400 block mb-1">الإجابة والتحليل:</strong>
                    {callout.question}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Think Like an Engineer Workspace */}
          <ThinkLikeEngineer challenge={lesson.engineerChallenge} />

          {/* Applied Task Box */}
          <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-xl my-6">
            <div className="flex items-center gap-2.5 font-bold text-sm text-indigo-400 mb-2">
              <FileCheck className="w-5 h-5" />
              <span>{lesson.appliedTask.title}</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">{lesson.appliedTask.scenario}</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-200 leading-relaxed mb-4">
              {lesson.appliedTask.prompt}
            </p>
            {lesson.appliedTask.sampleAnswer && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs leading-relaxed text-slate-300">
                <strong className="text-emerald-400 block mb-1">نموذج الإجابة المقترحة:</strong>
                {lesson.appliedTask.sampleAnswer}
              </div>
            )}
          </div>

          {/* Solved Examples */}
          <SolvedExampleAccordion example={lesson.solvedExample} />

          {/* Main Question Official Answer */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <HelpCircle className="w-5 h-5" />
              <span>إجابة السؤال الرئيسي المعتمدة:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {lesson.mainQuestionAnswer}
            </p>
          </div>

          {/* Lesson Summary & Flashcard Takeaway */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white">
            <h3 className="font-bold text-base text-amber-400 mb-3 flex items-center gap-2">
              <span>⭐ خلاصة وتذكرة الدرس:</span>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              {lesson.summary.map((sumItem, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>{sumItem}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Challenge Yourself Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-xs font-bold text-purple-400 block mb-1">⭐ تأمل ذاتي:</span>
              <p className="text-xs text-slate-300 leading-relaxed">{lesson.challengeYourself.reflect}</p>
            </div>
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
              <span className="text-xs font-bold text-pink-400 block mb-1">⚡ تحدّ نفسك:</span>
              <p className="text-xs text-slate-300 leading-relaxed">{lesson.challengeYourself.challenge}</p>
            </div>
          </div>

          {/* Embedded Quiz Engine */}
          <QuizEngine lessonId={lesson.id} questions={lesson.questions} />
        </div>
      )}

      {/* Standalone Simulator Tab */}
      {activeTab === "simulator" && lesson.simulatorId && (
        <div className="animate-fadeIn">
          <SimulatorRenderer simulatorId={lesson.simulatorId} />
        </div>
      )}

      {/* Standalone Engineer Tab */}
      {activeTab === "engineer" && (
        <div className="animate-fadeIn space-y-6">
          <ThinkLikeEngineer challenge={lesson.engineerChallenge} />
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white">
            <h4 className="font-bold text-sm text-indigo-400 mb-2">تطبيق هندسي عملي:</h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">{lesson.appliedTask.prompt}</p>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              {lesson.appliedTask.sampleAnswer}
            </div>
          </div>
        </div>
      )}

      {/* Standalone Quiz Tab */}
      {activeTab === "quiz" && (
        <div className="animate-fadeIn">
          <QuizEngine lessonId={lesson.id} questions={lesson.questions} />
        </div>
      )}

      {/* Bottom Navigation between Lessons */}
      <footer className="flex justify-between items-center gap-4 mt-12 pt-6 border-t border-slate-800">
        {prevLesson ? (
          <Link
            href={`/chapters/${prevLesson.chapterId}/${prevLesson.slug}`}
            className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-right transition-all flex items-center gap-3 group"
          >
            <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform" />
            <div>
              <span className="text-[11px] text-slate-500 block">الدرس السابق ({prevLesson.number})</span>
              <span className="text-xs sm:text-sm font-bold text-white">{prevLesson.title}</span>
            </div>
          </Link>
        ) : (
          <div></div>
        )}

        {nextLesson ? (
          <Link
            href={`/chapters/${nextLesson.chapterId}/${nextLesson.slug}`}
            className="p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl text-left transition-all flex items-center gap-3 group"
          >
            <div>
              <span className="text-[11px] text-slate-500 block">الدرس التالي ({nextLesson.number})</span>
              <span className="text-xs sm:text-sm font-bold text-white">{nextLesson.title}</span>
            </div>
            <ArrowLeft className="w-5 h-5 text-indigo-400 group-hover:-translate-x-1 transition-transform" />
          </Link>
        ) : (
          <div></div>
        )}
      </footer>
    </article>
  );
}
