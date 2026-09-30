"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Laptop,
  Database,
  RotateCcw,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
} from "lucide-react";

export function ZeroTrustSimulator() {
  const [model, setModel] = useState<"perimeter" | "zero_trust">("zero_trust");
  const [simStep, setSimStep] = useState<number>(0); // 0=idle, 1=login, 2=inspection, 3=verdict
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const runSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setSimStep(1); // Step 1: Laptop attempts access

    setTimeout(() => {
      setSimStep(2); // Step 2: Policy check
    }, 900);

    setTimeout(() => {
      setSimStep(3); // Step 3: Final outcome
      setIsSimulating(false);
    }, 2000);
  };

  const resetAll = () => {
    setSimStep(0);
    setIsSimulating(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">
              مختبر انعدام الثقة (Zero Trust) مقابل الأمان المحيطي
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              مقارنة مبدأ &quot;لا تثق بأحد أبداً وتحقق دائماً&quot; مع الثقة العمياء داخل الشبكة (ص 41 - 42)
            </p>
          </div>
        </div>

        {/* Model Switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => {
              setModel("perimeter");
              resetAll();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              model === "perimeter" ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            الأمان المحيطي التقليدي 🏰
          </button>
          <button
            onClick={() => {
              setModel("zero_trust");
              resetAll();
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              model === "zero_trust" ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            نموذج Zero Trust الحديث 🛡️
          </button>
        </div>
      </div>

      {/* Core Idea Banner */}
      <div className="bg-purple-950/30 border border-purple-500/20 rounded-2xl p-4 mb-6 text-xs sm:text-sm text-purple-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
        <div>
          {model === "perimeter" ? (
            <span>
              <strong>الأمان المحيطي (القلعة والخندق):</strong> يفترض أن أي جهاز داخل الشبكة هو جهاز &quot;موثوق تلقائياً&quot;.
              إذا اخترق المهاجم لابتوب موظف عبر بريد تصيد، يستطيع التجول بحرية وسرقة بيانات الطلاب دون أن يوقفه أحد!
            </span>
          ) : (
            <span>
              <strong>مبدأ انعدام الثقة (Zero Trust):</strong> شعاره:{" "}
              <strong>&quot;Never Trust, Always Verify&quot; (لا تثق بأحد أبداً، وتحقق دائماً)</strong>.
              لا ثقة تلقائية لأي جهاز حتى لو كان داخل مكتب المدير! يتم فحص سلامة الجهاز وسلوكه مع كل طلب.
            </span>
          )}
        </div>
      </div>

      {/* Scenario Bar */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-mono text-purple-400 font-bold uppercase">السيناريو:</span>
          <div className="text-xs font-bold text-white mt-0.5">
            لابتوب موظف مصاب ببرمجية خبيثة سراً، يحاول الوصول لقاعدة بيانات درجات الطلاب.
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <Play className="w-4 h-4" />
            تشغيل المحاكاة 🚀
          </button>
          <button
            onClick={resetAll}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            title="إعادة الضبط"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Animated Arena */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_1fr] gap-4 items-center">
          
          {/* INFECTED LAPTOP */}
          <div className={`p-4 rounded-2xl border text-center transition-all ${
            simStep >= 1 ? "bg-red-950/30 border-red-500/50" : "bg-slate-900/70 border-slate-800"
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-400 mx-auto flex items-center justify-center mb-2 border border-red-500/30">
              <Laptop className="w-6 h-6" />
            </div>
            <div className="font-bold text-xs sm:text-sm text-white">جهاز الموظف المخترق</div>
            <div className="text-[10px] text-red-400 font-bold mt-0.5">⚠️ مصاب بفيروس تصيد</div>

            {simStep >= 1 && (
              <div className="mt-2 text-[10px] text-slate-300 font-mono">
                يرسل طلب: SELECT * FROM grades;
              </div>
            )}
          </div>

          {/* INSPECTION / VERIFICATION ZONE */}
          <div className="flex flex-col items-center justify-center py-4 px-2">
            <div className="text-[10px] font-mono text-slate-400 mb-2">
              {model === "zero_trust" ? "مدقق الأمان المستمر (Zero Trust Sensor)" : "نقطة تفتيش الحدود (Perimeter)"}
            </div>

            {/* Central Animated Gate */}
            <div className={`w-24 h-24 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-500 ${
              simStep === 3
                ? model === "zero_trust"
                  ? "bg-emerald-950/70 border-emerald-500 text-emerald-400 shadow-xl shadow-emerald-950/40"
                  : "bg-red-950/70 border-red-500 text-red-400 shadow-xl shadow-red-950/40 animate-shake"
                : simStep === 2
                ? "bg-purple-950/70 border-purple-500 text-purple-400 animate-pulse"
                : "bg-slate-900 border-slate-700 text-slate-400"
            }`}>
              {simStep === 3 ? (
                model === "zero_trust" ? (
                  <>
                    <ShieldCheck className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-bold">عزل الجهاز 🛑</span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="w-8 h-8 mb-1" />
                    <span className="text-[10px] font-bold">عبور حر 🔓</span>
                  </>
                )
              ) : simStep === 2 ? (
                <>
                  <Sparkles className="w-8 h-8 mb-1 animate-spin" />
                  <span className="text-[10px] font-bold">فحص الجهاز...</span>
                </>
              ) : (
                <>
                  <Lock className="w-8 h-8 mb-1" />
                  <span className="text-[10px] font-bold">في الانتظار</span>
                </>
              )}
            </div>

            {/* Step text */}
            <div className="mt-3 text-center">
              {simStep === 2 && (
                <span className="text-xs text-purple-300 font-bold animate-pulse">
                  {model === "zero_trust"
                    ? "🔍 رصد برمجية ضارة وفشل فحص سلامة الجهاز!"
                    : "⚠️ الجهاز داخل شبكة المؤسسة: ثقة عمياء تلقائية!"}
                </span>
              )}
              {simStep === 3 && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  model === "zero_trust"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                }`}>
                  {model === "zero_trust"
                    ? "✅ تم حظر الطلب وعزل اللابتوب المصاب"
                    : "❌ تسلل المهاجم وسرق قاعدة البيانات بالكامل"}
                </span>
              )}
            </div>
          </div>

          {/* TARGET: Database Server */}
          <div className={`p-4 rounded-2xl border text-center transition-all ${
            simStep === 3 && model === "perimeter"
              ? "bg-red-950/70 border-red-500 text-red-300 animate-shake"
              : "bg-slate-900/70 border-slate-800"
          }`}>
            <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-2 border ${
              simStep === 3 && model === "perimeter"
                ? "bg-red-600/30 text-red-400 border-red-500/50"
                : "bg-emerald-600/20 text-emerald-400 border-emerald-500/30"
            }`}>
              <Database className="w-6 h-6" />
            </div>
            <div className="font-bold text-xs sm:text-sm text-white">قاعدة بيانات الطلاب</div>
            <div className="text-[10px] font-mono mt-0.5 text-slate-400">سجلات سرية</div>

            <div className="mt-2 text-[10px] font-bold">
              {simStep === 3 ? (
                model === "zero_trust" ? (
                  <span className="text-emerald-400">محمية بالكامل 🔒</span>
                ) : (
                  <span className="text-red-400">💥 تم تسريب الدرجات!</span>
                )
              ) : (
                <span className="text-slate-500">جاهزة وآمنة</span>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Pedagogical Takeaway Box */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 text-xs leading-relaxed text-slate-300">
        <div className="font-bold text-white mb-1">الخلاصة للامتحان الوزاري:</div>
        {model === "zero_trust" ? (
          <p>
            في نموذج <strong>انعدام الثقة (Zero Trust)</strong>، لا تُمنح الثقة لأي كيان لمجرد وجوده داخل الشبكة.
            كل معاملة تخضع للمصادقة الصارمة والتحقق المستمر وتطبيق الحد الأدنى من الصلاحيات (Least Privilege).
          </p>
        ) : (
          <p>
            في <strong>الأمان المحيطي التقليدي</strong>، بمجرد اختراق أي نقطة طرفية (Endpoint) داخل الشركة،
            يستطيع المهاجم التحرك أفقياً (Lateral Movement) والوصول لكافة الخوادم بسبب الثقة الضمنية الممنوحة للشبكة الداخلية.
          </p>
        )}
      </div>
    </div>
  );
}
