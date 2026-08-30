"use client";

import React, { useState, useMemo, useEffect } from "react";
import { CURRICULUM_DATA } from "@/data/curriculum";
import { QuestionItem } from "@/types";
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Layers,
  Search,
  Timer,
  Play,
  Pause,
  AlertCircle,
  FileCheck2,
  FileText,
  Sliders,
  CheckSquare
} from "lucide-react";
import { fireConfetti } from "@/lib/confetti";

// Smart Arabic text normalizer for grading
function normalizeArabicText(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, "") // remove diacritics
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ/g, "")
    .replace(/[.,/#!$%^&*;:{}=\-_`~()؟"']/g, "")
    .replace(/\s+/g, " ");
}

interface FlattenedQuestion extends QuestionItem {
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  lessonId: string;
  lessonNumber: string;
  lessonTitle: string;
}

export default function ExamsPage() {
  // All 252 questions flattened across curriculum
  const allCurriculumQuestions: FlattenedQuestion[] = useMemo(() => {
    return CURRICULUM_DATA.flatMap((ch) =>
      ch.lessons.flatMap((l) =>
        l.questions.map((q) => ({
          ...q,
          chapterId: ch.id,
          chapterNumber: ch.number,
          chapterTitle: ch.title,
          lessonId: l.id,
          lessonNumber: l.number,
          lessonTitle: l.title,
        }))
      )
    );
  }, []);

  // Main Page View Mode: "simulator" | "bank" | "essay_bank"
  const [activeTab, setActiveTab] = useState<"simulator" | "bank" | "essay_bank">("simulator");

  // --- SIMULATOR STATE ---
  const [selectedExamPreset, setSelectedExamPreset] = useState<string>("FINAL_FULL");
  const [customCount, setCustomCount] = useState<number>(30);
  const [customChapter, setCustomChapter] = useState<string>("ALL");
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [examQuestions, setExamQuestions] = useState<FlattenedQuestion[]>([]);
  const [currentExamIndex, setCurrentExamIndex] = useState<number>(0);
  const [userExamAnswers, setUserExamAnswers] = useState<Record<string, string>>({});
  const [examTimeLeft, setExamTimeLeft] = useState<number>(45 * 60); // 45 mins in seconds
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(false);
  const [examScore, setExamScore] = useState<{ raw: number; total: number; percentage: number }>({
    raw: 0,
    total: 0,
    percentage: 0,
  });
  const [reviewMistakesOnly, setReviewMistakesOnly] = useState<boolean>(false);
  const [examInstantFeedback, setExamInstantFeedback] = useState<boolean>(false);
  const [revealedExamAnswers, setRevealedExamAnswers] = useState<Record<string, boolean>>({});

  // --- QUESTION BANK STATE ---
  const [bankSearch, setBankSearch] = useState<string>("");
  const [bankChapter, setBankChapter] = useState<string>("ALL");
  const [bankType, setBankType] = useState<string>("ALL");
  const [revealedBankAnswers, setRevealedBankAnswers] = useState<Record<string, boolean>>({});

  // Scroll to top on screen or tab change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [activeTab, examStarted, examSubmitted]);

  // Countdown timer effect
  useEffect(() => {
    let interval: any = null;
    if (examStarted && !examSubmitted && !isTimerPaused && examTimeLeft > 0) {
      interval = setInterval(() => {
        setExamTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            handleFinishExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examStarted, examSubmitted, isTimerPaused, examTimeLeft]);

  // Format timer as MM:SS
  const formattedTime = useMemo(() => {
    const mins = Math.floor(examTimeLeft / 60);
    const secs = examTimeLeft % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }, [examTimeLeft]);

  // Start an Exam Preset
  const handleStartExam = (preset: string) => {
    let pool: FlattenedQuestion[] = [];
    let durationMinutes = 45;

    if (preset === "FINAL_FULL") {
      // Balanced 30 questions from all chapters
      const ch1 = allCurriculumQuestions.filter((q) => q.chapterId === "chapter-1");
      const ch2 = allCurriculumQuestions.filter((q) => q.chapterId === "chapter-2");
      const ch3 = allCurriculumQuestions.filter((q) => q.chapterId === "chapter-3");
      const ch4 = allCurriculumQuestions.filter((q) => q.chapterId === "chapter-4");

      const shuffled1 = [...ch1].sort(() => 0.5 - Math.random()).slice(0, 8);
      const shuffled2 = [...ch2].sort(() => 0.5 - Math.random()).slice(0, 7);
      const shuffled3 = [...ch3].sort(() => 0.5 - Math.random()).slice(0, 7);
      const shuffled4 = [...ch4].sort(() => 0.5 - Math.random()).slice(0, 8);

      pool = [...shuffled1, ...shuffled2, ...shuffled3, ...shuffled4].sort(() => 0.5 - Math.random());
      durationMinutes = 60;
    } else if (preset.startsWith("CHAPTER_")) {
      const chId = preset.replace("CHAPTER_", "");
      const chapterQs = allCurriculumQuestions.filter((q) => q.chapterId === chId);
      pool = [...chapterQs].sort(() => 0.5 - Math.random()).slice(0, 18);
      durationMinutes = 35;
    } else if (preset === "CUSTOM") {
      let filtered = allCurriculumQuestions;
      if (customChapter !== "ALL") {
        filtered = filtered.filter((q) => q.chapterId === customChapter);
      }
      pool = [...filtered].sort(() => 0.5 - Math.random()).slice(0, customCount);
      durationMinutes = Math.max(15, Math.round(pool.length * 1.5));
    }

    setExamQuestions(pool);
    setUserExamAnswers({});
    setCurrentExamIndex(0);
    setExamSubmitted(false);
    setExamTimeLeft(durationMinutes * 60);
    setIsTimerPaused(false);
    setReviewMistakesOnly(false);
    setExamStarted(true);
  };

  const handleSelectExamOption = (qId: string, val: string) => {
    if (examSubmitted) return;
    setUserExamAnswers((prev) => ({ ...prev, [qId]: val }));
  };

  const checkIsCorrect = (q: QuestionItem): boolean => {
    const ans = userExamAnswers[q.id];
    if (!ans) return false;

    if (q.type === "mcq" || q.type === "true_false") {
      return ans === String(q.correctAnswer);
    } else if (q.type === "fill_blank") {
      const userNorm = normalizeArabicText(ans);
      if (Array.isArray(q.correctAnswer)) {
        return q.correctAnswer.some((cand) => normalizeArabicText(cand) === userNorm);
      }
      const correctNorm = normalizeArabicText(String(q.correctAnswer));
      return userNorm === correctNorm || userNorm.includes(correctNorm) || correctNorm.includes(userNorm);
    } else if (q.type === "essay") {
      return ans.trim().length > 15;
    }
    return false;
  };

  const handleFinishExam = () => {
    let scoreCount = 0;
    examQuestions.forEach((q) => {
      if (checkIsCorrect(q)) {
        scoreCount++;
      }
    });

    const percentage = Math.round((scoreCount / (examQuestions.length || 1)) * 100);
    setExamScore({
      raw: scoreCount,
      total: examQuestions.length,
      percentage,
    });
    setExamSubmitted(true);

    if (percentage >= 70) {
      fireConfetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
    }
  };

  const currentExamQ = examQuestions[currentExamIndex] || examQuestions[0];

  // Bank Filtered Questions
  const filteredBankQuestions = useMemo(() => {
    return allCurriculumQuestions.filter((q) => {
      const matchesSearch =
        !bankSearch.trim() ||
        q.questionText.toLowerCase().includes(bankSearch.toLowerCase()) ||
        q.lessonTitle.toLowerCase().includes(bankSearch.toLowerCase());
      const matchesChapter = bankChapter === "ALL" || q.chapterId === bankChapter;
      const matchesType = bankType === "ALL" || q.type === bankType;
      return matchesSearch && matchesChapter && matchesType;
    });
  }, [allCurriculumQuestions, bankSearch, bankChapter, bankType]);

  // Essay Bank Questions (28 ministerial questions)
  const essayQuestions = useMemo(() => {
    return allCurriculumQuestions.filter((q) => q.category === "exam_style");
  }, [allCurriculumQuestions]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl mb-8 box-border min-w-0">
        <div className="flex items-center gap-2.5 text-xs font-mono text-amber-400 mb-2">
          <Award className="w-5 h-5 text-amber-400" />
          <span className="font-bold">منصة الامتحانات الوطنية الشاملة — الصف الثاني الثانوي</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black mb-3">
          بنك الامتحانات والمحاكي الوزاري التفاعلي 🎯
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          اختبر جاهزيتك التامة عبر <strong>252 سؤالاً</strong> موزعة بدقة على كافة دروس المنهج، مع محاكي بوكليت الثانوية العامة الموقوت، والتصحيح الآلي الفوري، وسلم توزيع الدرجات الرسمي.
        </p>

        {/* Top Feature Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-xl sm:text-2xl font-black text-indigo-400 font-mono block">252</span>
            <span className="text-[11px] text-slate-400">إجمالي أسئلة المنهج</span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-xl sm:text-2xl font-black text-amber-400 font-mono block">28</span>
            <span className="text-[11px] text-slate-400">سؤالاً مقالياً [6 درجات]</span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono block">14</span>
            <span className="text-[11px] text-slate-400">درساً مغطى بالكامل</span>
          </div>
          <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            <span className="text-xl sm:text-2xl font-black text-purple-400 font-mono block">100%</span>
            <span className="text-[11px] text-slate-400">مطابقة للمعايير الوزارية</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="w-full flex flex-wrap gap-2 mb-8 bg-slate-950 p-2 rounded-2xl border border-slate-800 box-border">
        <button
          onClick={() => {
            setActiveTab("simulator");
          }}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "simulator"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>محاكي الامتحانات الموقوتة (بوكليت)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("bank");
          }}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "bank"
              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>مستكشف بنك الأسئلة الشامل ({allCurriculumQuestions.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("essay_bank");
          }}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === "essay_bank"
              ? "bg-amber-600 text-white shadow-lg shadow-amber-600/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Award className="w-4 h-4" />
          <span>الأسئلة المقالية الوزارية [6 درجات] ({essayQuestions.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: EXAM SIMULATOR MODE                               */}
      {/* ======================================================== */}
      {activeTab === "simulator" && (
        <div className="w-full space-y-6">
          {!examStarted ? (
            /* Exam Launcher / Preset Picker */
            <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 box-border">
              <div>
                <h3 className="text-xl sm:text-2xl font-black mb-1">اختر نموذج الاختبار المطلوب خوضه:</h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  تتضمن الامتحانات مؤقتاً زمنياً ونظام تصحيح فوري وشبكة تنقل سريعة تحاكي الاختبار الإلكتروني الرسمي.
                </p>
              </div>

              {/* Preset Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Final Full Exam */}
                <div
                  onClick={() => setSelectedExamPreset("FINAL_FULL")}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    selectedExamPreset === "FINAL_FULL"
                      ? "bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg"
                      : "bg-slate-950/60 hover:bg-slate-800/60 border-slate-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        النموذج الشامل المعتمد
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> 60 دقيقة
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">الامتحان التجريبي النهائي لكامل المنهج</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      30 سؤالاً شاملاً تغطي الفصول الأربعة بنسب متوازنة (اختيار من متعدد، صواب وخطأ، مصطلحات، وأسئلة مقالية وزارية).
                    </p>
                  </div>
                  <div className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                    <span>30 سؤالاً • 60 درجة</span>
                  </div>
                </div>

                {/* 2. Chapter 1 Exam */}
                <div
                  onClick={() => setSelectedExamPreset("CHAPTER_chapter-1")}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    selectedExamPreset === "CHAPTER_chapter-1"
                      ? "bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg"
                      : "bg-slate-950/60 hover:bg-slate-800/60 border-slate-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        امتحان الفصل 1
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-400" /> 35 دقيقة
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">تكنولوجيا المعلومات والمجتمع والذكاء الاصطناعي</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      18 سؤالاً مكثفاً حول تطور الحواسيب، شبكات SNS، خوارزميات ML/DL، وتطبيقات وأخلاقيات AI.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-blue-400">18 سؤالاً • 35 دقيقة</div>
                </div>

                {/* 3. Chapter 2 Exam */}
                <div
                  onClick={() => setSelectedExamPreset("CHAPTER_chapter-2")}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    selectedExamPreset === "CHAPTER_chapter-2"
                      ? "bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg"
                      : "bg-slate-950/60 hover:bg-slate-800/60 border-slate-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        امتحان الفصل 2
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" /> 35 دقيقة
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">الأمن السيبراني وحماية الشبكات</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      18 سؤالاً حول التشفير، الشهادات الرقمية، جدران الحماية، شبكات VPN، ودورة الاستجابة للحوادث ومصفوفة المخاطر.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-emerald-400">18 سؤالاً • 35 دقيقة</div>
                </div>

                {/* 4. Chapter 3 Exam */}
                <div
                  onClick={() => setSelectedExamPreset("CHAPTER_chapter-3")}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    selectedExamPreset === "CHAPTER_chapter-3"
                      ? "bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg"
                      : "bg-slate-950/60 hover:bg-slate-800/60 border-slate-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        امتحان الفصل 3
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-purple-400" /> 35 دقيقة
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">تطبيقات الويب والواجهات الأمامية</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      18 سؤالاً حول بنية 3-Tier، بروتوكولات HTTP/HTTPS، واجهات API، و HTML/CSS/JS والتصميم المتجاوب.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-purple-400">18 سؤالاً • 35 دقيقة</div>
                </div>

                {/* 5. Chapter 4 Exam */}
                <div
                  onClick={() => setSelectedExamPreset("CHAPTER_chapter-4")}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    selectedExamPreset === "CHAPTER_chapter-4"
                      ? "bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg"
                      : "bg-slate-950/60 hover:bg-slate-800/60 border-slate-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        امتحان الفصل 4
                      </span>
                      <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> 35 دقيقة
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white">تصميم الويب، الوسائط، وتجربة المستخدم</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      18 سؤالاً حول الوسائط المتجهة والنقطية، مبادئ CRAP، تصميم UCD، مؤشرات التحليل، ودورة PDCA واختبار A/B.
                    </p>
                  </div>
                  <div className="text-xs font-bold text-amber-400">18 سؤالاً • 35 دقيقة</div>
                </div>

                {/* 6. Custom Generator */}
                <div
                  onClick={() => setSelectedExamPreset("CUSTOM")}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-4 ${
                    selectedExamPreset === "CUSTOM"
                      ? "bg-indigo-950/70 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg"
                      : "bg-slate-950/60 hover:bg-slate-800/60 border-slate-800"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        امتحان مخصص
                      </span>
                      <Sliders className="w-4 h-4 text-teal-400" />
                    </div>
                    <h4 className="text-base font-bold text-white">توليد اختبار مخصص حسب رغبتك</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      حدد عدد الأسئلة (10 إلى 50) والفصل المراد التركيز عليه لخوض تدريب سريع ومخصص.
                    </p>
                  </div>

                  {selectedExamPreset === "CUSTOM" && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/60" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={customCount}
                        onChange={(e) => setCustomCount(Number(e.target.value))}
                        className="bg-slate-900 text-xs text-white p-2 rounded-xl border border-slate-700"
                      >
                        <option value={10}>10 أسئلة (15 دقيقة)</option>
                        <option value={20}>20 سؤالاً (30 دقيقة)</option>
                        <option value={30}>30 سؤالاً (45 دقيقة)</option>
                        <option value={50}>50 سؤالاً (75 دقيقة)</option>
                      </select>

                      <select
                        value={customChapter}
                        onChange={(e) => setCustomChapter(e.target.value)}
                        className="bg-slate-900 text-xs text-white p-2 rounded-xl border border-slate-700"
                      >
                        <option value="ALL">جميع فصول المنهج</option>
                        <option value="chapter-1">الفصل 1 فقط</option>
                        <option value="chapter-2">الفصل 2 فقط</option>
                        <option value="chapter-3">الفصل 3 فقط</option>
                        <option value="chapter-4">الفصل 4 فقط</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Start Button Action */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  onClick={() => handleStartExam(selectedExamPreset)}
                  className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>بدء الاختبار الآن (Start Exam)</span>
                </button>
              </div>
            </div>
          ) : !examSubmitted ? (
            /* ACTIVE EXAM RUNNER */
            <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 box-border min-w-0">
              {/* Exam Header: Timer, Stats & Controls */}
              <div className="w-full flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      جلسة الامتحان الرسمية
                    </h3>
                    <p className="text-xs text-slate-400">
                      السؤال {currentExamIndex + 1} من {examQuestions.length}
                    </p>
                  </div>
                </div>

                {/* Countdown Timer Widget & Instant Feedback Toggle */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Instant Feedback Toggle during Exam */}
                  <button
                    type="button"
                    onClick={() => setExamInstantFeedback(!examInstantFeedback)}
                    title="تفعيل التصحيح الفوري بعد الاختيار أثناء حل أسئلة البوكليت"
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                      examInstantFeedback
                        ? "bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-md"
                        : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>التصحيح بعد الاختيار: {examInstantFeedback ? "مفعل ⚡" : "مغلق"}</span>
                  </button>

                  <div
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-xs sm:text-sm ${
                      examTimeLeft < 300
                        ? "bg-red-950/80 border-red-500 text-red-300 animate-pulse"
                        : "bg-slate-950 border-slate-700 text-amber-300"
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>{formattedTime}</span>
                  </div>

                  <button
                    onClick={() => setIsTimerPaused(!isTimerPaused)}
                    title={isTimerPaused ? "استئناف المؤقت" : "إيقاف مؤقت"}
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition-all cursor-pointer"
                  >
                    {isTimerPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => {
                      if (confirm("هل أنت متأكد من رغبتك في إنهاء وتسليم ورقة الامتحان الآن؟")) {
                        handleFinishExam();
                      }
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    تسليم الامتحان 🏁
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (Object.keys(userExamAnswers).length / examQuestions.length) * 100
                    )}%`,
                  }}
                />
              </div>

              {/* Interactive 1..N Jump Strip */}
              <div className="w-full flex flex-wrap gap-1.5 pb-2">
                {examQuestions.map((q, idx) => {
                  const isCurrent = idx === currentExamIndex;
                  const isAnswered = !!userExamAnswers[q.id];
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentExamIndex(idx)}
                      className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 ${
                        isCurrent
                          ? "bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md scale-105"
                          : isAnswered
                          ? "bg-emerald-950/80 border border-emerald-500/50 text-emerald-300"
                          : "bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Question Card Container */}
              <div className="w-full space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      سؤال {currentExamIndex + 1} ({currentExamQ.lessonTitle})
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {currentExamQ.type === "mcq"
                        ? "اختيار من متعدد"
                        : currentExamQ.type === "true_false"
                        ? "صواب أم خطأ"
                        : currentExamQ.type === "fill_blank"
                        ? "إكمال فراغ بالمصطلح"
                        : "سؤال مقالي وزاري [6 درجات]"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Show Answer Button on Current Question */}
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedExamAnswers((prev) => ({
                          ...prev,
                          [currentExamQ.id]: !prev[currentExamQ.id],
                        }))
                      }
                      className={`text-xs flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer border ${
                        revealedExamAnswers[currentExamQ.id]
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                          : "text-indigo-300 hover:text-white bg-indigo-500/15 hover:bg-indigo-500/25 border-indigo-500/30"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span>
                        {revealedExamAnswers[currentExamQ.id] ? "إخفاء الإجابة" : "إظهار الإجابة والشرح 👁️"}
                      </span>
                    </button>

                    <span className="text-xs font-bold text-amber-400 px-2 py-0.5 bg-amber-950/60 rounded border border-amber-500/30">
                      {currentExamQ.marks || (currentExamQ.type === "essay" ? 6 : 2)} درجات
                    </span>
                  </div>
                </div>

                {/* Question Text Box with Fixed Min Height & Strict Full Width */}
                <div className="w-full min-w-full bg-slate-950/80 p-5 sm:p-6 rounded-2xl border border-slate-800 min-h-[90px] flex items-center box-border">
                  <p className="w-full text-base sm:text-lg font-bold text-slate-100 leading-relaxed break-words">
                    {currentExamQ.questionText}
                  </p>
                </div>

                {/* Question Option Inputs by Type */}
                {(() => {
                  const isUserAnswered = !!userExamAnswers[currentExamQ.id];
                  const isRevealed = !!revealedExamAnswers[currentExamQ.id];
                  const shouldShowFeedback = (examInstantFeedback && isUserAnswered) || isRevealed;
                  const isCurrentCorrect = checkIsCorrect(currentExamQ);

                  return (
                    <div className="w-full space-y-5">
                      {/* 1. MCQ */}
                      {currentExamQ.type === "mcq" && currentExamQ.options && (
                        <div className="w-full space-y-3">
                          {currentExamQ.options.map((opt) => {
                            const isSelected = userExamAnswers[currentExamQ.id] === opt.id;
                            const isCorrectOpt = opt.id === String(currentExamQ.correctAnswer);

                            let btnStyle = "bg-slate-950/50 hover:bg-slate-800/70 border-slate-800 text-slate-300";
                            let badgeStyle = "bg-slate-800 text-slate-400 border border-slate-700";

                            if (shouldShowFeedback) {
                              if (isCorrectOpt) {
                                btnStyle = "bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 font-bold shadow-lg";
                                badgeStyle = "bg-emerald-600 text-white font-bold";
                              } else if (isSelected && !isCorrectOpt) {
                                btnStyle = "bg-red-950/90 border-red-500 text-red-100 ring-2 ring-red-500/50 font-bold shadow-lg";
                                badgeStyle = "bg-red-600 text-white font-bold";
                              } else {
                                btnStyle = "bg-slate-950/30 opacity-60 border-slate-900 text-slate-500";
                              }
                            } else if (isSelected) {
                              btnStyle = "bg-indigo-950/80 border-indigo-500 text-indigo-100 ring-2 ring-indigo-500/40 font-semibold shadow-lg";
                              badgeStyle = "bg-indigo-600 text-white shadow-sm";
                            }

                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleSelectExamOption(currentExamQ.id, opt.id)}
                                className={`w-full min-w-full p-4 rounded-2xl border text-right text-sm leading-relaxed transition-all cursor-pointer flex items-start gap-3.5 box-border ${btnStyle}`}
                              >
                                <span
                                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono shrink-0 ${badgeStyle}`}
                                >
                                  {shouldShowFeedback && isCorrectOpt ? (
                                    <Check className="w-4 h-4" />
                                  ) : shouldShowFeedback && isSelected && !isCorrectOpt ? (
                                    <X className="w-4 h-4" />
                                  ) : (
                                    opt.id.toUpperCase()
                                  )}
                                </span>
                                <span className="pt-0.5 break-words flex-1">{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* 2. True / False */}
                      {currentExamQ.type === "true_false" && (
                        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(() => {
                            const userAns = userExamAnswers[currentExamQ.id];
                            const correctAns = String(currentExamQ.correctAnswer).toLowerCase();
                            const isTrueCorrect = correctAns === "true" || correctAns === "t" || correctAns === "a";

                            let trueBtnClass = "bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300";
                            let falseBtnClass = "bg-slate-950/60 hover:bg-slate-800 border-slate-800 text-slate-300";

                            if (shouldShowFeedback) {
                              if (isTrueCorrect) {
                                trueBtnClass = "bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 font-bold";
                                falseBtnClass = userAns === "false"
                                  ? "bg-red-950/90 border-red-500 text-red-200 ring-2 ring-red-500/50 font-bold"
                                  : "bg-slate-950/30 opacity-50 border-slate-900 text-slate-500";
                              } else {
                                falseBtnClass = "bg-emerald-950/90 border-emerald-500 text-emerald-100 ring-2 ring-emerald-500/50 font-bold";
                                trueBtnClass = userAns === "true"
                                  ? "bg-red-950/90 border-red-500 text-red-200 ring-2 ring-red-500/50 font-bold"
                                  : "bg-slate-950/30 opacity-50 border-slate-900 text-slate-500";
                              }
                            } else {
                              if (userAns === "true") {
                                trueBtnClass = "bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/30 shadow-lg";
                              } else if (userAns === "false") {
                                falseBtnClass = "bg-red-950/80 border-red-500 text-red-200 ring-2 ring-red-500/30 shadow-lg";
                              }
                            }

                            return (
                              <>
                                <button
                                  onClick={() => handleSelectExamOption(currentExamQ.id, "true")}
                                  className={`w-full p-4 rounded-2xl border text-center text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-3 box-border ${trueBtnClass}`}
                                >
                                  <Check className="w-5 h-5 text-emerald-400 shrink-0" />
                                  <span>صواب (○ عبارة صحيحة)</span>
                                </button>

                                <button
                                  onClick={() => handleSelectExamOption(currentExamQ.id, "false")}
                                  className={`w-full p-4 rounded-2xl border text-center text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-3 box-border ${falseBtnClass}`}
                                >
                                  <X className="w-5 h-5 text-red-400 shrink-0" />
                                  <span>خطأ (× عبارة خاطئة)</span>
                                </button>
                              </>
                            );
                          })()}
                        </div>
                      )}

                      {/* 3. Fill in Blank */}
                      {currentExamQ.type === "fill_blank" && (
                        <div className="w-full space-y-2">
                          <label className="text-xs text-slate-400 block font-semibold">
                            اكتب المصطلح أو العبارة الدقيقة:
                          </label>
                          <input
                            type="text"
                            value={userExamAnswers[currentExamQ.id] || ""}
                            onChange={(e) => handleSelectExamOption(currentExamQ.id, e.target.value)}
                            placeholder="اكتب الإجابة العلمية هنا..."
                            className="w-full min-w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-white focus:outline-none focus:border-indigo-500 box-border"
                          />
                        </div>
                      )}

                      {/* 4. Essay */}
                      {currentExamQ.type === "essay" && (
                        <div className="w-full space-y-3">
                          <label className="text-xs text-slate-300 block font-bold">
                            اكتب إجابتك التحليلية الكاملة:
                          </label>
                          <textarea
                            rows={5}
                            value={userExamAnswers[currentExamQ.id] || ""}
                            onChange={(e) => handleSelectExamOption(currentExamQ.id, e.target.value)}
                            placeholder="صغ إجابتك المنطقية بالاستناد لمفاهيم ومعايير الدرس..."
                            className="w-full min-w-full p-4 bg-slate-950 border border-slate-700 rounded-2xl text-sm text-white focus:outline-none focus:border-amber-500 resize-y leading-relaxed box-border"
                          />
                        </div>
                      )}

                      {/* Immediate Feedback Card in Exam Runner */}
                      {shouldShowFeedback && (
                        <div
                          className={`w-full p-5 sm:p-6 rounded-2xl border space-y-3 animate-fadeIn box-border ${
                            isCurrentCorrect
                              ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-100 shadow-lg"
                              : isUserAnswered
                              ? "bg-red-950/20 border-red-500/40 text-slate-200 shadow-lg"
                              : "bg-slate-950/90 border-indigo-500/40 text-slate-200 shadow-lg"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                            <div className="flex items-center gap-2">
                              {isCurrentCorrect ? (
                                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs sm:text-sm">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                  <span>إجابة صحيحة! أحسنت 🎯</span>
                                </div>
                              ) : isUserAnswered ? (
                                <div className="flex items-center gap-1.5 text-red-400 font-bold text-xs sm:text-sm">
                                  <XCircle className="w-5 h-5 text-red-400" />
                                  <span>إجابة غير صحيحة — الإجابة الصحيحة أدناه:</span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs sm:text-sm">
                                  <Sparkles className="w-5 h-5 text-indigo-400" />
                                  <span>الإجابة النموذجية المعتمدة والتفسير العلمي:</span>
                                </div>
                              )}
                            </div>
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                              {isRevealed ? "كشف الإجابة" : "تصحيح فوري"}
                            </span>
                          </div>

                          <div className="text-xs sm:text-sm space-y-1 pt-1">
                            <div className="flex items-start gap-2">
                              <strong className="text-emerald-400 shrink-0 font-bold">الإجابة النموذجية:</strong>
                              <span className="font-semibold text-emerald-200 leading-relaxed">
                                {Array.isArray(currentExamQ.correctAnswer)
                                  ? currentExamQ.correctAnswer.join(" / ")
                                  : typeof currentExamQ.correctAnswer === "object"
                                  ? JSON.stringify(currentExamQ.correctAnswer)
                                  : String(currentExamQ.correctAnswer)}
                              </span>
                            </div>
                          </div>

                          {currentExamQ.explanation && (
                            <div className="text-xs text-slate-300 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                              <strong className="text-indigo-300 block mb-1 font-bold">
                                📖 الشرح والتفسير العلمي:
                              </strong>
                              {currentExamQ.explanation}
                            </div>
                          )}

                          {currentExamQ.rubricCriteria && (
                            <div className="p-3.5 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs space-y-1.5 text-amber-200">
                              <strong className="block text-amber-300 font-bold mb-1">
                                📋 معايير توزيع درجات المصحح (Rubric):
                              </strong>
                              {currentExamQ.rubricCriteria.map((c, i) => (
                                <div key={i}>• {c}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Exam Navigation Buttons */}
                <div className="w-full flex flex-wrap justify-between items-center gap-3 pt-6 border-t border-slate-800">
                  <button
                    disabled={currentExamIndex === 0}
                    onClick={() => setCurrentExamIndex((prev) => Math.max(0, prev - 1))}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-slate-200"
                  >
                    <ChevronRight className="w-4 h-4" /> السؤال السابق
                  </button>

                  {currentExamIndex < examQuestions.length - 1 ? (
                    <button
                      onClick={() =>
                        setCurrentExamIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))
                      }
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-white shadow-lg shadow-indigo-600/25"
                    >
                      السؤال التالي <ChevronLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleFinishExam}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-black rounded-xl shadow-xl shadow-emerald-600/30 transition-all cursor-pointer flex items-center gap-2 text-white scale-105"
                    >
                      <Sparkles className="w-4 h-4" /> إنهاء وتسليم الامتحان الرسمي
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* EXAM RESULTS & FULL BOOKLET REVIEW */
            <div className="w-full space-y-6 animate-fadeIn">
              {/* Score summary card */}
              <div className="w-full p-8 bg-gradient-to-br from-slate-950 to-indigo-950/40 rounded-3xl border border-slate-800 text-center shadow-xl space-y-4 box-border">
                <div className="inline-flex p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                  <Award className="w-12 h-12" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  نتيجة اختبار البوكليت الرسمي
                </h3>

                <div className="flex items-center justify-center gap-2 my-2">
                  <span className="text-5xl font-black text-indigo-400 font-mono">
                    {examScore.percentage}%
                  </span>
                  <span className="text-lg text-slate-400 font-mono">
                    ({examScore.raw} من {examScore.total} سؤالاً صحيحاً)
                  </span>
                </div>

                <div className="w-64 mx-auto bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-emerald-500 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${examScore.percentage}%` }}
                  />
                </div>

                <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                  {examScore.percentage >= 85
                    ? "ممتاز ومرتبة شرف! أداء استثنائي يعكس إتقاناً كاملاً لجميع معايير المنهج 🏆"
                    : examScore.percentage >= 65
                    ? "جيد جداً! راجع الأسئلة الخاطئة ونموذج الإجابة الرسمي بالأسفل لسد أي ثغرات."
                    : "تحتاج إلى مزيد من المراجعة والتدريب على بنك الأسئلة لإتقان المفاهيم."}
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => setReviewMistakesOnly(!reviewMistakesOnly)}
                    className={`text-xs font-bold px-4 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      reviewMistakesOnly
                        ? "bg-red-600 text-white border-red-500"
                        : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
                    }`}
                  >
                    {reviewMistakesOnly ? "عرض جميع الأسئلة" : "عرض الأسئلة غير الصحيحة فقط"}
                  </button>

                  <button
                    onClick={() => setExamStarted(false)}
                    className="text-xs font-bold px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-indigo-600/25"
                  >
                    <RotateCcw className="w-4 h-4" /> خوض امتحان جديد
                  </button>
                </div>
              </div>

              {/* Detailed Review Cards */}
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-base text-slate-200">
                    مراجعة تفصيلية لورقة الإجابة ونموذج الوزارة:
                  </h4>
                  <span className="text-xs text-slate-400">
                    {reviewMistakesOnly
                      ? "الأسئلة غير الصحيحة فقط"
                      : `جميع أسئلة الامتحان (${examQuestions.length})`}
                  </span>
                </div>

                {examQuestions
                  .filter((q) => (reviewMistakesOnly ? !checkIsCorrect(q) : true))
                  .map((q, idx) => {
                    const isCorrect = checkIsCorrect(q);
                    const userAns = userExamAnswers[q.id];

                    return (
                      <div
                        key={q.id}
                        className={`w-full p-5 sm:p-6 rounded-2xl border space-y-3 box-border ${
                          isCorrect
                            ? "bg-slate-950/70 border-emerald-500/30"
                            : "bg-slate-950/70 border-red-500/30"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                                س{idx + 1}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                {q.lessonTitle}
                              </span>
                            </div>
                            <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
                              {q.questionText}
                            </p>
                          </div>

                          {isCorrect ? (
                            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold shrink-0 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>صحيحة</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-red-400 text-xs font-bold shrink-0 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">
                              <XCircle className="w-4 h-4" />
                              <span>غير صحيحة</span>
                            </div>
                          )}
                        </div>

                        <div className="text-xs space-y-2 pt-2 border-t border-slate-900">
                          <div className="flex items-start gap-2 text-slate-400">
                            <strong className="text-slate-300 shrink-0">إجابتك:</strong>
                            <span className={isCorrect ? "text-emerald-300 font-medium" : "text-red-300 font-medium"}>
                              {userAns || "لم تتم الإجابة"}
                            </span>
                          </div>

                          <div className="flex items-start gap-2 text-emerald-400">
                            <strong className="text-emerald-300 shrink-0">الإجابة النموذجية المعتمدة:</strong>
                            <span className="font-medium text-emerald-200">
                              {Array.isArray(q.correctAnswer)
                                ? q.correctAnswer.join(" / ")
                                : typeof q.correctAnswer === "object"
                                ? JSON.stringify(q.correctAnswer)
                                : String(q.correctAnswer)}
                            </span>
                          </div>

                          {q.explanation && (
                            <div className="text-slate-300 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 mt-2 leading-relaxed text-xs">
                              <strong className="text-indigo-300 block mb-1 font-bold">
                                📖 الشرح والتفسير العلمي:
                              </strong>
                              {q.explanation}
                            </div>
                          )}

                          {q.rubricCriteria && (
                            <div className="p-3 bg-amber-950/30 border border-amber-500/30 rounded-xl text-xs space-y-1 text-amber-200">
                              <strong className="block text-amber-300 font-bold mb-1">
                                سلم توزيع درجات المصحح:
                              </strong>
                              {q.rubricCriteria.map((c, i) => (
                                <div key={i}>• {c}</div>
                              ))}
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
      )}

      {/* ======================================================== */}
      {/* TAB 2: COMPLETE 252 QUESTION BANK BROWSER                */}
      {/* ======================================================== */}
      {activeTab === "bank" && (
        <div className="w-full space-y-6 animate-fadeIn">
          {/* Bank Filters Bar */}
          <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-white shadow-xl space-y-4 box-border">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                <input
                  type="text"
                  value={bankSearch}
                  onChange={(e) => setBankSearch(e.target.value)}
                  placeholder="ابحث بالكلمات المفتاحية في كافة أسئلة المنهج..."
                  className="w-full pr-10 pl-4 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 box-border"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={bankChapter}
                  onChange={(e) => setBankChapter(e.target.value)}
                  className="flex-1 md:flex-none bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700"
                >
                  <option value="ALL">جميع الفصول (4 فصول)</option>
                  <option value="chapter-1">الفصل 1: تكنولوجيا المعلومات والمجتمع</option>
                  <option value="chapter-2">الفصل 2: الأمن السيبراني</option>
                  <option value="chapter-3">الفصل 3: تطبيقات الويب</option>
                  <option value="chapter-4">الفصل 4: تصميم الويب والوسائط</option>
                </select>

                <select
                  value={bankType}
                  onChange={(e) => setBankType(e.target.value)}
                  className="flex-1 md:flex-none bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700"
                >
                  <option value="ALL">جميع أنواع الأسئلة</option>
                  <option value="mcq">اختيار من متعدد</option>
                  <option value="true_false">صواب أم خطأ</option>
                  <option value="fill_blank">إكمال فراغات</option>
                  <option value="essay">أسئلة مقالية [6 درجات]</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
              <span>النتائج المطابقة: <strong>{filteredBankQuestions.length}</strong> سؤالاً</span>
              <button
                onClick={() => {
                  setBankSearch("");
                  setBankChapter("ALL");
                  setBankType("ALL");
                }}
                className="text-xs text-indigo-400 hover:underline cursor-pointer"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          </div>

          {/* Question Cards List */}
          <div className="w-full space-y-4">
            {filteredBankQuestions.map((q, idx) => {
              const isRevealed = !!revealedBankAnswers[q.id];

              return (
                <div
                  key={q.id}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg space-y-3 box-border"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-xs px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-md border border-emerald-500/30">
                        سؤال #{idx + 1}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        الفصل {q.chapterNumber} • الدرس {q.lessonNumber} ({q.lessonTitle})
                      </span>
                    </div>

                    <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {q.type === "mcq"
                        ? "اختيار من متعدد"
                        : q.type === "true_false"
                        ? "صواب أم خطأ"
                        : q.type === "fill_blank"
                        ? "إكمال فراغ"
                        : "سؤال مقالي وزاري"}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base font-bold text-slate-100 leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* Options display if MCQ */}
                  {q.type === "mcq" && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt) => (
                        <div
                          key={opt.id}
                          className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300"
                        >
                          {opt.text}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Reveal */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() =>
                        setRevealedBankAnswers((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                      }
                      className={`text-xs font-bold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isRevealed
                          ? "bg-slate-800 text-slate-300 border-slate-700"
                          : "bg-emerald-600/90 hover:bg-emerald-600 text-white border-emerald-500 shadow-md"
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isRevealed ? "إخفاء الحل" : "عرض الإجابة والشرح 🔍"}</span>
                    </button>
                  </div>

                  {isRevealed && (
                    <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs space-y-2 text-emerald-100 animate-fadeIn">
                      <div>
                        <strong className="text-emerald-400 block mb-1">الإجابة الصحيحة:</strong>
                        <span>
                          {Array.isArray(q.correctAnswer)
                            ? q.correctAnswer.join(" / ")
                            : typeof q.correctAnswer === "object"
                            ? JSON.stringify(q.correctAnswer)
                            : String(q.correctAnswer)}
                        </span>
                      </div>
                      {q.explanation && (
                        <div className="text-slate-300 bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                          <strong className="text-indigo-300 block mb-0.5">الشرح والتفسير:</strong>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: ESSAY & ANALYTICAL BANK [6 MARKS]                 */}
      {/* ======================================================== */}
      {activeTab === "essay_bank" && (
        <div className="w-full space-y-6 animate-fadeIn">
          <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-3 box-border">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Award className="w-4 h-4" />
              <span>الأسئلة المقالية والتحليلية المعتمدة لتقييم مخرجات التعلم العليا</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black">
              بنك الأسئلة المقالية الوزارية [6 درجات]
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              28 سؤالاً تحليلياً شاملاً تغطي كافة دروس المنهج ومزودة بسلم توزيع الدرجات (Rubrics) ونماذج الإجابة النموذجية المعتمدة.
            </p>
          </div>

          <div className="w-full space-y-6">
            {essayQuestions.map((q, idx) => {
              const isRevealed = !!revealedBankAnswers[q.id];

              return (
                <div
                  key={q.id}
                  className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4 box-border"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-bold rounded-lg border border-amber-500/30">
                        سؤال الامتحان المقالي {idx + 1}
                      </span>
                      <span className="text-slate-400">
                        الدرس {q.lessonNumber}: {q.lessonTitle}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-red-400 px-2.5 py-0.5 bg-red-950/60 rounded-md border border-red-500/30">
                      {q.marks || 6} درجات
                    </span>
                  </div>

                  <p className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                    {q.questionText}
                  </p>

                  {/* Rubric Criteria */}
                  {q.rubricCriteria && (
                    <div className="w-full p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300 box-border">
                      <span className="font-bold text-amber-400 block mb-1">
                        📋 سلم توزيع درجات المصحح الرسمي (Grading Rubric):
                      </span>
                      {q.rubricCriteria.map((crit, cIdx) => (
                        <div key={cIdx} className="flex items-start gap-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{crit}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Model Answer Toggle */}
                  <div className="pt-2 flex justify-between items-center">
                    <button
                      onClick={() =>
                        setRevealedBankAnswers((prev) => ({ ...prev, [q.id]: !prev[q.id] }))
                      }
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                        isRevealed
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                          : "bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/25"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{isRevealed ? "إخفاء الإجابة النموذجية" : "عرض الإجابة النموذجية الرسمية 🔍"}</span>
                    </button>
                  </div>

                  {isRevealed && (
                    <div className="w-full p-5 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl text-xs sm:text-sm leading-relaxed text-emerald-100 space-y-2 animate-fadeIn box-border">
                      <div className="flex items-center gap-2 font-bold text-emerald-400">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>الإجابة النموذجية المعتمدة:</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                        {String(q.correctAnswer)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

