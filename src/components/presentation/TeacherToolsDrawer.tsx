"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Clock,
  UserCheck,
  BookOpen,
  Keyboard,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Award,
  Volume2,
  VolumeX,
  Shuffle,
  HelpCircle,
  X,
  Timer
} from "lucide-react";
import { fireConfetti } from "@/lib/confetti";

interface TeacherToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentSlideIndex: number;
  currentSlideTitle: string;
  totalSlides: number;
  slideType: string;
  engineerModelAnswer?: string;
  solvedExampleModelAnswer?: string;
}

export function TeacherToolsDrawer({
  isOpen,
  onClose,
  currentSlideIndex,
  currentSlideTitle,
  totalSlides,
  slideType,
  engineerModelAnswer,
  solvedExampleModelAnswer,
}: TeacherToolsDrawerProps) {
  const [activeTab, setActiveTab] = useState<"timer" | "randomizer" | "notes" | "shortcuts">("timer");

  // --- 1. Class Activity Timer State ---
  const [timerSeconds, setTimerSeconds] = useState<number>(120); // 2 minutes default
  const [initialSeconds, setInitialSeconds] = useState<number>(120);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isTimerRunning && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            fireConfetti({ particleCount: 40, spread: 50 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timerSeconds]);

  const handleStartTimer = (sec: number) => {
    setInitialSeconds(sec);
    setTimerSeconds(sec);
    setIsTimerRunning(true);
  };

  const handleToggleTimer = () => {
    if (timerSeconds === 0) {
      setTimerSeconds(initialSeconds);
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(!isTimerRunning);
    }
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(initialSeconds);
  };

  // --- 2. Random Student Picker State ---
  const [classSize, setClassSize] = useState<number>(30);
  const [selectedStudentNumber, setSelectedStudentNumber] = useState<number | null>(null);
  const [isPicking, setIsPicking] = useState<boolean>(false);

  const handlePickRandomStudent = () => {
    setIsPicking(true);
    let count = 0;
    const interval = setInterval(() => {
      setSelectedStudentNumber(Math.floor(Math.random() * classSize) + 1);
      count++;
      if (count >= 12) {
        clearInterval(interval);
        setIsPicking(false);
        fireConfetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }, 80);
  };

  // --- 3. Dynamic Pedagogical Speaker Notes for Teacher ---
  const getTeacherNotes = () => {
    switch (slideType) {
      case "intro":
        return {
          time: "3-4 دقائق",
          goal: "إثارة فضول الطلاب وربط الموضوع بخبراتهم السابقة.",
          points: [
            "اطرح السؤال الجوهري على الفصل واطلب من طالبين التخمين قبل عرض الإجابة.",
            "استعرض أهداف التعلم بصوت واضح وأكّد على ما سيتمكن الطالب من إنجازه في نهاية الحصة.",
            "شجّع الطلاب على تسجيل الأسئلة التي تخطر ببالهم في دفاترهم.",
          ],
          prompt: "سؤال موجه: 'من منكم لاحظ هذا المفهوم في التطبيقات التي يستخدمها يومياً على هاتفه؟'",
        };
      case "section":
        return {
          time: "5-7 دقائق",
          goal: "شرح المحتوى العلمي وتفكيك المصطلحات الصعبة مع دعمها بالرسم.",
          points: [
            "استخدم قلم الرسم أو المؤشر الليزري لتسليط الضوء على الكلمات المفتاحية في الجداول والرسوم.",
            "اربط المحتوى بالأشكال والمخططات البيانية المستخرجة من الكتاب.",
            "توقف عند نهاية كل نقطة وتحقق من فهم الفصل بسؤال عشوائي سريع.",
          ],
          prompt: "سؤال مناقشة: 'كيف يؤثر هذا المفهوم في كفاءة النظام أو أمانه السيبراني؟'",
        };
      case "concepts":
        return {
          time: "4 دقائق",
          goal: "تثبيت المصطلحات العلمية باللغتين العربية والإنجليزية.",
          points: [
            "انطق المصطلح باللغة الإنجليزية واطلب من الفصل تكراره.",
            "اطلب من طالب صياغة التعريف بأسلوبه الخاص دون قراءة حرفية.",
            "ميّز بين المصطلحات المتقاربة لتجنب اللبس الشائع.",
          ],
          prompt: "تحدي: 'من يعطيني مثالاً واقعياً ينطبق عليه هذا المصطلح تماماً؟'",
        };
      case "engineer":
        return {
          time: "6-8 دقائق",
          goal: "تطبيق التفكير الهندسي وصناعة القرار في سيناريو واقعي.",
          points: [
            "قسّم الفصل إلى ثنائيات للتفكير في السيناريو لمدة دقيقتين (استخدم المؤقت).",
            "ناقش الخيارات المختلفة وبيّن التضحيات الهندسية (Trade-offs) لكل قرار.",
            "ركّز على كيفية تبرير القرار استناداً للأدلة العلمية.",
          ],
          prompt: "تساؤل: 'لو كنت مسؤولاً عن هذا النظام، ما هو القرار الأكثر أماناً وأقل كلفة؟'",
        };
      case "example":
        return {
          time: "5 دقائق",
          goal: "نمذجة الحل خطوة بخطوة وتوضيح استراتيجيات الامتحانات.",
          points: [
            "لا تكشف الإجابة فوراً، بل اطلب من الطلاب تحليل السؤال أولاً واستبعاد الخيارات الخاطئة.",
            "اشرح لماذا كانت الإجابة الصحيحة هي الأنسب مع التعليل العلمي.",
            "نبّه على الأخطاء الشائعة التي يقع فيها الطلاب في هذا النوع من المسائل.",
            ...(solvedExampleModelAnswer ? [`الإجابة والتعليل النموذجي المعتمد:\n${solvedExampleModelAnswer}`] : []),
          ],
          prompt: "توجيه: 'ما هي الكلمة المفتاحية في نص المسألة التي تدلنا على الحل مباشرة؟'",
        };
      case "summary":
      default:
        return {
          time: "4 دقائق",
          goal: "غلق الدرس وقياس تحقق نواتج التعلم المستهدفة.",
          points: [
            "استعرض خلاصة الدرس واطلب من الطلاب تلخيص أهم فكرة تعلموها اليوم.",
            "أطلق سؤال الذكاء الاصطناعي السريع من زر المساعد الذكي لإجراء تصويت صفي.",
            "كلف الطلاب بالتحدي الذاتي أو التمرين المنزلي المرفق في نهاية الدرس.",
          ],
          prompt: "سؤال ختامي: 'ما هي أهم نقطة استفدتها اليوم وستغير نظرتك للتقنية؟'",
        };
    }
  };

  const notes = getTeacherNotes();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col text-white">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
              🛠️
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                صندوق أدوات المعلم للحصة التفاعلية
              </h3>
              <p className="text-xs text-slate-400">
                الشريحة {currentSlideIndex + 1} من {totalSlides}: {currentSlideTitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 p-2 gap-1.5">
          <button
            onClick={() => setActiveTab("timer")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "timer" ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>مؤقت النشاط</span>
          </button>

          <button
            onClick={() => setActiveTab("randomizer")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "randomizer" ? "bg-purple-600 text-white shadow-md shadow-purple-600/30" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Shuffle className="w-4 h-4" />
            <span>قرعة الطلاب</span>
          </button>

          <button
            onClick={() => setActiveTab("notes")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "notes" ? "bg-amber-600 text-white shadow-md shadow-amber-600/30" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>دليل الشرح للشريحة</span>
          </button>

          <button
            onClick={() => setActiveTab("shortcuts")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "shortcuts" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30" : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Keyboard className="w-4 h-4" />
            <span>اختصارات الكيبورد</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          {/* 1. TIMER TAB */}
          {activeTab === "timer" && (
            <div className="space-y-6 text-center">
              {/* Digital Countdown Display */}
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center">
                <div className="text-5xl sm:text-6xl font-mono font-extrabold tracking-wider text-blue-400 drop-shadow-md">
                  {String(Math.floor(timerSeconds / 60)).padStart(2, "0")}:
                  {String(timerSeconds % 60).padStart(2, "0")}
                </div>

                <p className="text-xs text-slate-400 mt-2">
                  {timerSeconds === 0 ? "🎉 انتهى وقت النشاط!" : isTimerRunning ? "⏱️ المؤقت يعمل الآن..." : "المؤقت متوقف مؤقتاً"}
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {[
                  { label: "30 ثانية (سريع)", sec: 30 },
                  { label: "دقيقة واحدة", sec: 60 },
                  { label: "دقيقتان (نشاط ثنائي)", sec: 120 },
                  { label: "5 دقائق (تحدي جماعي)", sec: 300 },
                ].map((preset) => (
                  <button
                    key={preset.sec}
                    onClick={() => handleStartTimer(preset.sec)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors cursor-pointer border border-slate-700"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Main Play / Pause / Reset Actions */}
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleToggleTimer}
                  className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                    isTimerRunning
                      ? "bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
                  }`}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isTimerRunning ? "إيقاف مؤقت" : "بدء المؤقت"}</span>
                </button>

                <button
                  onClick={handleResetTimer}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>إعادة تعيين</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. RANDOMIZER TAB */}
          {activeTab === "randomizer" && (
            <div className="space-y-6 text-center">
              <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-4">
                <div
                  className={`w-28 h-28 rounded-3xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white flex items-center justify-center font-extrabold text-4xl shadow-xl shadow-purple-900/40 transition-transform ${
                    isPicking ? "scale-110 animate-spin" : "scale-100"
                  }`}
                >
                  {selectedStudentNumber ? `#${selectedStudentNumber}` : "؟"}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white">
                    {selectedStudentNumber
                      ? `الطالب رقم (${selectedStudentNumber}) يتفضل بالإجابة 🎉`
                      : "انقر على الزر لاختيار طالب عشوائي للمشاركة"}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    إجمالي عدد طلاب الفصل: {classSize} طالباً
                  </p>
                </div>
              </div>

              {/* Class Size Selector */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs text-slate-400 font-bold">تحديد عدد طلاب الفصل:</span>
                {[20, 25, 30, 35, 40].map((num) => (
                  <button
                    key={num}
                    onClick={() => setClassSize(num)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      classSize === num ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Roll Dice Button */}
              <button
                onClick={handlePickRandomStudent}
                disabled={isPicking}
                className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 transition-all mx-auto"
              >
                <Shuffle className={`w-4 h-4 ${isPicking ? "animate-spin" : ""}`} />
                <span>إجراء القرعة العشوائية 🎲</span>
              </button>
            </div>
          )}

          {/* 3. SPEAKER NOTES TAB */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>الوقت المقترح للشريحة: {notes.time}</span>
                </span>
                <span className="text-slate-400">
                  الهدف: {notes.goal}
                </span>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2.5 text-xs">
                <strong className="text-blue-400 block font-bold">نقاط وتوجيهات الشرح الموصى بها للمعلم:</strong>
                <ul className="space-y-2 text-slate-300">
                  {notes.points.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span className="leading-relaxed">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-indigo-950/50 rounded-2xl border border-indigo-500/30 text-xs text-indigo-200">
                <strong className="text-indigo-300 block mb-1">💡 مقترح تفاعلي لإشعال الحصة:</strong>
                <p className="leading-relaxed">{notes.prompt}</p>
              </div>

              {slideType === "engineer" && engineerModelAnswer && (
                <div className="p-4 bg-emerald-950/40 rounded-2xl border border-emerald-500/40 text-xs text-emerald-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-emerald-300 flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>الإجابة والقرار الهندسي النموذجي المعتمد للمعلم:</span>
                    </strong>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      نموذج الإجابة
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1 text-slate-200 font-medium leading-relaxed">
                    {engineerModelAnswer.split("\n").map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {slideType === "example" && solvedExampleModelAnswer && (
                <div className="p-4 bg-teal-950/40 rounded-2xl border border-teal-500/40 text-xs text-teal-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <strong className="text-teal-300 flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-4 h-4 text-teal-400" />
                      <span>سلم التصحيح والحل النموذجي للشريحة:</span>
                    </strong>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                      حل معتمد
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1 text-slate-200 font-medium leading-relaxed">
                    {solvedExampleModelAnswer.split("\n").map((line, idx) => (
                      <p key={idx}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. KEYBOARD SHORTCUTS TAB */}
          {activeTab === "shortcuts" && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "Space / ⮜", label: "السطر التالي / الشريحة التالية" },
                  { key: "⮞", label: "الشريحة السابقة" },
                  { key: "F", label: "تبديل ملء الشاشة (Fullscreen)" },
                  { key: "W", label: "فتح السبورة الرقمية (Whiteboard)" },
                  { key: "Q", label: "فتح مساعد الأسئلة الذكية AI" },
                  { key: "P / D", label: "تفعيل قلم الرسم الحر" },
                  { key: "H", label: "تفعيل قلم التظليل الشفاف" },
                  { key: "L", label: "تفعيل المؤشر الليزري التفاعلي" },
                  { key: "E", label: "تفعيل ممحاة الرسم" },
                  { key: "Ctrl + Z", label: "تراجع عن الرسم (Undo)" },
                  { key: "Ctrl + Y", label: "إعادة الرسم (Redo)" },
                  { key: "Esc", label: "إلغاء ملء الشاشة أو إغلاق النوافذ" },
                ].map((sc, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between"
                  >
                    <span className="text-slate-300">{sc.label}</span>
                    <kbd className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-amber-400 font-mono text-[11px] font-bold">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer transition-colors"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
}
