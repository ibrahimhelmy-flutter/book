"use client";

import React, { useState } from "react";
import { QuestionItem } from "@/types";
import { CheckCircle, XCircle, HelpCircle, Award, RotateCcw, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { saveQuizScore } from "@/lib/storage";
import { fireConfetti } from "@/lib/confetti";

interface Props {
  lessonId: string;
  questions: QuestionItem[];
}

export function QuizEngine({ lessonId, questions }: Props) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;

  const handleSelectOption = (questionId: string, optionId: string) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleFinishQuiz = () => {
    let correctCount = 0;
    questions.forEach((q) => {
      const ans = userAnswers[q.id];
      if (q.type === "mcq") {
        if (ans === q.correctAnswer) correctCount++;
      } else if (q.type === "fill_blank") {
        if (ans && ans.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase()) {
          correctCount++;
        }
      } else if (q.type === "essay") {
        // Essay questions earn self-evaluated credit if attempted
        if (ans && ans.trim().length > 10) {
          correctCount++;
        }
      }
    });

    setScore(correctCount);
    setSubmitted(true);
    saveQuizScore(lessonId, correctCount, totalQuestions);

    if (correctCount === totalQuestions || correctCount >= totalQuestions * 0.7) {
      fireConfetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
    setShowExplanation(false);
    setCurrentIndex(0);
    setScore(0);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl my-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">بنك الأسئلة والتدريبات التفاعلية (تمارين الدرس)</h3>
            <p className="text-sm text-slate-400">أسئلة الفهم والتطبيق ونماذج الامتحانات الرسمية مع التصحيح الفوري</p>
          </div>
        </div>

        {!submitted ? (
          <span className="text-xs font-mono px-3 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-bold">
            السؤال {currentIndex + 1} من {totalQuestions}
          </span>
        ) : (
          <button
            onClick={resetQuiz}
            className="text-xs px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> إعادة الاختبار
          </button>
        )}
      </div>

      {!submitted ? (
        <div>
          {/* Question Category Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md font-mono ${
                currentQ.category === "exam_style"
                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                  : currentQ.category === "check_understanding"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              {currentQ.category === "exam_style"
                ? "سؤال على نمط الامتحان [6 درجات]"
                : currentQ.category === "check_understanding"
                ? "اختبر فهمك"
                : "تدرب وطبق"}
            </span>
            {currentQ.marks && (
              <span className="text-xs text-slate-400">({currentQ.marks} درجات)</span>
            )}
          </div>

          {/* Question Text */}
          <p className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed mb-6">
            {currentQ.questionText}
          </p>

          {/* Question Answer Inputs by Type */}
          {currentQ.type === "mcq" && currentQ.options && (
            <div className="space-y-3 mb-6">
              {currentQ.options.map((opt) => {
                const isSelected = userAnswers[currentQ.id] === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQ.id, opt.id)}
                    className={`w-full p-4 rounded-xl border text-right text-sm leading-relaxed transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "bg-indigo-950/70 border-indigo-500 text-indigo-200 ring-2 ring-indigo-500/30 font-medium"
                        : "bg-slate-950/50 hover:bg-slate-800/60 border-slate-800 text-slate-300"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0 font-bold ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {opt.id.toUpperCase()}
                    </span>
                    <span>{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {currentQ.type === "fill_blank" && (
            <div className="mb-6">
              <label className="text-xs text-slate-400 block mb-2 font-medium">اكتب المصطلح الدقيق في الفراغ:</label>
              <input
                type="text"
                value={userAnswers[currentQ.id] || ""}
                onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
                placeholder="أدخل المصطلح هنا..."
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {currentQ.type === "essay" && (
            <div className="mb-6 space-y-3">
              <label className="text-xs text-slate-400 block font-medium">اكتب إجابتك التحليلية الكاملة وفق محاور السؤال:</label>
              <textarea
                rows={5}
                value={userAnswers[currentQ.id] || ""}
                onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
                placeholder="اشرح بالتفصيل وفق المبادئ العلمية المذكورة في الدرس..."
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 resize-y"
              />
              {currentQ.rubricCriteria && (
                <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-xl text-xs space-y-1 text-slate-400">
                  <span className="font-bold text-slate-300 block">معايير توزيع الدرجات (Rubric):</span>
                  {currentQ.rubricCriteria.map((c, i) => (
                    <div key={i}>• {c}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4" /> السؤال السابق
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1 text-white"
              >
                السؤال التالي <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinishQuiz}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all cursor-pointer flex items-center gap-1.5 text-white"
              >
                <Sparkles className="w-4 h-4" /> تسليم الإجابات والتصحيح
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Results & Answer Review View */
        <div className="space-y-6 animate-fadeIn">
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center">
            <div className="inline-flex p-3 bg-indigo-600/20 text-indigo-400 rounded-full mb-3">
              <Award className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-bold text-white mb-1">نتيجة التقييم</h4>
            <p className="text-3xl font-black text-indigo-400 font-mono my-2">
              {score} / {totalQuestions}
            </p>
            <p className="text-xs text-slate-400">
              {score === totalQuestions
                ? "ممتاز! استيعاب كامل لجميع معايير ومفاهيم الدرس 🎯"
                : score >= totalQuestions * 0.7
                ? "جيد جداً! راجع الإجابات النموذجية بالأسفل لتثبيت المفاهيم."
                : "تحتاج إلى إعادة مراجعة أقسام الدرس وإعادة المحاولة لتحقيق التميز."}
            </p>
          </div>

          {/* Detailed Question by Question review */}
          <div className="space-y-4">
            <h5 className="font-bold text-sm text-slate-300 border-b border-slate-800 pb-2">
              مراجعة الإجابات النموذجية والشرح التفصيلي:
            </h5>

            {questions.map((q, idx) => {
              const userAns = userAnswers[q.id];
              let isCorrect = false;
              if (q.type === "mcq") isCorrect = userAns === q.correctAnswer;
              else if (q.type === "fill_blank") isCorrect = userAns?.trim().toLowerCase() === String(q.correctAnswer).trim().toLowerCase();
              else if (q.type === "essay") isCorrect = (userAns?.trim().length || 0) > 10;

              return (
                <div key={q.id} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-400">س{idx + 1}:</span>
                      <p className="text-xs sm:text-sm font-semibold text-slate-200">{q.questionText}</p>
                    </div>
                    {isCorrect ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                    )}
                  </div>

                  <div className="text-xs space-y-1 pt-1 border-t border-slate-900">
                    <div className="text-slate-400">
                      <strong>إجابتك:</strong>{" "}
                      <span className={isCorrect ? "text-emerald-300" : "text-red-300"}>
                        {userAns || "لم تتم الإجابة"}
                      </span>
                    </div>

                    <div className="text-emerald-400">
                      <strong>الإجابة النموذجية:</strong>{" "}
                      <span>
                        {typeof q.correctAnswer === "object"
                          ? JSON.stringify(q.correctAnswer)
                          : String(q.correctAnswer)}
                      </span>
                    </div>

                    {q.explanation && (
                      <div className="text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 mt-2 leading-relaxed">
                        <strong className="text-indigo-300">الشرح والتفسير:</strong> {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
