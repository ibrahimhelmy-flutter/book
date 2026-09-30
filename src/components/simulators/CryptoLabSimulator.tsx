"use client";

import React, { useState, useEffect } from "react";
import {
  KeyRound,
  Lock,
  Unlock,
  Send,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  User,
  Server,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export function CryptoLabSimulator() {
  const [mode, setMode] = useState<"symmetric" | "asymmetric">("symmetric");
  const [message, setMessage] = useState("درجات الاختبار سرية 100%");
  
  // Animation step: 0 = idle, 1 = encrypting, 2 = transit (in channel), 3 = decrypted at receiver
  const [animStep, setAnimStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  // Symmetric scenario: simulate leaking the key
  const [leakKey, setLeakKey] = useState<boolean>(false);
  
  // Asymmetric scenario: which key Bob tries to use for decryption
  const [bobKeyChoice, setBobKeyChoice] = useState<"private" | "public">("private");

  // Reset animation when mode changes
  useEffect(() => {
    setAnimStep(0);
    setIsPlaying(false);
  }, [mode]);

  // Handle step-by-step playback
  const runAnimation = () => {
    if (isPlaying) return;
    setIsPlaying(true);
    setAnimStep(1); // Step 1: Encrypting at sender

    setTimeout(() => {
      setAnimStep(2); // Step 2: Traveling across the internet
    }, 1200);

    setTimeout(() => {
      setAnimStep(3); // Step 3: Arrived & decrypting
      setIsPlaying(false);
    }, 2800);
  };

  const resetAll = () => {
    setAnimStep(0);
    setIsPlaying(false);
  };

  // Encrypted representation
  const cipherPreview = "7f8#9x!@q2$k9L#";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">مختبر التشفير: المتناظر وغير المتناظر</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              محاكاة بصرية مبسطة توضح مسار الرسالة والمفتاح وحمايتها من المتنصت (ص 32 - 33)
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setMode("symmetric")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              mode === "symmetric" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            التشفير المتناظر (مفتاح واحد)
          </button>
          <button
            onClick={() => setMode("asymmetric")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              mode === "asymmetric" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
            }`}
          >
            <Lock className="w-4 h-4" />
            التشفير غير المتناظر (مفتاحان)
          </button>
        </div>
      </div>

      {/* Core Idea Banner */}
      <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-4 mb-6 text-xs sm:text-sm text-indigo-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
        <div>
          {mode === "symmetric" ? (
            <span>
              <strong>الفكرة الأساسية (التشفير المتناظر):</strong> يُستخدم <strong>نفس المفتاح السري الواحد</strong> للقفل وللفتح.
              سريع جداً وعملي، لكن عيبه الأكبر هو: <em>كيف نسلم المفتاح للطرف الآخر بأمان دون اعتراضه؟</em>
            </span>
          ) : (
            <span>
              <strong>الفكرة الأساسية (التشفير غير المتناظر):</strong> يُستخدم <strong>زوج من المفاتيح</strong>:
              مفتاح عام (<strong>Public Key</strong>) يغلق به الجميع، ومفتاح خاص (<strong>Private Key</strong>) يحتفظ به المستلم وحده لفك التشفير. لا نرسل المفتاح الخاص أبداً!
            </span>
          )}
        </div>
      </div>

      {/* Message Input & Action Bar */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full sm:flex-1">
          <label className="text-xs text-slate-400 block mb-1.5 font-medium">الرسالة المراد إرسالها بأمان:</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPlaying}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 font-medium"
            placeholder="اكتب رسالة سرية هنا..."
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto self-end">
          <button
            onClick={runAnimation}
            disabled={isPlaying || !message.trim()}
            className="flex-1 sm:flex-initial px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
          >
            <Send className="w-4 h-4" />
            {animStep === 0 ? "بدء الإرسال والمحاكاة 🚀" : "إعادة الإرسال 🚀"}
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

      {/* Visual Animation Stage */}
      <div className="bg-slate-950 border border-slate-800/80 rounded-3xl p-5 sm:p-6 mb-6 relative overflow-hidden">
        {/* Step Progress Pills */}
        <div className="flex justify-between items-center gap-2 mb-6">
          <div className={`flex-1 py-1.5 px-2 rounded-xl text-center border text-xs transition-all ${
            animStep >= 1 ? "bg-indigo-950/60 border-indigo-500 text-indigo-300 font-bold" : "bg-slate-900/50 border-slate-800 text-slate-500"
          }`}>
            1. التشفير عند أليس 🔒
          </div>
          <ArrowLeft className="w-4 h-4 text-slate-600 shrink-0" />
          <div className={`flex-1 py-1.5 px-2 rounded-xl text-center border text-xs transition-all ${
            animStep >= 2 ? "bg-amber-950/60 border-amber-500 text-amber-300 font-bold" : "bg-slate-900/50 border-slate-800 text-slate-500"
          }`}>
            2. العبور عبر الإنترنت 🌐
          </div>
          <ArrowLeft className="w-4 h-4 text-slate-600 shrink-0" />
          <div className={`flex-1 py-1.5 px-2 rounded-xl text-center border text-xs transition-all ${
            animStep >= 3 ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold" : "bg-slate-900/50 border-slate-800 text-slate-500"
          }`}>
            3. فك التشفير عند بوب 🔓
          </div>
        </div>

        {/* Visual Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center relative">
          
          {/* SENDER: Alice */}
          <div className={`p-4 rounded-2xl border text-center transition-all ${
            animStep === 1
              ? "bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/30 scale-[1.02]"
              : "bg-slate-900/70 border-slate-800"
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 mx-auto flex items-center justify-center mb-2 border border-indigo-500/30">
              <User className="w-6 h-6" />
            </div>
            <div className="font-bold text-sm text-white">المرسل (أليس)</div>
            <div className="text-[11px] text-slate-400 mb-3">
              {mode === "symmetric" ? "تستخدم المفتاح السري المشترك 🔑" : "تستخدم مفتاح بوب العام 🔓"}
            </div>

            {/* Visual Box at Alice */}
            <div className={`p-3 rounded-xl border text-xs transition-all ${
              animStep >= 1 ? "bg-indigo-950/80 border-indigo-500/50" : "bg-slate-950 border-slate-800"
            }`}>
              <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
                <span>حالة الرسالة:</span>
                {animStep >= 1 ? (
                  <span className="text-indigo-400 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> مشفرة
                  </span>
                ) : (
                  <span className="text-slate-400">نص عادي</span>
                )}
              </div>
              <div className="font-mono text-xs truncate py-1 text-slate-200">
                {animStep >= 1 ? cipherPreview : message}
              </div>
            </div>
          </div>

          {/* TRANSIT: Internet & Eavesdropper */}
          <div className={`p-4 rounded-2xl border text-center relative transition-all ${
            animStep === 2
              ? "bg-amber-950/30 border-amber-500 ring-2 ring-amber-500/30 scale-[1.02]"
              : "bg-slate-900/50 border-slate-800"
          }`}>
            {/* Animated Moving Packet Icon */}
            <div className="relative h-16 flex items-center justify-center">
              <div className="w-full h-1 bg-gradient-to-r from-indigo-500 via-amber-500 to-emerald-500 rounded-full opacity-40 absolute" />
              
              {/* Traveling Packet */}
              <div className={`px-3 py-1.5 rounded-xl border font-mono text-xs font-bold transition-all duration-700 shadow-xl flex items-center gap-1.5 z-10 ${
                animStep === 2
                  ? "bg-amber-500 text-slate-950 border-amber-300 animate-pulse scale-110"
                  : animStep > 2
                  ? "bg-emerald-950 text-emerald-400 border-emerald-500/50"
                  : "bg-slate-800 text-slate-400 border-slate-700"
              }`}>
                <Lock className="w-3.5 h-3.5" />
                <span>{animStep >= 1 ? cipherPreview : "الرسالة"}</span>
              </div>
            </div>

            {/* Eavesdropper Monitor */}
            <div className="mt-2 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-bold mb-1">
                {mode === "symmetric" && leakKey ? (
                  <Eye className="w-4 h-4 text-red-400" />
                ) : (
                  <EyeOff className="w-4 h-4 text-amber-400" />
                )}
                <span>عين المتنصت على شبكة الإنترنت:</span>
              </div>

              {mode === "symmetric" && leakKey ? (
                <div className="p-2 bg-red-950/60 border border-red-500/40 rounded-xl text-[11px] text-red-300 font-bold animate-shake">
                  🚨 تسرب المفتاح! المتنصت استولى على المفتاح وقرأ: &quot;{message}&quot;
                </div>
              ) : (
                <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono">
                  {animStep >= 2 ? (
                    <span className="text-emerald-400 font-bold">
                      🔒 شفرة غامضة وغير مفهومة للمتنصت
                    </span>
                  ) : (
                    <span>قناة الاتصال بانتظار الإرسال...</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RECEIVER: Bob */}
          <div className={`p-4 rounded-2xl border text-center transition-all ${
            animStep === 3
              ? "bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.02]"
              : "bg-slate-900/70 border-slate-800"
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 text-emerald-400 mx-auto flex items-center justify-center mb-2 border border-emerald-500/30">
              <Server className="w-6 h-6" />
            </div>
            <div className="font-bold text-sm text-white">المستقبل (بوب)</div>
            <div className="text-[11px] text-slate-400 mb-3">
              {mode === "symmetric" ? "يستخدم نفس المفتاح المشترك 🔑" : "يستخدم مفتاحه الخاص السري 🗝️"}
            </div>

            {/* Visual Decryption Outcome */}
            <div className={`p-3 rounded-xl border text-xs transition-all ${
              animStep >= 3 ? "bg-emerald-950/80 border-emerald-500/50" : "bg-slate-950 border-slate-800"
            }`}>
              <div className="text-[10px] text-slate-400 mb-1 flex items-center justify-between">
                <span>النتيجة عند بوب:</span>
                {animStep >= 3 ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> تم الفك
                  </span>
                ) : (
                  <span className="text-slate-500">في الانتظار...</span>
                )}
              </div>
              <div className="font-bold text-xs truncate py-1 text-emerald-300">
                {animStep >= 3 ? message : "—"}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Interactive Scenario Controls (Helps understand the challenge) */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
        {mode === "symmetric" ? (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white mb-0.5">معضلة تبادل المفاتيح (Key Exchange Problem):</div>
              <p className="text-[11px] text-slate-400">
                إذا أرسلنا المفتاح السري ذاته عبر الإنترنت لكي يفتح به بوب، قد يعترضه المتنصت!
              </p>
            </div>
            <button
              onClick={() => setLeakKey(!leakKey)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                leakKey
                  ? "bg-red-950/70 border-red-500 text-red-300"
                  : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600"
              }`}
            >
              {leakKey ? "⚠️ المفتاح متسرب (انقر للإلغاء)" : "محاكاة تسريب المفتاح للمتنصت 🕵️"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-white mb-0.5">حل الأمان بالمفتاحين (Public / Private Key):</div>
              <p className="text-[11px] text-slate-400">
                المفتاح العام (أزرق) يوزع على الجميع للقفل فقط. المفتاح الخاص (ذهبي) لا يغادر جهاز بوب أبداً!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">مفتاح بوب:</span>
              <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-mono font-bold">
                Private Key 🗝️ (سري)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
