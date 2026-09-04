"use client";

import React, { useState, useMemo } from "react";
import {
  ExamScope,
  ExamGenerationConfig,
  CommitteeQuestionType,
  ProfilePreset,
} from "@/lib/exam-generator/types";
import { EXAM_PROFILES } from "@/lib/exam-generator/profiles";
import { CURRICULUM_DATA } from "@/data/curriculum";
import {
  Sparkles,
  Sliders,
  Layers,
  BookOpen,
  Award,
  Zap,
  CheckSquare,
  Square,
  ShieldCheck,
  CheckCircle2,
  Settings2,
  RotateCcw,
  Clock,
  HelpCircle,
  FileCheck2,
} from "lucide-react";

interface ExamGeneratorStudioProps {
  onGenerate: (config: ExamGenerationConfig) => void;
}

export function ExamGeneratorStudio({ onGenerate }: ExamGeneratorStudioProps) {
  // Scope State
  const [scope, setScope] = useState<ExamScope>("curriculum");
  const [selectedSingleLesson, setSelectedSingleLesson] = useState<string>("lesson-1-1");
  const [selectedMultipleLessons, setSelectedMultipleLessons] = useState<string[]>([
    "lesson-1-1",
    "lesson-1-2",
  ]);
  const [selectedChapter, setSelectedChapter] = useState<string>("chapter-1");

  // Presets & Controls State
  const [selectedProfileId, setSelectedProfileId] = useState<string>("final_exam");
  const [questionCount, setQuestionCount] = useState<number | "max">(30);
  const [examCount, setExamCount] = useState<number>(1);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [totalMarks, setTotalMarks] = useState<number>(60);

  // Question Types Selection
  const [questionTypes, setQuestionTypes] = useState<CommitteeQuestionType[] | "all">("all");

  // Difficulty preset
  const [difficultyPreset, setDifficultyPreset] = useState<
    "balanced" | "recall_heavy" | "analytical" | "excellent_student" | "custom"
  >("balanced");

  const [difficultyDistribution, setDifficultyDistribution] = useState({
    easy: 25,
    medium: 40,
    hard: 25,
    higherOrder: 10,
  });

  // Toggles
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [includeSourceReferences, setIncludeSourceReferences] = useState(true);
  const [useExactBookAnswers, setUseExactBookAnswers] = useState(true);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);

  // Flattened lessons list
  const allLessons = useMemo(() => {
    return CURRICULUM_DATA.flatMap((ch) =>
      ch.lessons.map((l) => ({
        id: l.id,
        number: l.number,
        title: l.title,
        chapterId: ch.id,
        chapterNumber: ch.number,
        chapterTitle: ch.title,
      }))
    );
  }, []);

  // Handle Profile Click
  const handleApplyProfile = (profile: ProfilePreset) => {
    setSelectedProfileId(profile.id);
    const cfg = profile.config;

    if (cfg.scope) setScope(cfg.scope);
    if (cfg.questionCount !== undefined) setQuestionCount(cfg.questionCount);
    if (cfg.examCount !== undefined) setExamCount(cfg.examCount);
    if (cfg.durationMinutes !== undefined) setDurationMinutes(cfg.durationMinutes);
    if (cfg.totalMarks !== undefined) setTotalMarks(cfg.totalMarks);
    if (cfg.difficultyPreset) setDifficultyPreset(cfg.difficultyPreset);
    if (cfg.difficultyDistribution) setDifficultyDistribution(cfg.difficultyDistribution);
    if (cfg.questionTypes) setQuestionTypes(cfg.questionTypes);
    if (cfg.randomizeQuestions !== undefined) setRandomizeQuestions(cfg.randomizeQuestions);
    if (cfg.randomizeOptions !== undefined) setRandomizeOptions(cfg.randomizeOptions);
  };

  // Toggle multiple lessons selection
  const toggleLessonInMultiple = (lId: string) => {
    setSelectedMultipleLessons((prev) => {
      if (prev.includes(lId)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter((id) => id !== lId);
      } else {
        return [...prev, lId];
      }
    });
  };

  // Handle question type toggle
  const availableQuestionTypes: { id: CommitteeQuestionType; label: string }[] = [
    { id: "mcq", label: "اختيار من متعدد (MCQ)" },
    { id: "true_false", label: "صواب أم خطأ" },
    { id: "term", label: "المصطلح العلمي" },
    { id: "give_reason", label: "علل واذكر السبب" },
    { id: "explain", label: "اشرح ووضح" },
    { id: "compare", label: "مقارنة في جدول" },
    { id: "order", label: "ترتيب تسلسلي" },
    { id: "classify", label: "تصنيف حسب الفئات" },
    { id: "odd_one_out", label: "اختر الكلمة الشاذة" },
    { id: "complete", label: "إكمال الفراغات" },
    { id: "matching", label: "المطابقة والتوصيل" },
    { id: "essay", label: "سؤال مقالي وزاري [6 درجات]" },
    { id: "cross_lesson", label: "ربط تكاملي بين الدروس" },
  ];

  const toggleQuestionType = (tId: CommitteeQuestionType) => {
    if (questionTypes === "all") {
      setQuestionTypes([tId]);
    } else {
      if (questionTypes.includes(tId)) {
        const next = questionTypes.filter((t) => t !== tId);
        setQuestionTypes(next.length === 0 ? "all" : next);
      } else {
        setQuestionTypes([...questionTypes, tId]);
      }
    }
  };

  // Trigger Centralized Pipeline
  const handleGenerateClick = () => {
    let finalLessonIds: string[] = [];
    if (scope === "single_lesson") {
      finalLessonIds = [selectedSingleLesson];
    } else if (scope === "multiple_lessons") {
      finalLessonIds = selectedMultipleLessons;
    } else if (scope === "chapter") {
      const ch = CURRICULUM_DATA.find((c) => c.id === selectedChapter);
      finalLessonIds = ch ? ch.lessons.map((l) => l.id) : [];
    } else {
      finalLessonIds = allLessons.map((l) => l.id);
    }

    const config: ExamGenerationConfig = {
      scope,
      lessonIds: finalLessonIds,
      chapterId: scope === "chapter" ? selectedChapter : undefined,
      questionCount,
      examCount,
      questionTypes,
      difficultyPreset,
      difficultyDistribution,
      totalMarks,
      durationMinutes,
      includeAnswers,
      includeSourceReferences,
      useExactBookAnswers,
      randomizeQuestions,
      randomizeOptions,
      selectedProfile: selectedProfileId,
    };

    onGenerate(config);
  };

  return (
    <div className="w-full space-y-6">
      {/* Studio Header Card */}
      <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-4 box-border min-w-0">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
          <ShieldCheck className="w-5 h-5 text-amber-400" />
          <span className="font-bold">
            لجنة واضعي الامتحانات الوطنية ومقاييس جودة التعليم المدرسي
          </span>
        </div>

        <h2 className="text-xl sm:text-3xl font-black">
          مولد الامتحانات وبنك الأسئلة المعتمد بالذكاء الاصطناعي 🎯
        </h2>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-4xl">
          قم بتوليد اختبارات بوكليت وبنوك أسئلة متدرجة الصعوبة (من التذكر حتى التحليل والتفكير العليا)
          وفق جدول مواصفات رسمي متوازن. يعتمد المولد حصراً على نصوص كتاب الوزارة كـ <strong>مصدر وحيد للحقيقة</strong>،
          مع توثيق مراجع الصفحات ونصوص الإجابة الحرفية وسلالم التصحيح.
        </p>

        {/* Committee Quality Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-xs text-slate-300">مطابقة 100% لكتاب الوزارة</span>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="text-xs text-slate-300">5 مستويات معرفية متدرجة</span>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs text-slate-300">نماذج متكافئة (A / B / C)</span>
          </div>
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span className="text-xs text-slate-300">جاهز للطباعة وخوض الاختبار</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* STEP 1: SCOPE SELECTION (نطاق التوليد المركزي)            */}
      {/* ======================================================== */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-5 box-border">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Layers className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base sm:text-lg font-black">
            1. تحديد نطاق المحتوى العلمي (Scope Selection):
          </h3>
        </div>

        {/* 4 Scope Radio Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Scope A: Single Lesson */}
          <div
            onClick={() => setScope("single_lesson")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              scope === "single_lesson"
                ? "bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg"
                : "bg-slate-950/60 hover:bg-slate-800/60 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300">أ. درس مفرد</span>
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <h4 className="text-sm font-bold text-white">اختبار لدرس واحد</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              توليد أسئلة مركزة حصراً من درس تعليمي واحد محدد.
            </p>
          </div>

          {/* Scope B: Multiple Lessons */}
          <div
            onClick={() => setScope("multiple_lessons")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              scope === "multiple_lessons"
                ? "bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg"
                : "bg-slate-950/60 hover:bg-slate-800/60 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300">ب. عدة دروس</span>
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <h4 className="text-sm font-bold text-white">مجموعة دروس مختارة</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              اختيار تشكيلة محددة من الدروس مع توزيع متوازن للأسئلة.
            </p>
          </div>

          {/* Scope C: Full Chapter */}
          <div
            onClick={() => setScope("chapter")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              scope === "chapter"
                ? "bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg"
                : "bg-slate-950/60 hover:bg-slate-800/60 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">جـ. فصل كامل</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="text-sm font-bold text-white">وحدة / فصل دراسي</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              تغطية جميع دروس الفصل المختار بنسب مواصفات متكافئة.
            </p>
          </div>

          {/* Scope D: Entire Curriculum */}
          <div
            onClick={() => setScope("curriculum")}
            className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
              scope === "curriculum"
                ? "bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg"
                : "bg-slate-950/60 hover:bg-slate-800/60 border-slate-800"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-300">د. كامل المنهج</span>
              <Award className="w-4 h-4 text-purple-400" />
            </div>
            <h4 className="text-sm font-bold text-white">الكتاب الدراسي كاملاً</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              امتحان شامل لكافة الفصول الـ 4 والدروس الـ 14 مع أسئلة ربط تكاملية.
            </p>
          </div>
        </div>

        {/* Dynamic Scope Selector Controls */}
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
          {scope === "single_lesson" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                اختر الدرس المراد إعداد أسئلته:
              </label>
              <select
                value={selectedSingleLesson}
                onChange={(e) => setSelectedSingleLesson(e.target.value)}
                className="w-full bg-slate-900 text-xs sm:text-sm text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
              >
                {allLessons.map((l) => (
                  <option key={l.id} value={l.id}>
                    الفصل {l.chapterNumber} • الدرس {l.number}: {l.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {scope === "multiple_lessons" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  حدد الدروس المطلوبة ({selectedMultipleLessons.length} دروس مختارة):
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedMultipleLessons.length === allLessons.length) {
                      setSelectedMultipleLessons(["lesson-1-1"]);
                    } else {
                      setSelectedMultipleLessons(allLessons.map((l) => l.id));
                    }
                  }}
                  className="text-xs text-indigo-400 hover:underline cursor-pointer"
                >
                  {selectedMultipleLessons.length === allLessons.length ? "إلغاء التحديد" : "تحديد الكل"}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                {allLessons.map((l) => {
                  const isChecked = selectedMultipleLessons.includes(l.id);
                  return (
                    <div
                      key={l.id}
                      onClick={() => toggleLessonInMultiple(l.id)}
                      className={`p-2.5 rounded-xl border text-xs transition-all cursor-pointer flex items-center gap-2 ${
                        isChecked
                          ? "bg-indigo-950/70 border-indigo-500/60 text-white"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span className="truncate">
                        {l.number}: {l.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {scope === "chapter" && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300 block">
                اختر الفصل الدراسي المستهدف:
              </label>
              <select
                value={selectedChapter}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full bg-slate-900 text-xs sm:text-sm text-white p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500"
              >
                {CURRICULUM_DATA.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    الفصل {ch.number}: {ch.title} ({ch.lessons.length} دروس)
                  </option>
                ))}
              </select>
            </div>
          )}

          {scope === "curriculum" && (
            <div className="text-xs text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                سيتم استخلاص وتوزيع الأسئلة على جميع فصول المنهج الـ 4 والدروس الـ 14 كاملة مع إتاحة
                أسئلة الربط التكاملي بين الدروس.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* STEP 2: EXAMINATION PROFILES & PRESETS                   */}
      {/* ======================================================== */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4 box-border">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Zap className="w-5 h-5 text-amber-400" />
          <h3 className="text-base sm:text-lg font-black">
            2. النماذج الجاهزة والمخططات الامتحانية (Profiles):
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {EXAM_PROFILES.map((prof) => {
            const isSelected = selectedProfileId === prof.id;
            return (
              <div
                key={prof.id}
                onClick={() => handleApplyProfile(prof)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? "bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/40 shadow-lg"
                    : "bg-slate-950/60 hover:bg-slate-800/60 border-slate-800"
                }`}
              >
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 inline-block">
                    {prof.badge}
                  </span>
                  <h4 className="text-sm font-bold text-white">{prof.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {prof.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* STEP 3: FINE-TUNING & GENERATION CONTROLS                */}
      {/* ======================================================== */}
      <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-6 box-border">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Settings2 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base sm:text-lg font-black">
            3. معايير الضبط التفصيلية (Generation Controls):
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Question Count */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">عدد الأسئلة للنموذج:</label>
            <select
              value={questionCount}
              onChange={(e) =>
                setQuestionCount(e.target.value === "max" ? "max" : Number(e.target.value))
              }
              className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700"
            >
              <option value={10}>10 أسئلة (تدريب سريع)</option>
              <option value={15}>15 سؤالاً (كويز)</option>
              <option value={20}>20 سؤالاً (اختبار درس)</option>
              <option value={30}>30 سؤالاً (بوكليت معياري)</option>
              <option value={40}>40 سؤالاً (اختبار شهري)</option>
              <option value={50}>50 سؤالاً (امتحان نهائي شامل)</option>
              <option value="max">الحد الأقصى المتاح بالمحتوى (Max Useful)</option>
            </select>
          </div>

          {/* Number of Exam Models (A, B, C...) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              عدد النماذج المستقلة (A/B/C):
            </label>
            <select
              value={examCount}
              onChange={(e) => setExamCount(Number(e.target.value))}
              className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700"
            >
              <option value={1}>نموذج واحد (Model A فقط)</option>
              <option value={2}>نموذجان متكافئان (A و B)</option>
              <option value={3}>3 نماذج متكافئة (A و B و C)</option>
              <option value={4}>4 نماذج متكافئة (A و B و C و D)</option>
              <option value={5}>5 نماذج متكافئة للجان</option>
            </select>
          </div>

          {/* Duration in minutes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">الزمن المخصص للاختبار:</label>
            <select
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700"
            >
              <option value={15}>15 دقيقة</option>
              <option value={30}>30 دقيقة</option>
              <option value={45}>45 دقيقة</option>
              <option value={60}>60 دقيقة (ساعة واحدة)</option>
              <option value={90}>90 دقيقة (ساعة ونصف)</option>
              <option value={120}>120 دقيقة (ساعتان)</option>
            </select>
          </div>

          {/* Difficulty Preset */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">تدرج الصعوبة (Difficulty):</label>
            <select
              value={difficultyPreset}
              onChange={(e) => {
                const val = e.target.value as any;
                setDifficultyPreset(val);
                if (val === "balanced") {
                  setDifficultyDistribution({ easy: 25, medium: 40, hard: 25, higherOrder: 10 });
                } else if (val === "recall_heavy") {
                  setDifficultyDistribution({ easy: 50, medium: 35, hard: 15, higherOrder: 0 });
                } else if (val === "analytical") {
                  setDifficultyDistribution({ easy: 15, medium: 35, hard: 35, higherOrder: 15 });
                } else if (val === "excellent_student") {
                  setDifficultyDistribution({ easy: 10, medium: 25, hard: 45, higherOrder: 20 });
                }
              }}
              className="w-full bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-700"
            >
              <option value="balanced">متوازن وزاري (25% سهل / 40% متوسط / 25% صعب / 10% عليا)</option>
              <option value="recall_heavy">تركيز استرجاعي (50% سهل ومباشر)</option>
              <option value="analytical">تركيز تحليلي وتطبيقي (35% تطبيق وتحليل)</option>
              <option value="excellent_student">فائقين ومتفوقين (تفكير عليا ومستويات متقدمة)</option>
            </select>
          </div>
        </div>

        {/* Question Types Filters */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">
              أنواع الأسئلة المراد تضمينها:
            </label>
            <button
              type="button"
              onClick={() => setQuestionTypes(questionTypes === "all" ? ["mcq"] : "all")}
              className="text-xs text-indigo-400 hover:underline cursor-pointer"
            >
              {questionTypes === "all" ? "تحديد مخصص" : "اختيار كافة الأنواع (الكل)"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableQuestionTypes.map((qt) => {
              const isSelected =
                questionTypes === "all" || (Array.isArray(questionTypes) && questionTypes.includes(qt.id));

              return (
                <button
                  key={qt.id}
                  type="button"
                  onClick={() => toggleQuestionType(qt.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600/30 border-indigo-500 text-indigo-200 shadow-sm"
                      : "bg-slate-950/60 border-slate-800 text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {isSelected ? <CheckSquare className="w-3.5 h-3.5 text-indigo-400" /> : <Square className="w-3.5 h-3.5" />}
                  <span>{qt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Committee & Integrity Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includeSourceReferences}
              onChange={(e) => setIncludeSourceReferences(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
            />
            <span>توثيق مراجع الكتاب (ص/قسم)</span>
          </label>

          <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useExactBookAnswers}
              onChange={(e) => setUseExactBookAnswers(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
            />
            <span>النص الحرفي لإجابة الوزارة</span>
          </label>

          <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={randomizeQuestions}
              onChange={(e) => setRandomizeQuestions(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
            />
            <span>ترتيب عشوائي للأسئلة</span>
          </label>

          <label className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={randomizeOptions}
              onChange={(e) => setRandomizeOptions(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
            />
            <span>خلط خيارات الـ MCQ</span>
          </label>
        </div>

        {/* Generate Exam System Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            سيتم إنشاء منظومة الامتحان والتحقق من جودة الأسئلة واستبعاد التكرارات وبناء جدول المواصفات تلقائياً.
          </div>

          <button
            onClick={handleGenerateClick}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm sm:text-base rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2.5 shrink-0"
          >
            <Sparkles className="w-5 h-5 fill-white" />
            <span>توليد الامتحان وجدول المواصفات الآن (Generate Exam System)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
