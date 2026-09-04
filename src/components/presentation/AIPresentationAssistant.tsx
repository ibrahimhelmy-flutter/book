"use client";

import React, { useState, useMemo } from "react";
import { Lesson, QuestionItem, KeyConcept, SolvedExampleItem, CalloutBox } from "@/types";
import { GLOSSARY_DATA } from "@/data/glossary";
import { ACRONYMS_DATA } from "@/data/acronyms";
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Lightbulb,
  Award,
  Layers,
  ChevronLeft,
  ChevronRight,
  Eye,
  PlusCircle,
  Zap,
  Cpu,
  ShieldCheck,
  Globe,
  Palette,
  Send,
  AlertTriangle,
  BookOpen,
  Compass,
  ArrowRight,
  Workflow,
  BookOpenCheck,
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
  correctAnswer: number | string; // index or string
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
  const [selectedAnswer, setSelectedAnswer] = useState<number | string | null>(null);
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

  // Helper to get fallback distractor terms from central glossary and key concepts
  const allConceptDistractors = useMemo(() => {
    const fromLesson = (lesson.keyConcepts || []).map(
      (c) => c.termAr + (c.termEn ? ` (${c.termEn})` : "")
    );
    const fromGlossary = GLOSSARY_DATA.map(
      (g) => g.termAr + (g.termEn ? ` (${g.termEn})` : "")
    );
    return Array.from(new Set([...fromLesson, ...fromGlossary]));
  }, [lesson.keyConcepts]);

  // Generate dynamic, comprehensive question bank from the single source of truth (lesson in src/data)
  const generatedQuestions = useMemo<GeneratedQuestion[]>(() => {
    const list: GeneratedQuestion[] = [];
    const contentText = (currentSlideBullets || []).join(" ").toLowerCase();

    // 1. Transform Lesson Question Items (MCQ, True/False, Fill in Blank, Essay)
    if (lesson.questions && lesson.questions.length > 0) {
      lesson.questions.forEach((q: QuestionItem, idx: number) => {
        if (q.type === "mcq" && q.options && q.options.length > 0) {
          // Parse correct answer index
          let correctIdx = 0;
          if (typeof q.correctAnswer === "string") {
            const lower = q.correctAnswer.toLowerCase().trim();
            if (lower === "a" || lower === "أ") correctIdx = 0;
            else if (lower === "b" || lower === "ب") correctIdx = 1;
            else if (lower === "c" || lower === "ج") correctIdx = 2;
            else if (lower === "d" || lower === "د") correctIdx = 3;
            else {
              const matchedIdx = q.options.findIndex((opt) => opt.id === q.correctAnswer || opt.text === q.correctAnswer);
              if (matchedIdx !== -1) correctIdx = matchedIdx;
              else {
                const parsed = parseInt(lower, 10);
                if (!isNaN(parsed) && parsed >= 0 && parsed < q.options.length) correctIdx = parsed;
              }
            }
          }

          list.push({
            id: `cur-q-${q.id || idx}`,
            type: "mcq",
            categoryLabel: `سؤال منهجي (${q.category === "check_understanding" ? "تحقق من الفهم" : q.category === "exam_style" ? "نمط امتحاني" : "تطبيق وممارسة"})`,
            question: q.questionText,
            options: q.options.map((opt) => opt.text),
            correctAnswer: correctIdx,
            explanation: q.explanation || "الإجابة النموذجية المعتمدة وفق المعايير القياسية لمنهج الكتاب المدرسي.",
            teacherDiscussionPrompt: "اسأل الطلاب عن سبب استبعاد الخيارات الأخرى قبل تأكيد الإجابة الصحيحة.",
          });
        } else if (q.type === "true_false") {
          let correctIdx = 0;
          const ansStr = String(q.correctAnswer).toLowerCase();
          if (ansStr === "false" || ansStr === "خطأ" || ansStr === "خاطئة" || ansStr === "no" || ansStr === "لا") {
            correctIdx = 1;
          }

          list.push({
            id: `cur-tf-${q.id || idx}`,
            type: "true_false",
            categoryLabel: "تحقق صواب أو خطأ — الكتاب المدرسي",
            question: q.questionText,
            options: ["صح (صواب)", "خطأ (غير صحيح)"],
            correctAnswer: correctIdx,
            explanation: q.explanation || "وفقاً لمحتوى الدرس والمفاهيم العلمية المعتمدة في المنهج.",
          });
        } else if (q.type === "fill_blank") {
          // Convert fill_blank into interactive multi-choice using curriculum concepts
          const correctText = String(q.correctAnswer);
          const distractors = allConceptDistractors
            .filter((term) => !term.includes(correctText) && !correctText.includes(term.split(" ")[0]))
            .slice(0, 3);

          const opts = [correctText, ...distractors];
          const shiftedOpts = idx % 2 === 1 && opts.length === 4 ? [opts[1], opts[0], opts[2], opts[3]] : opts;
          const finalCorrectIdx = shiftedOpts.indexOf(correctText);

          list.push({
            id: `cur-fb-${q.id || idx}`,
            type: "mcq",
            categoryLabel: "إكمال الفراغ والمصطلحات الأساسية",
            question: q.questionText,
            options: shiftedOpts,
            correctAnswer: finalCorrectIdx !== -1 ? finalCorrectIdx : 0,
            explanation: q.explanation ? `${q.explanation} (الإجابة الصحيحة: ${correctText})` : `الإجابة الصحيحة هي: ${correctText}`,
          });
        } else if (q.type === "essay") {
          list.push({
            id: `cur-essay-${q.id || idx}`,
            type: "scenario",
            categoryLabel: "نقاش صفي وتفكير نقدي 🧠",
            question: q.questionText,
            correctAnswer: "مناقشة مفتوحة مع التوجيه العلمي",
            explanation: q.explanation || (q.rubricCriteria && q.rubricCriteria.length > 0 ? `معايير التقييم والإجابة النموذجية:\n• ${q.rubricCriteria.join("\n• ")}` : "قم بتحليل المشكلة الهندسية وتقديم مبررات علمية مدعومة بالأدلة."),
            teacherDiscussionPrompt: "اطلب من فريقين في الصف تقديم رؤى متباينة، ثم لخّص المعيار الهندسي المعتمد.",
          });
        }
      });
    }

    // 2. Transform Solved Examples from Central Data
    if (lesson.solvedExample && lesson.solvedExample.items && lesson.solvedExample.items.length > 0) {
      lesson.solvedExample.items.forEach((item: SolvedExampleItem, sIdx: number) => {
        if (item.type === "mcq" && item.options) {
          let cIdx = 0;
          if (typeof item.correctAnswer === "string") {
            const lower = item.correctAnswer.toLowerCase();
            if (lower === "a" || lower === "أ") cIdx = 0;
            else if (lower === "b" || lower === "ب") cIdx = 1;
            else if (lower === "c" || lower === "ج") cIdx = 2;
            else if (lower === "d" || lower === "د") cIdx = 3;
            else {
              const f = item.options.findIndex((o) => o.id === item.correctAnswer || o.text === item.correctAnswer);
              if (f !== -1) cIdx = f;
            }
          }

          list.push({
            id: `cur-se-mcq-${item.id || sIdx}`,
            type: "mcq",
            categoryLabel: "مثال محلول وتطبيق نموذجي 📝",
            question: item.question,
            options: item.options.map((o) => o.text),
            correctAnswer: cIdx,
            explanation: item.explanation,
            teacherDiscussionPrompt: "استعرض خطوات التفكير المنطقي التي تقود للإجابة الصحيحة.",
          });
        } else if (item.type === "true_false") {
          const isFalse = String(item.correctAnswer).toLowerCase().includes("false") || String(item.correctAnswer).includes("خطأ");
          list.push({
            id: `cur-se-tf-${item.id || sIdx}`,
            type: "true_false",
            categoryLabel: "مثال محلول: صواب أو خطأ",
            question: item.question,
            options: ["صح", "خطأ"],
            correctAnswer: isFalse ? 1 : 0,
            explanation: item.explanation,
          });
        }
      });
    }

    // 3. Transform Formative Callouts (Pause & Reflect, Pro Tips, Important Notes)
    if (lesson.callouts && lesson.callouts.length > 0) {
      lesson.callouts.forEach((callout: CalloutBox, cIdx: number) => {
        if (callout.type === "pause_and_reflect" || callout.question || callout.type === "important_note") {
          list.push({
            id: `cur-callout-${callout.id || cIdx}`,
            type: "scenario",
            categoryLabel: callout.title || "وقفة تأمل وتفكير صفي 💡",
            question: callout.content,
            correctAnswer: "التفسير العلمي المعتمد",
            explanation: callout.question || callout.content,
            teacherDiscussionPrompt: "اطرح هذا التساؤل على الطلاب لمدة دقيقة واحدة في مجموعات ثنائية قبل عرض الشرح.",
          });
        }
      });
    }

    // 4. Transform Key Concepts into Definition Recall Assessments
    if (lesson.keyConcepts && lesson.keyConcepts.length > 0) {
      lesson.keyConcepts.forEach((concept: KeyConcept, kIdx: number) => {
        const correctLabel = concept.termAr + (concept.termEn ? ` (${concept.termEn})` : "");
        const distractors = allConceptDistractors
          .filter((t) => t !== correctLabel && !t.includes(concept.termAr))
          .slice(0, 3);

        const options = [correctLabel, ...distractors];
        const rotated = options.length === 4
          ? [options[(kIdx) % 4], options[(kIdx + 1) % 4], options[(kIdx + 2) % 4], options[(kIdx + 3) % 4]]
          : options;
        const correctIndex = rotated.indexOf(correctLabel);

        list.push({
          id: `cur-concept-${kIdx}`,
          type: "mcq",
          categoryLabel: "معجم المصطلحات والمفاهيم الأساسية 📖",
          question: `ما هو المصطلح العلمي المطابق للتعريف: "${concept.definition}"؟`,
          options: rotated,
          correctAnswer: correctIndex !== -1 ? correctIndex : 0,
          explanation: `المصطلح الصحيح هو ${concept.termAr} ${concept.termEn ? `(${concept.termEn})` : ""}. وهو مفهوم رئيسي ورد في هذا الدرس.`,
        });
      });
    }

    // 5. Transform Engineer Challenge into Practical Decision Challenge
    if (lesson.engineerChallenge) {
      list.push({
        id: "cur-eng-challenge",
        type: "scenario",
        categoryLabel: `${lesson.engineerChallenge.title} ⚙️`,
        question: `السيناريو الهندسي الواقعي: ${lesson.engineerChallenge.scenario}\n\nخطوات اتخاذ القرار المطلوبة:\n${lesson.engineerChallenge.steps.map((st) => `• الخطوة ${st.number} (${st.title}): ${st.description}`).join("\n")}`,
        correctAnswer: lesson.engineerChallenge.modelAnswer || "القرار الهندسي المنهجي المستند للأدلة والبيانات",
        explanation: `${lesson.engineerChallenge.modelAnswer ? `الإجابة والتحليل الهندسي النموذجي المعتمد:\n${lesson.engineerChallenge.modelAnswer}\n\n` : ""}التوجيه الهندسي الموصى به: ${lesson.engineerChallenge.hint}`,
        teacherDiscussionPrompt: "قسّم الطلاب إلى فرق عمل هندسية مصغرة لاقتراح حلول موازنة بين الفعالية والأمان والتكلفة، ثم استعرض الإجابة والقرار النموذجي.",
      });
    }

    // 6. Slide-Context Prioritization: Put matching questions to the front if relevant to current slide
    if (list.length > 0 && contentText) {
      list.sort((a, b) => {
        const aMatch = a.question.toLowerCase().includes(contentText.slice(0, 20)) || a.categoryLabel.includes(currentSlideTitle);
        const bMatch = b.question.toLowerCase().includes(contentText.slice(0, 20)) || b.categoryLabel.includes(currentSlideTitle);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
    }

    // Fallback if list is empty for any reason
    if (list.length === 0) {
      list.push({
        id: "fallback-1",
        type: "mcq",
        categoryLabel: `سؤال استيعاب على: ${currentSlideTitle}`,
        question: `بناءً على المفاهيم المشروحة في (${currentSlideTitle})، ما هو الاستنتاج التقني الأبرز؟`,
        options: [
          "تطبيق المفاهيم المطروحة يتطلب موازنة دقيقة بين الأداء والتكلفة والأمان",
          "الأنظمة التقليدية القديمة تتفوق في جميع المعايير على المنظومات الحديثة",
          "لا توجد أي معايير قياسية أو بروتوكولات تحكم هذا المفهوم في الصناعة",
          "الاعتماد الكامل على المعالجة اليدوية أفضل من الأتمتة والذكاء الاصطناعي",
        ],
        correctAnswer: 0,
        explanation: "الهدف التعليمي الأساسي هو فهم كيفية تطبيق أفضل الممارسات والمعايير المعتمدة في بيئة العمل الواقعية.",
      });
    }

    return list;
  }, [lesson, currentSlideBullets, currentSlideTitle, allConceptDistractors]);

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

  // Custom AI Diagram Generator
  const handleGenerateCustomDiagram = () => {
    if (!customPrompt.trim()) return;
    setIsGeneratingCustomDiagram(true);

    setTimeout(() => {
      const promptLower = customPrompt.toLowerCase();
      
      const matchedConcept = (lesson.keyConcepts || []).find((c) =>
        promptLower.includes(c.termAr.toLowerCase()) || (c.termEn && promptLower.includes(c.termEn.toLowerCase()))
      );

      let generated;

      if (promptLower.includes("أمن") || promptLower.includes("تشفير") || promptLower.includes("security") || promptLower.includes("tls") || promptLower.includes("هجوم")) {
        generated = {
          title: `مخطط المنظومة الأمنية: ${customPrompt}`,
          nodes: [
            { id: "1", label: "مستخدم / جهاز العميل", desc: "مصادقة متعددة العوامل MFA والتحقق من الهوية", icon: "👤", color: "from-blue-500 to-indigo-600" },
            { id: "2", label: "جدار الحماية وبوابة التشفير", desc: "تصفية وفحص الحزم وتطبيق مصافحة TLS 1.3", icon: "🛡️", color: "from-amber-500 to-orange-600" },
            { id: "3", label: "خادم التطبيقات والسياسات", desc: "تطبيق معمارية انعدام الثقة (Zero Trust)", icon: "⚡", color: "from-purple-500 to-pink-600" },
            { id: "4", label: "قاعدة البيانات المشفرة", desc: "تشفير AES-256 أثناء السكون والحركة والتخزين", icon: "🔒", color: "from-emerald-500 to-teal-600" },
          ],
          connections: [
            { from: "1", to: "2", label: "طلب اتصال آمن ومصادقة مشفرة" },
            { from: "2", to: "3", label: "فحص الصلاحيات وسلامة الحزم" },
            { from: "3", to: "4", label: "استعلام معقم ومصرح بقاعدة البيانات" },
          ],
        };
      } else if (promptLower.includes("ذكاء") || promptLower.includes("ai") || promptLower.includes("تعلم") || promptLower.includes("عصبية") || promptLower.includes("بيانات")) {
        generated = {
          title: `دورة معالجة الذكاء الاصطناعي: ${customPrompt}`,
          nodes: [
            { id: "1", label: "جمع وهندسة البيانات", desc: "استخراج البيانات وتنظيفها والتطبيع (Normalization)", icon: "📥", color: "from-sky-500 to-blue-600" },
            { id: "2", label: "استخراج وتجهيز الميزات", desc: "تحويل المدخلات إلى مصفوفات ومتجهات رقمية", icon: "⚙️", color: "from-amber-500 to-yellow-600" },
            { id: "3", label: "تدريب الخوارزمية / الشبكة", desc: "تعديل الأوزان الرياضية وتقليل دالة الخسارة (Loss)", icon: "🧠", color: "from-indigo-500 to-purple-600" },
            { id: "4", label: "الاستدلال والتقييم الفوري", desc: "إخراج التنبؤ الذكي وقياس الدقة (Accuracy/F1)", icon: "🚀", color: "from-emerald-500 to-green-600" },
          ],
          connections: [
            { from: "1", to: "2", label: "تمرير مصفوفات البيانات النظيفة" },
            { from: "2", to: "3", label: "تغذية طبقات المعالجة بالأوزان" },
            { from: "3", to: "4", label: "نموذج مدرب جاهز للاستدلال والقرار" },
          ],
        };
      } else if (promptLower.includes("تصميم") || promptLower.includes("crap") || promptLower.includes("واجهة") || promptLower.includes("web") || promptLower.includes("ويب")) {
        generated = {
          title: `هندسة التصميم وتطوير الويب: ${customPrompt}`,
          nodes: [
            { id: "1", label: "تحليل تجربة المستخدم (UX)", desc: "تحديد مسار المستخدم وبنية المحتوى والشاشات", icon: "🎯", color: "from-blue-500 to-indigo-600" },
            { id: "2", label: "تطبيق مبادئ التصميم (CRAP)", desc: "التباين، التكرار، المحاذاة، والتقارب البصري", icon: "🎨", color: "from-purple-500 to-pink-600" },
            { id: "3", label: "بناء واجهة المستخدم (UI/CSS)", desc: "تصميم متجاوب وتنسيق العناصر والخطوط المريحة", icon: "💻", color: "from-amber-500 to-orange-600" },
            { id: "4", label: "اختبار سهولة الوصول والأداء", desc: "معايير WCAG وسرعة الاستجابة على جميع الأجهزة", icon: "✨", color: "from-emerald-500 to-teal-600" },
          ],
          connections: [
            { from: "1", to: "2", label: "مخططات هيكلية (Wireframes)" },
            { from: "2", to: "3", label: "تصاميم نهائية متسقة بصرياً" },
            { from: "3", to: "4", label: "كود برمجي تفاعلي جاهز للنشر" },
          ],
        };
      } else {
        generated = {
          title: matchedConcept ? `المسار الهندسي لمفهوم (${matchedConcept.termAr})` : `مخطط المعالجة والتدفق: ${customPrompt}`,
          nodes: [
            { id: "1", label: "مرحلة المدخلات والتحليل", desc: "تحديد المتطلبات التقنية والأهداف التعليمية المعتمدة", icon: "🎯", color: "from-blue-500 to-cyan-600" },
            { id: "2", label: "مرحلة المعالجة والمنطق", desc: matchedConcept ? matchedConcept.definition.slice(0, 50) + "..." : "تطبيق الخوارزميات والمعايير القياسية في بيئة التنفيذ", icon: "⚙️", color: "from-indigo-500 to-blue-700" },
            { id: "3", label: "مرحلة التحقق والضبط", desc: "اختبار المخرجات والتأكد من تلبية معايير الأمان والكفاءة", icon: "🔍", color: "from-amber-500 to-orange-600" },
            { id: "4", label: "المخرجات والإنتاج النهائي", desc: "تسليم حل رقمي متكامل ومستقر وقابل للتوسع", icon: "✨", color: "from-emerald-500 to-teal-600" },
          ],
          connections: [
            { from: "1", to: "2", label: "بيانات متطلبات دقيقة ومحددة" },
            { from: "2", to: "3", label: "نتائج المعالجة للاختبار والتقييم" },
            { from: "3", to: "4", label: "اعتماد الجودة والانتقال للإنتاج" },
          ],
        };
      }

      setGeneratedCustomDiagram(generated);
      setIsGeneratingCustomDiagram(false);
    }, 600);
  };

  // Quick suggestion prompts dynamically extracted from current lesson concepts
  const suggestionPrompts = useMemo(() => {
    const fromConcepts = (lesson.keyConcepts || []).slice(0, 3).map((c) => `كيف يعمل ${c.termAr} في الأنظمة الحديثة؟`);
    const fromSections = (lesson.sections || []).slice(0, 2).map((s) => `مخطط تدفق: ${s.title}`);
    const defaultList = [
      "آلية مصافحة TLS Handshake",
      "بنية شبكات Zero-Trust",
      "كيف تعمل الشبكة العصبية",
      "مبادئ التصميم البصري CRAP",
    ];
    return Array.from(new Set([...fromConcepts, ...fromSections, ...defaultList])).slice(0, 4);
  }, [lesson]);

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
                  مساعد المعلم الذكي: بنك الأسئلة والمخططات البصرية
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                توليد فوري مرتبط ببيانات الدرس: <span className="text-slate-200 font-semibold">{lesson.number} - {lesson.title}</span>
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
            <span>أسئلة صفية تفاعلية من المنهج ({generatedQuestions.length})</span>
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
                  <h4 className="text-base sm:text-lg font-bold text-white leading-relaxed whitespace-pre-line">
                    {activeQuestion.question}
                  </h4>
                </div>

                {/* Options List (For MCQ & True/False) */}
                {activeQuestion.options && activeQuestion.options.length > 0 && (
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
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium whitespace-pre-line">
                          {activeQuestion.explanation}
                        </p>
                        {activeQuestion.teacherDiscussionPrompt && (
                          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-amber-300">
                            <strong>💡 اقتراح لإدارة النقاش في الفصل: </strong>
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

                    {activeQuestion.teacherDiscussionPrompt && (
                      <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-indigo-200">
                        <strong>💡 إرشاد المعلم: </strong>
                        {activeQuestion.teacherDiscussionPrompt}
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
                          badge: "سؤال تفاعلي 🤖",
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
                  🎯 مستخرج بالكامل من قاعدة بيانات المنهج والكتاب المدرسي المعتمد
                </span>
              </div>
            </div>
          )}

          {/* 2. DIAGRAMS & CONCEPTS VISUALIZER DYNAMICALLY GENERATED FROM LESSON DATA */}
          {activeMode === "diagrams" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Key Concepts Architectural Breakdown */}
                {lesson.keyConcepts && lesson.keyConcepts.length > 0 && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-indigo-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        مصفوفة المفاهيم الأساسية
                      </span>
                      <Cpu className="w-4 h-4 text-blue-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      المفاهيم والمصطلحات المركزية ({lesson.keyConcepts.length} مفاهيم)
                    </h4>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap gap-2 max-h-56 overflow-y-auto custom-scrollbar">
                      {lesson.keyConcepts.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-xs text-indigo-200 flex items-center gap-1.5"
                        >
                          <span className="font-bold text-white">{c.termAr}</span>
                          {c.termEn && <span className="text-[10px] text-sky-300 font-mono">({c.termEn})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Think Like an Engineer Decision Flow */}
                {lesson.engineerChallenge && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-emerald-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        دورة الحل الهندسي
                      </span>
                      <Workflow className="w-4 h-4 text-emerald-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      {lesson.engineerChallenge.title}
                    </h4>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-xs">
                      {lesson.engineerChallenge.steps.map((st, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 p-2 bg-slate-950 rounded-lg border border-slate-800">
                          <span className="w-5 h-5 rounded bg-emerald-600/30 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                            {st.number}
                          </span>
                          <div>
                            <strong className="text-emerald-300 block text-[11px]">{st.title}</strong>
                            <span className="text-[11px] text-slate-400 leading-relaxed">{st.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {lesson.engineerChallenge.modelAnswer && (
                      <div className="p-3 bg-emerald-950/30 rounded-xl border border-emerald-500/30 space-y-1.5 text-xs text-slate-200">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>الإجابة والقرار النموذجي المعتمد:</span>
                        </div>
                        <div className="text-[11px] leading-relaxed text-slate-300 space-y-1">
                          {lesson.engineerChallenge.modelAnswer.split("\n").map((line, idx) => (
                            <p key={idx}>{line}</p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Solved Examples Model Answers in Study Guide */}
                {lesson.solvedExample && lesson.solvedExample.items && lesson.solvedExample.items.length > 0 && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-teal-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                        سلم الحلول النموذجية
                      </span>
                      <BookOpenCheck className="w-4 h-4 text-teal-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      {lesson.solvedExample.title} ({lesson.solvedExample.items.length} تمارين)
                    </h4>
                    <div className="space-y-2 text-xs">
                      {lesson.solvedExample.items.map((item, idx) => (
                        <div key={idx} className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                          <strong className="text-slate-200 block text-[11px]">
                            {idx + 1}. {item.question}
                          </strong>
                          <div className="p-2.5 bg-teal-950/40 rounded-lg border border-teal-500/20 text-teal-200 text-[11px] space-y-1">
                            <span className="font-bold block text-teal-300">
                              🏆 الإجابة النموذجية: {typeof item.correctAnswer === "string" ? item.correctAnswer.toUpperCase() : JSON.stringify(item.correctAnswer)}
                            </span>
                            <span className="text-slate-300 block leading-relaxed">{item.explanation}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Section Tables or Process Pipeline */}
                {lesson.sections && lesson.sections.length > 0 && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-purple-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        المحاور العلمية المتسلسلة
                      </span>
                      <Globe className="w-4 h-4 text-purple-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      خريطة التدفق العلمي للدرس ({lesson.sections.length} محاور)
                    </h4>
                    <div className="flex flex-col gap-2 p-3 bg-slate-900 rounded-xl border border-slate-800 text-[11px]">
                      {lesson.sections.map((sec, sIdx) => (
                        <div
                          key={sec.id}
                          className="p-2 bg-purple-950/50 border border-purple-500/30 rounded-lg flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-purple-600/40 text-purple-200 flex items-center justify-center font-bold text-[10px]">
                              {sIdx + 1}
                            </span>
                            <span className="font-bold text-white">{sec.title}</span>
                          </div>
                          {sec.table && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300">
                              جدول مقارنة 📊
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Pedagogical Learning Path Journey */}
                {lesson.learningPath && (
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 hover:border-pink-500/40 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                        المسار التعليمي والربط
                      </span>
                      <Palette className="w-4 h-4 text-pink-400" />
                    </div>
                    <h4 className="text-sm font-bold text-white">
                      الفكرة الجوهرية ومسار التدرج المعرفي
                    </h4>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-2 text-[11px]">
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-sky-300">
                        <strong>🎯 الفكرة المحورية: </strong>
                        <span className="text-slate-300">{lesson.coreIdea}</span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-emerald-300">
                        <strong>❓ السؤال الجوهري: </strong>
                        <span className="text-slate-300">{lesson.keyQuestion}</span>
                      </div>
                      {lesson.learningPath.next && (
                        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-amber-300">
                          <strong>🚀 الامتداد للدرس التالي: </strong>
                          <span className="text-slate-300">{lesson.learningPath.next}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. CUSTOM PROMPT GENERATIVE DIAGRAM */}
          {activeMode === "custom_prompt" && (
            <div className="space-y-6">
              {/* Input Prompt Box */}
              <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  اكتب أي مفهوم أو معمارية برمجية في المنهج لتوليد مخطط تدفق بصري لها:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleGenerateCustomDiagram();
                    }}
                    placeholder={`مثال: ${suggestionPrompts[0] || "كيف تعمل المعالجة الطرفية في الذكاء الاصطناعي؟"}`}
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

                {/* Ready-made Suggestions from Current Lesson */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500">اقتراحات مستوحاة من الدرس:</span>
                  {suggestionPrompts.map((sug, i) => (
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
                      مخطط تدفق مفاهيمي متقدم
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
          <span>🧠 متصل بقاعدة بيانات المنهج المركزي لتقديم تجربة تدريس تفاعلية وموثوقة</span>
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

