"use client";

import React, { useState } from "react";
import { Lock, Unlock, ShieldCheck, Key, RefreshCw, ArrowRight, ArrowLeft, Globe, Server, EyeOff, AlertOctagon } from "lucide-react";

export function TLSHandshakeSimulator() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [simulateEavesdropper, setSimulateEavesdropper] = useState<boolean>(false);

  const steps = [
    {
      step: 1,
      title: "1. مصافحة TLS والتحقق من الشهادة الرقمية",
      description: "المتصفح (العميل) يتصل بخادم الويب. يرسل الخادم شهادته الرقمية مع مفتاحه العام. يتحقق المتصفح من جهة الإصدار المعتمدة (CA) وصلاحية الشهادة ومطابقة اسم النطاق.",
      securityType: "تشفير بالمفتاح العام + شهادة رقمية",
      clientAction: "فحص سلسلة الثقة وتاريخ انتهاء الشهادة",
      serverAction: "إرسال الشهادة الرقمية والمفتاح العام",
      payload: "الشهادة الرقمية: Issued to: moe.gov.eg by DigiCert Global Root CA"
    },
    {
      step: 2,
      title: "2. التفاوض الآمن واشتقاق مفاتيح الجلسة",
      description: "يتبادل الطرفان معلمات التشفير ويشتق كل طرف مفتاح الجلسة المتماثل السري لديه دون إرسال المفتاح المشترك عبر شبكة الإنترنت أبداً.",
      securityType: "تشفير بالمفتاح العام (تبادل المفاتيح الآمن)",
      clientAction: "توليد السر المشترك وتشفيره بمفتاح الخادم العام",
      serverAction: "فك تشفير السر بالمفتاح الخاص للخادم واشتقاق مفتاح الجلسة",
      payload: "مفتاح جلسة متماثل مشترك (Session Key: AES-256-GCM)"
    },
    {
      step: 3,
      title: "3. تبادل البيانات المشفرة بالتشفير المتماثل",
      description: "بعد اكتمال المصافحة، تصبح قناة الاتصال مؤمنة بالكامل. يتم تشفير جميع طلبات صفحات الويب والصور وكلمات المرور باستخدام مفتاح الجلسة المتماثل بسرعة فائقة.",
      securityType: "تشفير متماثل فائق السرعة",
      clientAction: "تشفير طلب HTTP GET / POST بمفتاح الجلسة",
      serverAction: "فك تشفير الطلب وإرسال الاستجابة المشفرة",
      payload: simulateEavesdropper
        ? "بيانات مشفرة غير قابلة للقراءة: 7f8a9e6d4c2b1a0f... (المتنصت يرى شفرة غير مفهومة)"
        : "المحتوى الآمن: { 'studentId': '10982', 'examStatus': 'Pass', 'score': 98 }"
    }
  ];

  const active = steps[currentStep - 1];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">محاكي مصافحة TLS وتشفير اتصالات HTTPS</h3>
            <p className="text-sm text-slate-400">تتبع خطوات تأمين الاتصال بين المتصفح والخادم وكشف المتنصت</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
          تفاعلي 🔐
        </span>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between items-center gap-2 mb-6">
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            onClick={() => setCurrentStep(num)}
            className={`flex-1 py-3 px-2 rounded-xl text-center border transition-all cursor-pointer ${
              currentStep === num
                ? "bg-emerald-950/70 border-emerald-500 text-emerald-300 font-bold ring-2 ring-emerald-500/30"
                : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="text-xs">المرحلة {num}</div>
            <div className="text-xs sm:text-sm font-semibold truncate mt-0.5">
              {num === 1 ? "التحقق من الشهادة" : num === 2 ? "اشتقاق المفاتيح" : "تبادل البيانات المشفرة"}
            </div>
          </button>
        ))}
      </div>

      {/* Interactive Network Diagram */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6">
          {/* Client node */}
          <div className="flex flex-col items-center text-center p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div className="p-3 bg-blue-600/20 text-blue-400 rounded-full mb-2">
              <Globe className="w-8 h-8" />
            </div>
            <div className="font-bold text-sm text-white">المتصفح (العميل)</div>
            <div className="text-xs text-slate-400 mt-1">{active.clientAction}</div>
          </div>

          {/* Connection Channel */}
          <div className="flex flex-col items-center text-center p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 relative">
            <div className="flex items-center gap-2 mb-2">
              {currentStep === 3 ? (
                <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-md flex items-center gap-1 border border-emerald-500/30">
                  <Lock className="w-3.5 h-3.5" /> HTTPS آمن
                </span>
              ) : (
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 text-xs font-mono font-bold rounded-md flex items-center gap-1 border border-amber-500/30">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> مفاوضات TLS
                </span>
              )}
            </div>

            <div className="w-full flex items-center justify-center gap-2 my-2 text-slate-500">
              <ArrowLeft className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div className="h-0.5 flex-1 bg-gradient-to-r from-emerald-500/20 via-emerald-400 to-emerald-500/20"></div>
              <ArrowRight className="w-5 h-5 text-emerald-400 animate-pulse" />
            </div>

            <div className="text-[11px] text-slate-300 font-mono bg-slate-950 p-2 rounded w-full truncate border border-slate-800/80 mt-1">
              {active.payload}
            </div>

            {/* Eavesdropper node */}
            <div className="mt-4 pt-3 border-t border-slate-800 w-full flex flex-col items-center">
              <button
                onClick={() => setSimulateEavesdropper(!simulateEavesdropper)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-all cursor-pointer ${
                  simulateEavesdropper
                    ? "bg-red-950/60 border-red-500 text-red-300"
                    : "bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600"
                }`}
              >
                <EyeOff className="w-3.5 h-3.5" />
                {simulateEavesdropper ? "المتنصت: يرى بيانات مشفرة فقط 🛡️" : "تجربة محاولة التنصت عبر الواي فاي"}
              </button>
            </div>
          </div>

          {/* Server node */}
          <div className="flex flex-col items-center text-center p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div className="p-3 bg-purple-600/20 text-purple-400 rounded-full mb-2">
              <Server className="w-8 h-8" />
            </div>
            <div className="font-bold text-sm text-white">خادم الويب (Server)</div>
            <div className="text-xs text-slate-400 mt-1">{active.serverAction}</div>
          </div>
        </div>
      </div>

      {/* Description & Technical notes */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-sm space-y-2 mb-6">
        <div className="flex items-center gap-2 text-emerald-400 font-bold">
          <ShieldCheck className="w-5 h-5" />
          <span>{active.title}</span>
        </div>
        <p className="text-slate-300 leading-relaxed">{active.description}</p>
        <div className="text-xs text-slate-400 pt-1">
          <strong>التقنية المستخدمة في هذه المرحلة:</strong>{" "}
          <span className="text-emerald-300 font-mono">{active.securityType}</span>
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        <button
          disabled={currentStep === 1}
          onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
        >
          <ArrowRight className="w-4 h-4" /> الخطوة السابقة
        </button>

        <span className="text-xs text-slate-500 font-mono">
          الخطوة {currentStep} من {steps.length}
        </span>

        <button
          disabled={currentStep === steps.length}
          onClick={() => setCurrentStep((prev) => Math.min(steps.length, prev + 1))}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
        >
          الخطوة التالية <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
