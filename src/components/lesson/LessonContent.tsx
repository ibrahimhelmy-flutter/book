"use client";

import React, { useState } from "react";
import { Lesson, CalloutBox } from "@/types";
import { LessonHeader } from "./LessonHeader";
import { ThinkLikeEngineer } from "./ThinkLikeEngineer";
import { SolvedExampleAccordion } from "./SolvedExampleAccordion";
import { QuizEngine } from "../quiz/QuizEngine";
import { SimulatorRenderer } from "../simulators/SimulatorRenderer";
import { LessonPresentationView } from "../presentation/LessonPresentationView";
import { HelpCircle, Sparkles, Lightbulb, CheckSquare, MessageSquare, BookOpen, AlertCircle, FileCheck, ArrowLeft, ArrowRight, Presentation, PenTool } from "lucide-react";
import Link from "next/link";
import { EyeComfortText, formatInlineText } from "../common/EyeComfortText";

interface Props {
  lesson: Lesson;
  nextLesson?: { id: string; title: string; number: string; chapterId: string; slug: string };
  prevLesson?: { id: string; title: string; number: string; chapterId: string; slug: string };
}

function SectionNoteButton({ note }: { note: CalloutBox }) {
  const [isOpen, setIsOpen] = useState(false);

  const getNoteBadge = () => {
    switch (note.type) {
      case "pause_and_reflect":
        return {
          icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
          btnClass: "bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border-amber-500/40 shadow-amber-950/40",
          borderClass: "border-amber-500/40",
          bgBadge: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          label: "توقّف وفكّر",
        };
      case "important_note":
        return {
          icon: <AlertCircle className="w-4 h-4 text-blue-400" />,
          btnClass: "bg-blue-500/15 hover:bg-blue-500/30 text-blue-300 border-blue-500/40 shadow-blue-950/40",
          borderClass: "border-blue-500/40",
          bgBadge: "bg-blue-500/20 text-blue-300 border-blue-500/40",
          label: "ملحوظة مهمة",
        };
      case "enrichment":
      case "pro_tip":
      case "hint":
      default:
        return {
          icon: <Sparkles className="w-4 h-4 text-purple-400" />,
          btnClass: "bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border-purple-500/40 shadow-purple-950/40",
          borderClass: "border-purple-500/40",
          bgBadge: "bg-purple-500/20 text-purple-300 border-purple-500/40",
          label: "لمحة خارج المنهج / تلميح",
        };
    }
  };

  const badge = getNoteBadge();

  return (
    <div className="relative inline-block text-right">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-lg hover:scale-105 ${badge.btnClass}`}
        title={note.title}
        aria-label={note.title}
      >
        {badge.icon}
        <span className="text-[11px] hidden md:inline">{badge.label}</span>
      </button>

      {/* Floating Popover on Hover/Click */}
      <div
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`absolute left-0 top-full mt-2 w-72 sm:w-96 max-w-[90vw] p-4 bg-slate-950/95 backdrop-blur-xl border ${badge.borderClass} rounded-2xl shadow-2xl z-50 transition-all duration-200 text-right ${
          isOpen ? "opacity-100 visible pointer-events-auto" : "opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2.5 mb-2.5">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${badge.bgBadge}`}>
            {badge.label}
          </span>
          <span className="text-xs font-bold text-white line-clamp-1">{note.title}</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed font-normal mb-2.5 whitespace-pre-line">
          {note.content}
        </p>

        {note.question && (
          <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
            <strong className="text-amber-400 block mb-1 font-bold text-[11px]">الإجابة والتحليل:</strong>
            <p className="text-slate-300 leading-relaxed text-[11px] font-normal">{note.question}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function LessonContent({ lesson, nextLesson, prevLesson }: Props) {
  const [activeTab, setActiveTab] = useState<"lesson" | "simulator" | "quiz" | "engineer">("lesson");
  const [isPresentationOpen, setIsPresentationOpen] = useState<boolean>(false);

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

      {/* Fullscreen Presentation Modal View */}
      {isPresentationOpen && (
        <LessonPresentationView
          lesson={lesson}
          onExitPresentation={() => setIsPresentationOpen(false)}
        />
      )}

      {/* Main Lesson View */}
      {activeTab === "lesson" && (
        <div className="space-y-8 animate-fadeIn">
          {/* Key Question & Learning Path - Compact Banner */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 sm:p-4 text-white flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-start gap-2 flex-1">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-slate-100 font-medium leading-relaxed">
                <span className="text-amber-400 font-bold ml-1">السؤال الرئيسي:</span>
                {lesson.keyQuestion}
              </p>
            </div>
            {lesson.learningPath?.current && (
              <div className="flex items-start gap-2 md:max-w-xs border-t md:border-t-0 md:border-r border-slate-800 pt-2 md:pt-0 md:pr-3 text-slate-300 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{lesson.learningPath.current}</span>
              </div>
            )}
          </div>

          {/* Presentation Launcher Banner in First Section / Top View */}
          <div className="bg-gradient-to-r from-blue-950/70 via-indigo-950/50 to-slate-900 border border-blue-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center shrink-0 shadow-inner">
                <Presentation className="w-6 h-6 text-blue-400 animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-white">
                  جاهز لشرح أو مراجعة الدرس على البروجيكتور؟ 📽️
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  شرائح تفاعلية بملء الشاشة مع أدوات الرسم والتظليل، والسبورة الرقمية، ومساعد الذكاء الاصطناعي.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPresentationOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 shrink-0"
            >
              <Presentation className="w-4 h-4" />
              <span>بدء العرض التقديمي (Full Screen)</span>
            </button>
          </div>

          {/* Detailed Sections with In-Section Notes Button */}
          <div className="space-y-6">
            {lesson.sections.map((sec, secIdx) => {
              const sectionNotes = [
                ...(sec.notes || []),
                ...(lesson.callouts || []).filter(
                  (c) => c.sectionId === sec.id || (!c.sectionId && secIdx === 0)
                ),
              ];

              return (
                <section
                  key={sec.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 text-white space-y-4 shadow-lg relative"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 gap-3">
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                      {sec.title}
                    </h3>

                    {/* Simple Note / Hint / Outside-the-curriculum Icon Button */}
                    {sectionNotes.length > 0 && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        {sectionNotes.map((note) => (
                          <SectionNoteButton key={note.id} note={note} />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    <EyeComfortText content={sec.content} theme="dark" />
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
                              <th key={i} className="p-3 font-semibold text-slate-200">
                                {formatInlineText(h, "dark")}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {sec.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                              {row.map((cell, cIdx) => (
                                <td key={cIdx} className="p-3 leading-relaxed">
                                  {formatInlineText(cell, "dark")}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              );
            })}
          </div>

          {/* Key Concepts Dictionary Bar - Placed at bottom of content & before simulation */}
          {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h2 className="text-sm font-bold text-indigo-400 mb-4 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>المفاهيم والمصطلحات الأساسية للدرس:</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {lesson.keyConcepts.map((concept, i) => (
                  <div key={i} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-xs space-y-1.5 hover:border-indigo-500/30 transition-all">
                    <div className="flex justify-between items-center">
                      <span className="text-amber-100 font-bold text-xs sm:text-sm bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md">
                        {concept.termAr}
                      </span>
                      {concept.termEn && (
                        <span className="text-[11px] font-mono font-semibold text-sky-300 bg-sky-950/60 border border-sky-500/30 px-1.5 py-0.5 rounded-md dir-ltr">
                          {concept.termEn}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300 leading-relaxed text-xs pt-1">
                      {formatInlineText(concept.definition, "dark")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Embedded Simulator in Reading flow */}
          {lesson.simulatorId && (
            <div className="my-8">
              <SimulatorRenderer simulatorId={lesson.simulatorId} />
            </div>
          )}

          {/* Think Like an Engineer Workspace */}
          <ThinkLikeEngineer challenge={lesson.engineerChallenge} />

          {/* Applied Task Box */}
          {lesson.appliedTask && (
            <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 text-white shadow-xl my-6">
              <div className="flex items-center gap-2.5 font-bold text-sm text-indigo-400 mb-2">
                <FileCheck className="w-5 h-5" />
                <span>{lesson.appliedTask.title || "تطبيق عملي"}</span>
              </div>
              {lesson.appliedTask.scenario && (
                <p className="text-xs text-slate-400 mb-2">{lesson.appliedTask.scenario}</p>
              )}
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
          )}

          {/* Solved Examples */}
          {lesson.solvedExample && <SolvedExampleAccordion example={lesson.solvedExample} />}

          {/* Main Question Official Answer */}
          {lesson.mainQuestionAnswer && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <HelpCircle className="w-5 h-5" />
                <span>إجابة السؤال الرئيسي المعتمدة:</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {lesson.mainQuestionAnswer}
              </p>
            </div>
          )}

          {/* Lesson Summary & Flashcard Takeaway */}
          {lesson.summary && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-base text-amber-400 mb-3 flex items-center gap-2">
                <span>⭐ خلاصة وتذكرة الدرس:</span>
              </h3>
              {Array.isArray(lesson.summary) ? (
                <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                  {lesson.summary.map((sumItem, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{sumItem}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{lesson.summary}</p>
              )}
            </div>
          )}

          {/* Challenge Yourself Box */}
          {lesson.challengeYourself && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lesson.challengeYourself.reflect && (
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-xs font-bold text-purple-400 block mb-1">⭐ تأمل ذاتي:</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{lesson.challengeYourself.reflect}</p>
                </div>
              )}
              {lesson.challengeYourself.challenge && (
                <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                  <span className="text-xs font-bold text-pink-400 block mb-1">⚡ تحدّ نفسك:</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{lesson.challengeYourself.challenge}</p>
                </div>
              )}
            </div>
          )}

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
