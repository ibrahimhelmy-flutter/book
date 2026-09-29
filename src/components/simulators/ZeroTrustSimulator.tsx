"use client";

import React, { useState } from "react";
import { ShieldCheck, ShieldAlert, Laptop, Lock, Unlock, CheckCircle2, XCircle, RotateCcw, AlertOctagon, UserX, Shield } from "lucide-react";

export function ZeroTrustSimulator() {
  const [stage, setStage] = useState<number>(0);
  const [policyEnforced, setPolicyEnforced] = useState<boolean>(true); // Zero trust vs Traditional

  const runSimulation = () => {
    setStage(1);
    setTimeout(() => setStage(2), 700);
    setTimeout(() => setStage(3), 1500);
  };

  const resetSim = () => {
    setStage(0);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">مختبر انعدام الثقة (Zero Trust) مقابل الأمان المحيطي</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              مقارنة مبدأ "لا تثق بأحد أبداً وتحقق دائماً" مع الأمان المحيطي التقليدي (ص 41-42)
            </p>
          </div>
        </div>

        {/* Policy Switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => { setPolicyEnforced(false); setStage(0); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              !policyEnforced ? "bg-red-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            الأمان المحيطي التقليدي 🏰
          </button>
          <button
            onClick={() => { setPolicyEnforced(true); setStage(0); }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              policyEnforced ? "bg-purple-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            نموذج Zero Trust الحديث 🛡️
          </button>
        </div>
      </div>

      {/* Concept Definition Banner */}
      <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-4 text-xs sm:text-sm text-purple-200 leading-relaxed flex items-start gap-3 mb-6">
        <span className="p-1 bg-purple-500/20 rounded text-purple-300 font-bold shrink-0">المفهوم الوزاري (ص 41-42):</span>
        <div>
          <strong>نموذج انعدام الثقة (Zero Trust Architecture):</strong> استراتيجية أمنية تقوم على مبدأ 
          <strong> "لا تثق بأحد أبداً، وتحقق دائماً وبشكل مستمر" (Never Trust, Always Verify)</strong>.
          لا يمنح النظام أي ثقة تلقائية للمستخدمين أو الأجهزة بمجرد وجودهم داخل الشبكة، بل يتحقق من الهوية، وسلامة الجهاز، والحد الأدنى من الصلاحيات لكل طلب وصول.
        </div>
      </div>

      {/* Scenario Context */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-purple-400 font-bold block mb-1">السيناريو الواقعي:</span>
            <h4 className="font-bold text-sm text-white">
              جهاز موظف مصاب ببرمجية خبيثة عبر بريد تصيد احتيالي يحاول الاتصال بشبكة المدرسة الداخلية
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              الموظف يمتلك بيانات تسجيل دخول حقيقية، لكن جهازه مخترق سراً من قبل مهاجم خارجي.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={runSimulation}
              disabled={stage > 0 && stage < 3}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
            >
              تشغيل المحاكاة 🚀
            </button>
            {stage > 0 && (
              <button
                onClick={resetSim}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Step by Step Progression */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Step 1: Authentication */}
        <div className={`p-5 rounded-2xl border transition-all ${
          stage >= 1 ? "bg-slate-950 border-purple-500/50" : "bg-slate-950/40 border-slate-800 opacity-60"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">المرحلة 1</span>
            <Laptop className="w-4 h-4 text-purple-400" />
          </div>
          <h5 className="font-bold text-sm text-white">1. تسجيل الدخول</h5>
          <p className="text-xs text-slate-400 mt-1">
            الجهاز يقدم اسم المستخدم وكلمة المرور للدخول للشبكة.
          </p>
          {stage >= 1 && (
            <div className="mt-3 p-2 bg-slate-900 rounded-lg text-[11px] text-emerald-400 font-mono">
              ✅ تم التحقق من كلمة المرور
            </div>
          )}
        </div>

        {/* Step 2: Verification Policy */}
        <div className={`p-5 rounded-2xl border transition-all ${
          stage >= 2 ? "bg-slate-950 border-purple-500/50" : "bg-slate-950/40 border-slate-800 opacity-60"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">المرحلة 2</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <h5 className="font-bold text-sm text-white">2. فحص الثقة وسلامة الجهاز</h5>
          <p className="text-xs text-slate-400 mt-1">
            {policyEnforced
              ? "فحص أمني لحظي لحالة نظام التشغيل، ومضاد الفيروسات، وسلوك الطلب."
              : "افتراض أن الجهاز آمن تلقائياً لأنه نجح في تسجيل الدخول!"}
          </p>
          {stage >= 2 && (
            <div className={`mt-3 p-2 rounded-lg text-[11px] font-mono ${
              policyEnforced
                ? "bg-purple-950 text-purple-300 border border-purple-800"
                : "bg-amber-950 text-amber-300 border border-amber-800"
            }`}>
              {policyEnforced ? "🔍 رصد برمجية مشبوهة وسلوك شاذ" : "⚠️ ثقة عمياء ضمنية (Implicit Trust)"}
            </div>
          )}
        </div>

        {/* Step 3: Access Outcome */}
        <div className={`p-5 rounded-2xl border transition-all ${
          stage >= 3 ? "bg-slate-950 border-purple-500/50" : "bg-slate-950/40 border-slate-800 opacity-60"
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">المرحلة 3</span>
            {policyEnforced ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-400" />
            )}
          </div>
          <h5 className="font-bold text-sm text-white">3. القرار النهائي والنتيجة</h5>
          <p className="text-xs text-slate-400 mt-1">
            {policyEnforced ? "تطبيق مبدأ انعدام الثقة وعزل التهديد." : "نتيجة الأمان المحيطي المفتوح."}
          </p>
          {stage >= 3 && (
            <div className={`mt-3 p-2 rounded-lg text-[11px] font-bold ${
              policyEnforced
                ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40"
                : "bg-red-950/60 text-red-300 border border-red-500/40"
            }`}>
              {policyEnforced ? "🛡️ تم عزل الجهاز وحظر الوصول لقواعد البيانات!" : "💥 كارثة! انتشرت البرمجية الخبيثة وشفرت الخوادم!"}
            </div>
          )}
        </div>
      </div>

      {/* In-depth Comparison Table */}
      <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider font-mono">
          مقارنة الفلسفة الأمنية بين النموذجين:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <div className="font-bold text-red-400 mb-1 flex items-center gap-1.5">
              <UserX className="w-4 h-4" /> الأمان المحيطي التقليدي (Perimeter Security)
            </div>
            <ul className="text-slate-400 space-y-1 list-disc list-inside leading-relaxed mt-2">
              <li>يركز الدفاع فقط على الأطراف الخارجية والحدود (Firewall + VPN).</li>
              <li>بمجرد دخول المهاجم للشبكة، يصبح حراً في التحرك أفقياً (Lateral Movement).</li>
              <li>يفترض أن الداخل موثوق تماماً (Trust but Verify).</li>
            </ul>
          </div>

          <div className="p-3.5 bg-slate-900 rounded-xl border border-purple-500/30">
            <div className="font-bold text-purple-400 mb-1 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> نموذج انعدام الثقة (Zero Trust Architecture)
            </div>
            <ul className="text-slate-300 space-y-1 list-disc list-inside leading-relaxed mt-2">
              <li>المبدأ الثابت: "Never Trust, Always Verify" (لا تثق، وتحقق دائماً).</li>
              <li>التحقق الصارم والمستمر من الهوية وسلامة الجهاز لكل معاملة بمفردها.</li>
              <li>صلاحيات دنيا محدودة (Least Privilege) وتقسيم شبكي دقيق (Micro-segmentation).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
