"use client";

import React, { useState, useMemo } from "react";
import { Lesson } from "@/types";
import {
  Sparkles,
  HelpCircle,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  Lightbulb,
  Award,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  PlusCircle,
  Copy,
  Zap,
  Cpu,
  ShieldCheck,
  Globe,
  Palette,
  Send,
  AlertTriangle
} from "lucide-react";
import { fireConfetti } from "@/lib/confetti";

interface AIPresentationAssistantProps {
  lesson: Lesson;
  currentSlideTitle: string;
  currentSlideBullets: string[];
  currentSlideBadge: string;
  currentSlideIndex: number;
  onAddCustomSlide?: (slideData: {
    title: string;
    badge: string;
    bullets: string[];
    diagramType?: string;
  }) => void;
  onClose: () => void;
}

interface GeneratedQuestion {
  id: string;
  type: "mcq" | "true_false" | "scenario";
  categoryLabel: string;
  question: string;
  options?: string[];
  correctAnswer: string | number; // index or string
  explanation: string;
  misconceptionAlert?: string;
  teacherDiscussionPrompt?: string;
}

export function AIPresentationAssistant({
  lesson,
  currentSlideTitle,
  currentSlideBullets,
  currentSlideBadge,
  currentSlideIndex,
  onAddCustomSlide,
  onClose,
}: AIPresentationAssistantProps) {
  const [activeMode, setActiveMode] = useState<"questions" | "diagrams" | "custom_prompt">("questions");

  // --- AI QUESTION GENERATOR STATE ---
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showAnswerExplanation, setShowAnswerExplanation] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // --- AI DIAGRAM & VISUALIZER STATE ---
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [isGeneratingCustomDiagram, setIsGeneratingCustomDiagram] = useState<boolean>(false);
  const [generatedCustomDiagram, setGeneratedCustomDiagram] = useState<{
    title: string;
    nodes: { id: string; label: string; desc: string; icon: string; color: string }[];
    connections: { from: string; to: string; label: string }[];
  } | null>(null);

  // Intelligent Context-Aware Question Bank tailored to current lesson & slide
  const generatedQuestions = useMemo<GeneratedQuestion[]>(() => {
    const list: GeneratedQuestion[] = [];
    const contentText = currentSlideBullets.join(" ");

    // 1. Lesson-specific deep questions
    if (lesson.id === "lesson-1-1" || contentText.includes("مور") || contentText.includes("ترانزستور")) {
      list.push({
        id: "q-1-1-1",
        type: "mcq",
        categoryLabel: "قانون مور ومستقبل الحوسبة",
        question: "ما هو التوصيف العلمي الدقيق لقانون مور (Moore's Law)؟",
        options: [
          "قانون فيزيائي حتمي يفرض مضاعفة سرعة المعالج كل عامين",
          "ملاحظة تجريبية تاريخية تفيد بتضاعف عدد الترانزستورات في الشريحة كل عامين تقريباً",
          "نظرية رياضية تثبت انخفاض استهلاك الطاقة بمقدار النصف سنوياً",
          "قاعدة برمجية تنص على مضاعفة عدد خطوط الكود كل 18 شهراً",
        ],
        correctAnswer: 1,
        explanation: "قانون مور ليس قانوناً طبيعياً أو فيزيائياً، بل هو ملاحظة تجريبية وتوقع وضعه غوردون مور عام 1965 وقاد استراتيجيات صناعة أشباه الموصلات لعقود.",
        misconceptionAlert: "يعتقد بعض الطلاب خطأً أنه قانون فيزيائي مثل قوانين نيوتن، بينما هو اتجاه اقتصادي وتقني تجريبي.",
      });

      list.push({
        id: "q-1-1-2",
        type: "true_false",
        categoryLabel: "الحوسبة الطرفية مقابل السحابية",
        question: "تهدف الحوسبة الطرفية (Edge Computing) إلى معالجة البيانات داخل مراكز البيانات السحابية البعيدة لضمان أعلى قوة معالجة.",
        options: ["صح", "خطأ"],
        correctAnswer: 1,
        explanation: "العبارة خاطئة. الحوسبة الطرفية تعالج البيانات محلياً على الجهاز نفسه أو بالقرب من مصدر البيانات لتقليل زمن الاستجابة (Latency)، بينما الحوسبة السحابية تعالجها في خوادم مركزية بعيدة.",
        misconceptionAlert: "يخلط الطلاب أحياناً بين الطرفية (القريبة من المستخدم مثل حساسات السيارة) والسحابية (الخوادم المركزية).",
      });

      list.push({
        id: "q-1-1-3",
        type: "scenario",
        categoryLabel: "تحدي هندسي صفي (تفكير نقدي)",
        question: "سيناريو صفي: سيارة ذاتية القيادة تسير على طريق سريع بسرعة 100 كم/ساعة، واكتشف الرادار عائقاً مفاجئاً. لماذا يعد الاعتماد على الحوسبة السحابية فقط خطراً قاتلاً في هذه الحالة، وما هو الحل التقني الصحيح؟",
        correctAnswer: "الحوسبة الطرفية الفورية",
        explanation: "السيارة تحتاج لاتخاذ قرار الفرملة خلال أجزاء من الألف من الثانية (Millisecond latency). نقل الفيديو للسحابة ثم انتظار القرار يستغرق وقتاً قد يتسبب في حادث، بالإضافة لاحتمال انقطاع الإنترنت. الحل هو المعالجة الطرفية (Edge AI) على المعالج المحلي للسيارة.",
        teacherDiscussionPrompt: "اطلب من 3 طلاب تقديم حجج هندسية تقارن بين سرعة الضوء وتأخير الشبكة وسرعة معالج السيارة المحلي.",
      });
    } else if (lesson.id === "lesson-1-2" || contentText.includes("تعلم آلي") || contentText.includes("عصبية")) {
      list.push({
        id: "q-1-2-1",
        type: "mcq",
        categoryLabel: "أنواع التعلم الآلي",
        question: "أي نوع من أنواع التعلم الآلي يعتمد على تزويد النموذج ببيانات تدريب تحتوي على المدخلات والنتائج الصحيحة معاً (Labeled Data)؟",
        options: [
          "التعلم غير الخاضع للإشراف (Unsupervised Learning)",
          "التعلم المعزز (Reinforcement Learning)",
          "التعلم الخاضع للإشراف (Supervised Learning)",
          "التعلم التوليدي العشوائي (Stochastic Learning)",
        ],
        correctAnswer: 2,
        explanation: "التعلم الخاضع للإشراف (Supervised Learning) يستخدم بيانات معنونة وموسومة مسبقاً (Labeled Data) ليتعلم النموذج الربط بين المدخلات والمخرجات الصحيحة.",
        misconceptionAlert: "التعلم المعزز يعتمد على المكافآت والعقوبات (Agent/Environment) وليس بيانات مصنفة مسبقاً.",
      });

      list.push({
        id: "q-1-2-2",
        type: "true_false",
        categoryLabel: "الشبكات العصبية الاصطناعية",
        question: "يتكون 'البيرسبترون' (Perceptron) من طبقات متعددة مخفية قادرة على حل جميع المشكلات غير الخطية بمفرده.",
        options: ["صح", "خطأ"],
        correctAnswer: 1,
        explanation: "العبارة خاطئة. البيرسبترون البسيط هو خلية عصبية اصطناعية واحدة ذات طبقة واحدة ولا يحل سوى المسائل القابلة للفصل خطياً. لحل المسائل المعقدة غير الخطية نحتاج شبكات عصبية متعددة الطبقات (MLP/Deep Learning).",
      });
    } else if (lesson.chapterNumber === 2 || contentText.includes("تشفير") || contentText.includes("أمن")) {
      list.push({
        id: "q-2-1",
        type: "mcq",
        categoryLabel: "بروتوكولات الأمان والتشفير",
        question: "في بروتوكول TLS 1.3، كيف يتم استخدام التشفير غير المتماثل (Asymmetric) والتشفير المتماثل (Symmetric) معاً لتحقيق أعلى كفاءة؟",
        options: [
          "يُستخدم التشفير المتماثل للمصادقة وتوليد المفاتيح، وغير المتماثل لتشفير كل حزم البيانات",
          "يُستخدم التشفير غير المتماثل لتبادل المفاتيح والمصادقة، ثم يُستخدم التشفير المتماثل لتشفير جلسة البيانات الفعلية لسرعته",
          "يتم التخلي تماماً عن التشفير المتماثل لأنه غير آمن",
          "يُستخدم التشفير غير المتماثل فقط عند حدوث هجوم سيبراني",
        ],
        correctAnswer: 1,
        explanation: "التشفير غير المتماثل قوي جداً في المصادقة وتبادل المفاتيح لكنه بطيء حوسبياً، لذلك يُستخدم لإنشاء مفتاح جلسة سري مشترك، ثم تتولى الخوارزمية المتماثلة السريعة تشفير كامل البيانات.",
        misconceptionAlert: "يعتقد البعض أن المواقع تستخدم نوعاً واحداً فقط، بينما تجمع أنظمة الويب الحديثة بين النوعين في بنية هجينة.",
      });

      list.push({
        id: "q-2-2",
        type: "true_false",
        categoryLabel: "بنية أمان الشبكات - Zero Trust",
        question: "المبدأ الجوهري لنموذج انعدام الثقة (Zero Trust) هو: 'لا تثق بأي مستخدم أو جهاز داخل الشبكة أو خارجها، وتحقق دائماً وبشكل مستمر'.",
        options: ["صح", "خطأ"],
        correctAnswer: 0,
        explanation: "العبارة صحيحة 100%. نموذج Zero Trust يتخلى عن الفكرة التقليدية 'داخل الشبكة آمن' ويعامل كل طلب على أنه قادم من شبكة غير موثوقة.",
      });
    } else {
      // General High-Impact Pedagogical Questions dynamically adapted
      list.push({
        id: `q-dyn-1-${currentSlideIndex}`,
        type: "mcq",
        categoryLabel: `سؤال فهم على: ${currentSlideTitle}`,
        question: `بناءً على المحور المشروح في هذه الشريحة، ما هو الاستنتاج التقني الأبرز؟`,
        options: [
          `تطبيق المفاهيم المطروحة يتطلب موازنة بين الكفاءة والتكلفة والأمان`,
          `التقنية القديمة تتفوق في جميع المعايير على الأنظمة الحديثة`,
          `لا توجد أي معايير قياسية تحكم هذا المفهوم في الصناعة`,
          `الاعتماد الكلي على المعالجة اليدوية أفضل من الأتمتة`,
        ],
        correctAnswer: 0,
        explanation: `الهدف التعليمي الأساسي هو فهم كيف تحقق المنظومة التوازن الأمثل في بيئة العمل الواقعية وفق معايير المنهج.`,
      });

      list.push({
        id: `q-dyn-2-${currentSlideIndex}`,
        type: "true_false",
        categoryLabel: "تحقق من الاستيعاب المباشر",
        question: `هل المفاهيم والقواعد المشروحة في (${currentSlideTitle}) تعتبر معايير قياسية في بناء الأنظمة الرقمية الحديثة؟`,
        options: ["صح", "خطأ"],
        correctAnswer: 0,
        explanation: `نعم، المنهج يركز على أفضل الممارسات المعتمدة دولياً في هندسة البرمجيات والذكاء الاصطناعي وتصميم الويب.`,
      });
    }

    // Add Key Concept matching question if available
    if (lesson.keyConcepts && lesson.keyConcepts.length > 0) {
      const randomConcept = lesson.keyConcepts[currentSlideIndex % lesson.keyConcepts.length];
      list.push({
        id: `q-concept-${randomConcept.termAr}`,
        type: "mcq",
        categoryLabel: "معجم المصطلحات والمفاهيم",
        question: `ما هو المصطلح العلمي المطابق للتعريف: "${randomConcept.definition}"؟`,
        options: [
          randomConcept.termAr + (randomConcept.termEn ? ` (${randomConcept.termEn})` : ""),
          "الحوسبة السحابية الموزعة (Cloud Grid)",
          "خوارزمية الفرز التكراري (Iterative Sorting)",
          "بروتوكول التوجيه الشبكي (BGP Routing)",
        ],
        correctAnswer: 0,
        explanation: `المصطلح الصحيح هو ${randomConcept.termAr}. وهو من المفاهيم الأساسية الواردة في كتاب المنهج.`,
      });
    }

    return list;
  }, [lesson, currentSlideBullets, currentSlideTitle, currentSlideIndex]);

  const activeQuestion = generatedQuestions[currentQuestionIndex] || generatedQuestions[0];

  // Handle Answer Selection
  const handleSelectAnswer = (ansIdx: number | string) => {
    setSelectedAnswer(ansIdx);
    setShowAnswerExplanation(true);

    const isCorrect =
      typeof activeQuestion.correctAnswer === "number"
        ? ansIdx === activeQuestion.correctAnswer
        : ansIdx === activeQuestion.correctAnswer;

    if (isCorrect) {
      fireConfetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowAnswerExplanation(false);
    setCurrentQuestionIndex((prev) => (prev + 1) % generatedQuestions.length);
  };

  const handlePrevQuestion = () => {
    setSelectedAnswer(null);
    setShowAnswerExplanation(false);
    setCurrentQuestionIndex((prev) => (prev - 1 + generatedQuestions.length) % generatedQuestions.length);
  };

  // Custom AI Diagram Generator Simulator
  const handleGenerateCustomDiagram = () => {
    if (!customPrompt.trim()) return;
    setIsGeneratingCustomDiagram(true);

    setTimeout(() => {
      // Build an intelligent structured diagram based on user prompt keywords
      const promptLower = customPrompt.toLowerCase();
      let generated;

      if (promptLower.includes("أمن") || promptLower.includes("تشفير") || promptLower.includes("security")) {
        generated = {
          title: `مخطط المنظومة الأمنية: ${customPrompt}`,
          nodes: [
            { id: "1", label: "مستخدم / جهاز العميل", desc: "مصادقة متعددة العوامل MFA", icon: "👤", color: "from-blue-500 to-indigo-600" },
            { id: "2", label: "جدار الحماية والـ DMZ", desc: "تصفية وفحص الحزم والتشفير", icon: "🛡️", color: "from-amber-500 to-orange-600" },
            { id: "3", label: "خادم التطبيقات المؤمن", desc: "تطبيق قواعد Zero-Trust", icon: "⚡", color: "from-purple-500 to-pink-600" },
            { id: "4", label: "قاعدة البيانات المشفرة", desc: "تشفير AES-256 أثناء السكون", icon: "🔒", color: "from-emerald-500 to-teal-600" },
          ],
          connections: [
            { from: "1", to: "2", label: "طلب اتصال مشفر TLS 1.3" },
            { from: "2", to: "3", label: "فحص الصلاحيات و IPS" },
            { from: "3", to: "4", label: "استعلام معقم ومصرح" },
          ],
        };
      } else if (promptLower.includes("ذكاء") || promptLower.includes("ai") || promptLower.includes("تعلم")) {
        generated = {
          title: `دورة معالجة الذكاء الاصطناعي: ${customPrompt}`,
          nodes: [
            { id: "1", label: "جمع البيانات الخام", desc: "حساسات وكاميرات ومدخلات", icon: "📥", color: "from-sky-500 to-blue-600" },
            { id: "2", label: "معالجة وتجهيز الميزات", desc: "تنظيف البيانات والتطبيع Normalization", icon: "⚙️", color: "from-amber-500 to-yellow-600" },
            { id: "3", label: "تدريب الشبكة العصبية", desc: "تعديل الأوزان والانحدار التدريجي", icon: "🧠", color: "from-indigo-500 to-purple-600" },
            { id: "4", label: "الاستدلال والتنبؤ الفوري", desc: "إخراج القرار أو التنبؤ الذكي", icon: "🚀", color: "from-emerald-500 to-green-600" },
          ],
          connections: [
            { from: "1", to: "2", label: "تمرير البيانات المجمعة" },
            { from: "2", to: "3", label: "مصفوفات المتجهات المهيأة" },
            { from: "3", to: "4", label: "نموذج مدرب جاهز للاستدلال" },
          ],
        };
      } else {
        generated = {
          title: `مخطط تدفق العمليات: ${customPrompt}`,
          nodes: [
            { id: "1", label: "مرحلة المدخلات والتحليل", desc: "تحديد المتطلبات والأهداف التعليمية", icon: "🎯", color: "from-blue-500 to-cyan-600" },
            { id: "2", label: "مرحلة المعالجة والهندسة", desc: "تطبيق الخوارزميات والمعايير القياسية", icon: "⚙️", color: "from-indigo-500 to-blue-700" },
            { id: "3", label: "مرحلة الاختبار والتحسين", desc: "تقييم الأداء والتغذية الراجعة التكرارية", icon: "🔍", color: "from-amber-500 to-orange-600" },
            { id: "4", label: "المخرجات والإنتاج النهائي", desc: "تسليم حل برمجي عالي الجودة ومستقر", icon: "✨", color: "from-emerald-500 to-teal-600" },
          ],
          connections: [
            { from: "1", to: "2", label: "بيانات متطلبات دقيقة" },
            { from: "2", to: "3", label: "إصدار تجريبي للاختبار" },
            { from: "3", to: "4", label: "اعتماد الجودة والنشر" },
          ],
        };
      }

      setGeneratedCustomDiagram(generated);
      setIsGeneratingCustomDiagram(false);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        {/* Header Ribbon */}
        <div className="px-6 py-4 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  ذكاء اصطناعي تفاعلي 🤖
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  مساعد المعلم الذكي: توليد الأسئلة والمخططات
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                توليد فوري مرتبط بمحتوى شريحة: <span className="text-slate-200 font-semibold">{currentSlideTitle}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق النافذة"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 gap-2">
          <button
            onClick={() => setActiveMode("questions")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === "questions"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>توليد أسئلة صفية تفاعلية ({generatedQuestions.length})</span>
          </button>

          <button
            onClick={() => setActiveMode("diagrams")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === "diagrams"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>المخططات والمفاهيم البصرية للدرس</span>
          </button>

          <button
            onClick={() => setActiveMode("custom_prompt")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeMode === "custom_prompt"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>توليد مخطط حر بالبرومبت ✨</span>
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {/* 1. QUESTIONS MODE */}
          {activeMode === "questions" && (
            <div className="space-y-6">
              {/* Question Navigation Header */}
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {activeQuestion.categoryLabel}
                  </span>
                  <span className="text-xs text-slate-400">
                    سؤال {currentQuestionIndex + 1} من {generatedQuestions.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevQuestion}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>السابق</span>
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>التالي</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Active Question Box */}
              <div className="p-6 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                    ؟
                  </div>
                  <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {activeQuestion.question}
                  </h4>
                </div>

                {/* Options List (For MCQ & True/False) */}
                {activeQuestion.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {activeQuestion.options.map((opt, oIdx) => {
                      const isChosen = selectedAnswer === oIdx;
                      const isCorrect = oIdx === activeQuestion.correctAnswer;
                      const showResult = showAnswerExplanation;

                      let btnStyle = "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700";
                      if (showResult) {
                        if (isCorrect) {
                          btnStyle = "bg-emerald-950/80 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-950/50";
                        } else if (isChosen && !isCorrect) {
                          btnStyle = "bg-rose-950/80 border-rose-500 text-rose-200";
                        } else {
                          btnStyle = "bg-slate-950/60 border-slate-900 text-slate-600 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          onClick={() => handleSelectAnswer(oIdx)}
                          className={`p-4 rounded-xl border text-right text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                        >
                          <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 shrink-0 mt-0.5">
                            {String.fromCharCode(65 + oIdx)}
                          </span>
                          <span className="flex-1 leading-relaxed">{opt}</span>
                          {showResult && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                          {showResult && isChosen && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Scenario Model Answer Box */}
                {activeQuestion.type === "scenario" && (
                  <div className="pt-2">
                    {!showAnswerExplanation ? (
                      <button
                        onClick={() => setShowAnswerExplanation(true)}
                        className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-600/30"
                      >
                        <Eye className="w-4 h-4" />
                        <span>كشف توجيهات المناقشة والإجابة النموذجية للمعلم</span>
                      </button>
                    ) : (
                      <div className="p-4 bg-slate-900 border border-amber-500/40 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                          <Lightbulb className="w-4 h-4" />
                          <span>التوجيه والتحليل العلمي النموذجي:</span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                          {activeQuestion.explanation}
                        </p>
                        {activeQuestion.teacherDiscussionPrompt && (
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-300">
                            <strong>💡 اقتراح لإدارة النقاش: </strong>
                            {activeQuestion.teacherDiscussionPrompt}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Explanation & Misconception Alert Banner */}
                {showAnswerExplanation && activeQuestion.type !== "scenario" && (
                  <div className="mt-4 p-4 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 space-y-2.5 animate-fadeIn">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>الشرح والتفسير العلمي المعتمد:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                      {activeQuestion.explanation}
                    </p>

                    {activeQuestion.misconceptionAlert && (
                      <div className="p-3 bg-amber-950/40 rounded-xl border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold mb-0.5">تنبيه لمفهوم شائع خاطئ لدى الطلاب:</strong>
                          <span>{activeQuestion.misconceptionAlert}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedAnswer(null);
                      setShowAnswerExplanation(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة تعيين السؤال</span>
                  </button>

                  {onAddCustomSlide && (
                    <button
                      onClick={() => {
                        onAddCustomSlide({
                          title: `تحدي صفي: ${activeQuestion.question.slice(0, 50)}...`,
                          badge: "سؤال ذكاء اصطناعي 🤖",
                          bullets: [
                            `السؤال: ${activeQuestion.question}`,
                            ...(activeQuestion.options?.map((o, idx) => `خيار (${String.fromCharCode(65 + idx)}): ${o}`) || []),
                            `الإجابة والتفسير: ${activeQuestion.explanation}`,
                          ],
                        });
                        onClose();
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-600/30"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>إدراج السؤال كشريحة في العرض</span>
                    </button>
                  )}
                </div>

                <span className="text-xs text-slate-400">
                  🎯 تم توليد الأسئلة استناداً إلى مخرجات التعلم في الكتاب المدرسي
                </span>
              </div>
            </div>
          )}

          {/* 2. DIAGRAMS & CONCEPTS VISUALIZER */}
          {activeMode === "diagrams" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Visual Concept Card 1 */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      مخطط تدفق هرمي
                    </span>
                    <Cpu className="w-4 h-4 text-blue-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    هيكلية الذكاء الاصطناعي (AI ➔ ML ➔ Deep Learning)
                  </h4>
                  <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                    <div className="p-2 rounded-lg bg-indigo-950/80 border border-indigo-500/30 text-xs text-indigo-200">
                      <strong>1. الذكاء الاصطناعي العام (AI):</strong> المظلة الشاملة للأنظمة الذكية
                    </div>
                    <div className="p-2 rounded-lg bg-purple-950/80 border border-purple-500/30 text-xs text-purple-200 mr-4">
                      <strong>2. تعلم الآلة (ML):</strong> خوارزميات تتعلم من البيانات دون برمجة صريحة
                    </div>
                    <div className="p-2 rounded-lg bg-pink-950/80 border border-pink-500/30 text-xs text-pink-200 mr-8">
                      <strong>3. التعلم العميق (DL):</strong> شبكات عصبية اصطناعية متعددة الطبقات
                    </div>
                  </div>
                </div>

                {/* Visual Concept Card 2 */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      مقارنة معمارية
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    الحوسبة الطرفية (Edge) مقابل السحابية (Cloud)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <strong className="text-amber-400 block mb-1">الطرفية (Edge):</strong>
                      <ul className="text-slate-300 space-y-1 text-[11px]">
                        <li>• زمن استجابة فائق الصغر</li>
                        <li>• خصوصية بيانات محلية</li>
                        <li>• تعمل بدون إنترنت مستمر</li>
                      </ul>
                    </div>
                    <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                      <strong className="text-sky-400 block mb-1">السحابية (Cloud):</strong>
                      <ul className="text-slate-300 space-y-1 text-[11px]">
                        <li>• سعة تخزين ضخمة</li>
                        <li>• تدريب نماذج عملاقة</li>
                        <li>• تتطلب اتصالاً مستقراً</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Visual Concept Card 3 */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-purple-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      دورة حياة هندسية
                    </span>
                    <Globe className="w-4 h-4 text-purple-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    بنية تطبيقات الويب ثلاثية الطبقات (3-Tier)
                  </h4>
                  <div className="flex items-center justify-between gap-1 p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px] text-center">
                    <div className="flex-1 p-2 bg-indigo-950/70 border border-indigo-500/30 rounded-lg">
                      <div className="font-bold text-indigo-300">الواجهة الأمامية</div>
                      <div className="text-[10px] text-slate-400">Presentation Tier</div>
                    </div>
                    <span className="text-slate-500">➔</span>
                    <div className="flex-1 p-2 bg-purple-950/70 border border-purple-500/30 rounded-lg">
                      <div className="font-bold text-purple-300">منطق التطبيق</div>
                      <div className="text-[10px] text-slate-400">Application Tier</div>
                    </div>
                    <span className="text-slate-500">➔</span>
                    <div className="flex-1 p-2 bg-emerald-950/70 border border-emerald-500/30 rounded-lg">
                      <div className="font-bold text-emerald-300">قاعدة البيانات</div>
                      <div className="text-[10px] text-slate-400">Data Tier</div>
                    </div>
                  </div>
                </div>

                {/* Visual Concept Card 4 */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-pink-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      دورة التحسين المستمر
                    </span>
                    <Palette className="w-4 h-4 text-pink-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white">
                    حلقة ديمنغ للتحسين التكراري (PDCA Cycle)
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-sky-300">
                      <strong>1. خَطّط (Plan):</strong> تحديد الأهداف والفرضيات
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-emerald-300">
                      <strong>2. نَفّذ (Do):</strong> تطبيق التغيير التجريبي
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-amber-300">
                      <strong>3. افحص (Check):</strong> قياس النتائج والبيانات
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-rose-300">
                      <strong>4. طَوّر (Act):</strong> اعتماد الحل أو تعديله
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. CUSTOM PROMPT GENERATIVE DIAGRAM */}
          {activeMode === "custom_prompt" && (
            <div className="space-y-6">
              {/* Input Prompt Box */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  اكتب أي مفهوم أو عملية برمجية تريد توليد مخطط تدفق بصري لها:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleGenerateCustomDiagram();
                    }}
                    placeholder="مثال: كيف يعمل التشفير غير المتماثل في حماية البيانات؟ أو خوارزمية التعلم الآلي"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleGenerateCustomDiagram}
                    disabled={isGeneratingCustomDiagram || !customPrompt.trim()}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    {isGeneratingCustomDiagram ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>توليد المخطط</span>
                  </button>
                </div>

                {/* Ready-made Suggestions */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">اقتراحات سريعة:</span>
                  {[
                    "آلية مصافحة TLS Handshake",
                    "بنية شبكات Zero-Trust",
                    "كيف تعمل الشبكة العصبية",
                    "مبادئ التصميم البصري CRAP",
                  ].map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setCustomPrompt(sug);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generated Diagram View */}
              {generatedCustomDiagram && (
                <div className="p-6 bg-slate-950 rounded-2xl border border-emerald-500/30 space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h4 className="text-sm sm:text-base font-bold text-emerald-400 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>{generatedCustomDiagram.title}</span>
                    </h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      مخطط تدفق مفاهيمي ذكي
                    </span>
                  </div>

                  {/* Flow Nodes Pipeline */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
                    {generatedCustomDiagram.nodes.map((node, idx) => (
                      <div
                        key={node.id}
                        className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 hover:scale-[1.02] transition-transform relative group"
                      >
                        <div className="flex items-center justify-between">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center text-sm shadow-md`}>
                            {node.icon}
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">
                            مرحلة {idx + 1}
                          </span>
                        </div>
                        <h5 className="text-xs font-bold text-white leading-snug">
                          {node.label}
                        </h5>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {node.desc}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Connection Summary */}
                  <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2 text-xs">
                    <strong className="text-indigo-400 block mb-1">مسار نقل البيانات والأثر العلمي:</strong>
                    <div className="space-y-1.5">
                      {generatedCustomDiagram.connections.map((c, i) => (
                        <div key={i} className="flex items-center gap-2 text-slate-300 text-[11px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="font-semibold text-white">من خطوة {c.from} إلى {c.to}:</span>
                          <span>{c.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>🧠 يدعم المعلم أثناء الشرح في تقديم تجربة تفاعلية وبصرية احترافية</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer transition-colors"
          >
            إغلاق المساعد
          </button>
        </div>
      </div>
    </div>
  );
}
