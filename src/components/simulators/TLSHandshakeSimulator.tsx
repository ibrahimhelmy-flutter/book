"use client";

import React, { useState, useEffect } from "react";
import {
  Lock,
  Unlock,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Globe,
  Server,
  Eye,
  EyeOff,
  CheckCircle2,
  KeyRound,
  FileCheck,
  Play,
  Pause,
  Sparkles,
} from "lucide-react";

export function TLSHandshakeSimulator() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isPlayingAuto, setIsPlayingAuto] = useState<boolean>(false);
  const [showEavesdropper, setShowEavesdropper] = useState<boolean>(false);

  // Auto-play timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingAuto) {
      timer = setTimeout(() => {
        setCurrentStep((prev) => {
          if (prev >= 3) {
            setIsPlayingAuto(false);
            return 3;
          }
          return prev + 1;
        });
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [isPlayingAuto, currentStep]);

  const steps = [
    {
      step: 1,
      title: "1. إرسال الشهادة الرقمية والتحقق منها",
      badge: "تشفير بالمفتاح العام + جهة CA",
      description:
        "يرسل الخادم شهادته الرقمية ومفتاحه العام. يقوم المتصفح بالتحقق من صحة التوقيع الرقمي الصادر من جهة موثوقة (CA) والتأكد من عدم انتهاء الشهادة.",
      browserState: "يفحص صحة الشهادة وسلسلة الثقة 🔍",
      serverState: "يرسل شهادة SSL/TLS والمفتاح العام 📜",
      transitItem: "شهادة معتمدة + Public Key 📜",
      transitColor: "text-blue-400 bg-blue-950/80 border-blue-500/40",
      direction: "left", // from server to client (in RTL, left is toward client)
      isEncrypted: false,
    },
    {
      step: 2,
      title: "2. تبادل المفاتيح واشتقاق مفتاح الجلسة",
      badge: "توليد مفتاح جلسة متماثل سري",
      description:
        "يولد المتصفح سراً مشتركاً ويشفره بالمفتاح العام للخادم. يفك الخادم تشفيره بمفتاحه الخاص، فيحصل الطرفان على نفس مفتاح الجلسة السري دون إرساله مكشوفاً عبر الإنترنت.",
      browserState: "اشتقاق مفتاح الجلسة السري (AES) 🔑",
      serverState: "فك التشفير واشتقاق نفس المفتاح 🔑",
      transitItem: "سر الجلسة مشفر بالمفتاح العام 🔐",
      transitColor: "text-amber-400 bg-amber-950/80 border-amber-500/40",
      direction: "right", // from client to server
      isEncrypted: true,
    },
    {
      step: 3,
      title: "3. نفق اتصال HTTPS مشفر وفائق السرعة",
      badge: "تشفير متماثل فائق السرعة (AES-256)",
      description:
        "اكتملت المصافحة بنجاح! يتم الآن تشفير جميع صفحات الويب وكلمات المرور والدرجات بمفتاح الجلسة المشترك. أي متصنت على الشبكة سيرى فقط شفرات غير مفهومة.",
      browserState: "إرسال طلبات ويب مشفرة وآمنة 🛡️",
      serverState: "إرسال صفحات ويب وبيانات مشفرة 🛡️",
      transitItem: "بيانات مشفرة (HTTPS Traffic) 🔒",
      transitColor: "text-emerald-400 bg-emerald-950/80 border-emerald-500/40",
      direction: "bidirectional",
      isEncrypted: true,
    },
  ];

  const active = steps[currentStep - 1];

  const resetAll = () => {
    setIsPlayingAuto(false);
    setCurrentStep(1);
    setShowEavesdropper(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">محاكي مصافحة TLS وتأمين اتصالات HTTPS</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              كيف يتحول اتصال المتصفح بالخادم من غير آمن إلى نفق مشفر بالكامل (ص 32 - 33)
            </p>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPlayingAuto(!isPlayingAuto)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              isPlayingAuto
                ? "bg-amber-600 text-white shadow-lg"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg"
            }`}
          >
            {isPlayingAuto ? (
              <>
                <Pause className="w-3.5 h-3.5" /> إيقاف مؤقت
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> تشغيل تلقائي ⚡
              </>
            )}
          </button>
          <button
            onClick={resetAll}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            title="إعادة الضبط"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        {steps.map((st) => (
          <button
            key={st.step}
            onClick={() => {
              setIsPlayingAuto(false);
              setCurrentStep(st.step);
            }}
            className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
              currentStep === st.step
                ? "bg-slate-950 border-emerald-500 ring-2 ring-emerald-500/30 font-bold"
                : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="text-[10px] font-mono text-emerald-400">المرحلة {st.step}</div>
            <div className="text-xs sm:text-sm font-semibold text-white truncate mt-0.5">
              {st.step === 1 ? "1. فحص الشهادة" : st.step === 2 ? "2. اشتقاق المفتاح" : "3. النفق المشفر"}
            </div>
          </button>
        ))}
      </div>

      {/* Animated Visual Handshake Arena */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 mb-6 relative overflow-hidden">
        {/* Background Network Grid Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.02] to-transparent pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_1fr] gap-4 sm:gap-6 items-center relative z-10">
          
          {/* CLIENT: Browser */}
          <div className={`p-4 rounded-2xl border text-center transition-all ${
            currentStep === 3
              ? "bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/20"
              : "bg-slate-900/80 border-slate-800"
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center mb-2 border border-blue-500/30">
              <Globe className="w-6 h-6" />
            </div>
            <div className="font-bold text-sm text-white">المتصفح (العميل)</div>
            <div className="text-[11px] text-slate-400 mt-1 mb-3">Client Browser</div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <div className="text-[10px] text-slate-500 mb-1">الإجراء اللحظي:</div>
              <div className="font-medium text-emerald-300">{active.browserState}</div>
            </div>
          </div>

          {/* TRANSIT CHANNEL: Handshake Flow */}
          <div className="flex flex-col items-center justify-center py-4 px-2">
            
            {/* Status Badge */}
            <div className="mb-3">
              {currentStep === 3 ? (
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg animate-pulse">
                  <Lock className="w-3.5 h-3.5" /> قناة HTTPS مشفرة وآمنة
                </span>
              ) : (
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 animate-spin" /> جاري التفاوض والمصافحة...
                </span>
              )}
            </div>

            {/* Visual Animated Packet Flow */}
            <div className="w-full relative h-14 flex items-center justify-center">
              {/* Tunnel Tube */}
              <div className={`w-full h-3 rounded-full transition-all duration-500 ${
                currentStep === 3
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 shadow-lg shadow-emerald-500/30"
                  : "bg-slate-800 border border-slate-700"
              }`} />

              {/* Animated Floating Packet */}
              <div className={`absolute px-3 py-1 rounded-xl border text-xs font-bold font-mono transition-all duration-700 shadow-xl flex items-center gap-1.5 ${
                active.transitColor
              } animate-bounce`}>
                {active.transitItem}
              </div>
            </div>

            {/* Eavesdropper Sensor Bar */}
            <div className="w-full mt-4 pt-3 border-t border-slate-800/80 text-center">
              <button
                onClick={() => setShowEavesdropper(!showEavesdropper)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer inline-flex items-center gap-1.5 ${
                  showEavesdropper
                    ? "bg-red-950/70 border-red-500 text-red-300 shadow-md"
                    : "bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                {showEavesdropper ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {showEavesdropper ? "إخفاء فحص المتنصت" : "اختبار محاولة التنصت عبر الشبكة 🕵️"}
              </button>

              {showEavesdropper && (
                <div className="mt-2.5 p-2.5 rounded-xl border text-xs animate-fadeIn transition-all text-right ${
                  currentStep === 3
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/40 border-red-500/40 text-red-200'
                }">
                  {currentStep === 3 ? (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        <strong>فشل المتنصت:</strong> البيانات تسري عبر نفق TLS مشفر بمفتاح AES! المتنصت يرى رموزاً مبهمة ولا يستطيع قراءة كلمات المرور.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>
                        <strong>مرحلة تبادل عامة:</strong> الشهادة والمفتاح العام مرئيان للجميع بشكل طبيعي، لكن السر المشترك يتم تشفيره ولا يمكن فضه إلا بمفتاح الخادم الخاص!
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SERVER: Web Server */}
          <div className={`p-4 rounded-2xl border text-center transition-all ${
            currentStep === 3
              ? "bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/20"
              : "bg-slate-900/80 border-slate-800"
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 mx-auto flex items-center justify-center mb-2 border border-purple-500/30">
              <Server className="w-6 h-6" />
            </div>
            <div className="font-bold text-sm text-white">خادم الويب (Server)</div>
            <div className="text-[11px] text-slate-400 mt-1 mb-3">moe.gov.eg</div>

            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300">
              <div className="text-[10px] text-slate-500 mb-1">الإجراء اللحظي:</div>
              <div className="font-medium text-emerald-300">{active.serverState}</div>
            </div>
          </div>

        </div>
      </div>

      {/* Description & Technical Summary */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base text-white">{active.title}</span>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold rounded-md">
              {active.badge}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
            {active.description}
          </p>
        </div>

        {/* Step Navigation buttons */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            disabled={currentStep === 1}
            onClick={() => {
              setIsPlayingAuto(false);
              setCurrentStep((p) => Math.max(1, p - 1));
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            <ArrowRight className="w-4 h-4" /> السابق
          </button>
          <button
            disabled={currentStep === 3}
            onClick={() => {
              setIsPlayingAuto(false);
              setCurrentStep((p) => Math.min(3, p + 1));
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
          >
            التالي <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
