"use client";

import React, { useState } from "react";
import {
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Smartphone,
  Fingerprint,
  Lock,
  Unlock,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export function MFAMatrixSimulator() {
  // Activated factors
  const [hasPassword, setHasPassword] = useState<boolean>(true);
  const [hasPhoneOTP, setHasPhoneOTP] = useState<boolean>(true);
  const [hasBiometric, setHasBiometric] = useState<boolean>(false);

  // Simulation test state
  const [testType, setTestType] = useState<"none" | "legit_user" | "hacker_attack">("none");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const activeFactorsCount =
    (hasPassword ? 1 : 0) + (hasPhoneOTP ? 1 : 0) + (hasBiometric ? 1 : 0);

  const isMFA = activeFactorsCount >= 2;

  const runTest = (type: "legit_user" | "hacker_attack") => {
    setIsAnimating(true);
    setTestType(type);
    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };

  const resetAll = () => {
    setTestType("none");
    setIsAnimating(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-600/20 text-teal-400 rounded-2xl border border-teal-500/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">
              مختبر المصادقة متعددة العوامل (MFA)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              اختبار صمود الحساب ضد سرقة كلمة المرور بتفعيل عوامل الأمان الثلاثة (ص 33 - 34)
            </p>
          </div>
        </div>

        <button
          onClick={resetAll}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
          title="إعادة الضبط"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Core Idea Banner */}
      <div className="bg-teal-950/30 border border-teal-500/20 rounded-2xl p-4 mb-6 text-xs sm:text-sm text-teal-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <strong>الفكرة ببساطة:</strong> المصادقة تعتمد على 3 فئات:{" "}
          <strong>1. شيء تعرفه</strong> (كلمة المرور)،{" "}
          <strong>2. شيء تمتلكه</strong> (رمز الهاتف OTP)،{" "}
          <strong>3. شيء فيك</strong> (بصمة الإصبع/الوجه).
          تفعيل عاملين أو أكثر (<strong>MFA</strong>) يحمي حسابك حتى لو سُرقت كلمة مرورك بالكامل!
        </div>
      </div>

      {/* 3 Factors Toggle Pills */}
      <div className="mb-6">
        <div className="text-xs font-bold text-slate-300 mb-2.5 flex items-center justify-between">
          <span>اختر العوامل المفعلة للحساب:</span>
          <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
            isMFA
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/20 text-amber-400 border-amber-500/30"
          }`}>
            {isMFA ? `✅ نظام محمي بـ MFA (${activeFactorsCount} عوامل)` : "⚠️ عامل أمان واحد فقط (خطر)"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Factor 1 */}
          <button
            onClick={() => {
              setHasPassword(!hasPassword);
              setTestType("none");
            }}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              hasPassword
                ? "bg-slate-950 border-teal-500 ring-2 ring-teal-500/20 text-white"
                : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${hasPassword ? "bg-teal-500/20 text-teal-400" : "bg-slate-850 text-slate-600"}`}>
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold">1. شيء تعرفه</div>
                <div className="text-[11px] text-slate-400">كلمة المرور (Password)</div>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${hasPassword ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-500"}`}>
              {hasPassword ? "مفعّل" : "معطّل"}
            </span>
          </button>

          {/* Factor 2 */}
          <button
            onClick={() => {
              setHasPhoneOTP(!hasPhoneOTP);
              setTestType("none");
            }}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              hasPhoneOTP
                ? "bg-slate-950 border-teal-500 ring-2 ring-teal-500/20 text-white"
                : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${hasPhoneOTP ? "bg-teal-500/20 text-teal-400" : "bg-slate-850 text-slate-600"}`}>
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold">2. شيء تمتلكه</div>
                <div className="text-[11px] text-slate-400">رمز الهاتف OTP</div>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${hasPhoneOTP ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-500"}`}>
              {hasPhoneOTP ? "مفعّل" : "معطّل"}
            </span>
          </button>

          {/* Factor 3 */}
          <button
            onClick={() => {
              setHasBiometric(!hasBiometric);
              setTestType("none");
            }}
            className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
              hasBiometric
                ? "bg-slate-950 border-teal-500 ring-2 ring-teal-500/20 text-white"
                : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${hasBiometric ? "bg-teal-500/20 text-teal-400" : "bg-slate-850 text-slate-600"}`}>
                <Fingerprint className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold">3. شيء فيك</div>
                <div className="text-[11px] text-slate-400">بصمة الإصبع أو الوجه</div>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${hasBiometric ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-500"}`}>
              {hasBiometric ? "مفعّل" : "معطّل"}
            </span>
          </button>
        </div>
      </div>

      {/* Visual Animated Vault Gateway */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 mb-6">
        <div className="flex flex-col items-center justify-center">
          
          {/* Vault Door Icon */}
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 border ${
            testType === "none"
              ? "bg-slate-900 border-slate-700 text-slate-400"
              : testType === "legit_user"
              ? "bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-xl shadow-emerald-950/40 scale-105"
              : isMFA
              ? "bg-teal-950/60 border-teal-500 text-teal-400 shadow-xl scale-105"
              : "bg-red-950/60 border-red-500 text-red-400 shadow-xl shadow-red-950/40 animate-shake"
          }`}>
            {testType === "legit_user" ? (
              <Unlock className="w-10 h-10 animate-bounce" />
            ) : testType === "hacker_attack" && !isMFA ? (
              <ShieldAlert className="w-10 h-10 animate-pulse text-red-400" />
            ) : (
              <Lock className="w-10 h-10" />
            )}
          </div>

          {/* Door Status Text */}
          <div className="text-center mt-3 mb-4">
            <h4 className="font-bold text-base text-white">
              {testType === "none"
                ? "بوابة المصادقة بانتظار التجربة"
                : testType === "legit_user"
                ? "✅ تم تسجيل الدخول بنجاح"
                : isMFA
                ? "🛡️ تم صد الهجوم ومنع الاختراق!"
                : "💥 كارثة! تم اختراق الحساب بالكامل!"}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              {testType === "none"
                ? "جرب تسجيل دخول مستخدم حقيقي أو محاكاة هجوم مخترق يملك كلمة المرور المسروقة"
                : testType === "legit_user"
                ? "المستخدم قدم جميع عوامل الأمان المطلوبة وتم فتح الخزنة."
                : isMFA
                ? "المخترق يملك كلمة المرور، لكنه عجز عن تجاوز الهاتف أو البصمة!"
                : "لأن الحساب لا يحمي نفسه سوى بكلمة المرور فقط، استطاع المهاجم سرقة كل شيء!"}
            </p>
          </div>

          {/* Factor Verification Slots */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-md pt-3 border-t border-slate-800">
            {/* Slot 1 */}
            <div className={`p-2.5 rounded-xl border text-center transition-all ${
              !hasPassword
                ? "bg-slate-900/40 border-slate-800/60 text-slate-600"
                : testType === "legit_user" || testType === "hacker_attack"
                ? "bg-emerald-950/50 border-emerald-500/60 text-emerald-300 font-bold"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}>
              <div className="text-[10px] text-slate-400">العامل 1: السر</div>
              <div className="text-xs mt-0.5">
                {!hasPassword ? "معطل" : testType !== "none" ? "✅ متطابق" : "مطلوب"}
              </div>
            </div>

            {/* Slot 2 */}
            <div className={`p-2.5 rounded-xl border text-center transition-all ${
              !hasPhoneOTP
                ? "bg-slate-900/40 border-slate-800/60 text-slate-600"
                : testType === "legit_user"
                ? "bg-emerald-950/50 border-emerald-500/60 text-emerald-300 font-bold"
                : testType === "hacker_attack"
                ? "bg-red-950/60 border-red-500/60 text-red-300 font-bold animate-pulse"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}>
              <div className="text-[10px] text-slate-400">العامل 2: الهاتف</div>
              <div className="text-xs mt-0.5">
                {!hasPhoneOTP
                  ? "معطل"
                  : testType === "legit_user"
                  ? "✅ رمز صحيح"
                  : testType === "hacker_attack"
                  ? "❌ غير متوفر"
                  : "مطلوب"}
              </div>
            </div>

            {/* Slot 3 */}
            <div className={`p-2.5 rounded-xl border text-center transition-all ${
              !hasBiometric
                ? "bg-slate-900/40 border-slate-800/60 text-slate-600"
                : testType === "legit_user"
                ? "bg-emerald-950/50 border-emerald-500/60 text-emerald-300 font-bold"
                : testType === "hacker_attack"
                ? "bg-red-950/60 border-red-500/60 text-red-300 font-bold animate-pulse"
                : "bg-slate-900 border-slate-800 text-slate-400"
            }`}>
              <div className="text-[10px] text-slate-400">العامل 3: البصمة</div>
              <div className="text-xs mt-0.5">
                {!hasBiometric
                  ? "معطل"
                  : testType === "legit_user"
                  ? "✅ مطابقة"
                  : testType === "hacker_attack"
                  ? "❌ مفقودة"
                  : "مطلوب"}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => runTest("legit_user")}
          disabled={activeFactorsCount === 0}
          className="p-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl text-right transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4" /> تجربة دخول المستخدم الشرعي
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              يقدم كلمة المرور + رمز الهاتف + البصمة
            </div>
          </div>
          <span className="text-xs text-emerald-400 font-bold">اختبار 👤</span>
        </button>

        <button
          onClick={() => runTest("hacker_attack")}
          disabled={activeFactorsCount === 0}
          className="p-3.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl text-right transition-all cursor-pointer flex items-center justify-between"
        >
          <div>
            <div className="text-xs font-bold text-red-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> محاكاة هجوم مخترق (كلمة مرور مسروقة)
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              المخترق يملك كلمة المرور فقط دون الهاتف أو البصمة
            </div>
          </div>
          <span className="text-xs text-red-400 font-bold">هجوم 🦹</span>
        </button>
      </div>
    </div>
  );
}
