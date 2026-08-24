"use client";

import React, { useState } from "react";
import { BarChart3, TrendingUp, Play, CheckCircle, RefreshCw, Layers, ArrowUpRight, Award } from "lucide-react";

export function PDCAAndABTestingLab() {
  const [pdcaStep, setPdcaStep] = useState<"plan" | "do" | "check" | "act">("plan");
  const [variantBColor, setVariantBColor] = useState<string>("emerald");
  const [variantBText, setVariantBText] = useState<string>("سجل الآن مجاناً 🚀");
  const [isRunningSim, setIsRunningSim] = useState<boolean>(false);
  const [results, setResults] = useState<{
    visitorsA: number;
    conversionsA: number;
    bounceRateA: number;
    visitorsB: number;
    conversionsB: number;
    bounceRateB: number;
  } | null>(null);

  const runExperiment = () => {
    setIsRunningSim(true);
    setPdcaStep("do");
    setTimeout(() => {
      // simulate statistically realistic A/B outcomes
      const visitorsA = 1000;
      const conversionsA = 120; // 12.0% CVR
      const bounceRateA = 58.4;

      const visitorsB = 1000;
      // green/vibrant button improves CVR
      const conversionsB = variantBColor === "emerald" ? 185 : 145; // 18.5% or 14.5% CVR
      const bounceRateB = variantBColor === "emerald" ? 42.1 : 51.0;

      setResults({
        visitorsA,
        conversionsA,
        bounceRateA,
        visitorsB,
        conversionsB,
        bounceRateB
      });
      setIsRunningSim(false);
      setPdcaStep("check");
    }, 1000);
  };

  const getCVR = (conv: number, vis: number) => ((conv / vis) * 100).toFixed(1);

  const resetAll = () => {
    setPdcaStep("plan");
    setResults(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">مختبر اختبارات A/B ودورة التحسين المستمر PDCA</h3>
            <p className="text-sm text-slate-400">عزل المتغير الواحد وحساب معدل التحويل (CVR) ومعدل الارتداد بالبيانات</p>
          </div>
        </div>

        <button
          onClick={resetAll}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className="w-4 h-4" /> دورة جديدة
        </button>
      </div>

      {/* PDCA Progress Ribbon */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {[
          { id: "plan", num: "1", title: "خّطط (Plan)", desc: "فرضية عزل المتغير" },
          { id: "do", num: "2", title: "نفّذ (Do)", desc: "إطلاق اختبار A/B" },
          { id: "check", num: "3", title: "تحقّق (Check)", desc: "قياس CVR والارتداد" },
          { id: "act", num: "4", title: "تصرّف (Act)", desc: "اعتماد النسخة الفائزة" }
        ].map((s) => (
          <div
            key={s.id}
            className={`p-3 rounded-xl border text-center transition-all ${
              pdcaStep === s.id
                ? "bg-indigo-950/70 border-indigo-500 text-indigo-300 font-bold ring-2 ring-indigo-500/30"
                : "bg-slate-950/40 border-slate-800 text-slate-500"
            }`}
          >
            <div className="text-xs font-mono">{s.num}</div>
            <div className="text-xs sm:text-sm font-bold text-white mt-0.5">{s.title}</div>
            <div className="text-[10px] text-slate-400 hidden sm:block mt-0.5">{s.desc}</div>
          </div>
        ))}
      </div>

      {/* A/B Test Setup */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Variant A */}
        <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-md">
                النسخة A (النسخة الأصلية - Control)
              </span>
              <span className="text-xs text-slate-500 font-mono">50% من الزوار</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              الزر القديم الرمادي التقليدي مع عبارة "إرسال الطلب".
            </p>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
            <button className="px-5 py-2.5 bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-not-allowed">
              إرسال الطلب
            </button>
          </div>
        </div>

        {/* Variant B */}
        <div className="bg-slate-950 p-5 rounded-xl border border-indigo-500/40 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold rounded-md">
                النسخة B (المتغير المعزول - Hypothesis)
              </span>
              <span className="text-xs text-indigo-400 font-mono">50% من الزوار</span>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">تغيير لون الزر فقط (عزل المتغير):</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setVariantBColor("emerald")}
                    className={`px-3 py-1 text-xs rounded-lg border cursor-pointer ${
                      variantBColor === "emerald" ? "bg-emerald-600 border-emerald-400 text-white font-bold" : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    أخضر ساطع 🟢
                  </button>
                  <button
                    onClick={() => setVariantBColor("blue")}
                    className={`px-3 py-1 text-xs rounded-lg border cursor-pointer ${
                      variantBColor === "blue" ? "bg-blue-600 border-blue-400 text-white font-bold" : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                  >
                    أزرق داكن 🔵
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
            <button
              className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white shadow-lg cursor-pointer ${
                variantBColor === "emerald" ? "bg-emerald-500 shadow-emerald-500/25" : "bg-blue-600 shadow-blue-500/25"
              }`}
            >
              {variantBText}
            </button>
          </div>
        </div>
      </div>

      {/* Action Button to launch test */}
      {!results && (
        <div className="text-center mb-6">
          <button
            disabled={isRunningSim}
            onClick={runExperiment}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl shadow-xl transition-all cursor-pointer inline-flex items-center gap-2"
          >
            {isRunningSim ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>بدء إطلاق اختبار A/B مع 2,000 زائر محاكى 🚀</span>
          </button>
        </div>
      )}

      {/* Live Measurement Results (Check Phase) */}
      {results && (
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 mb-6 animate-fadeIn">
          <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
            <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> نتائج الاختبار والمقاييس الإحصائية (Check Phase):
            </span>
            <span className="text-xs font-mono text-slate-400">إجمالي العينة: 2,000 زائر</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* Stats A */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
              <div className="text-xs text-slate-400 font-bold mb-2">نتائج النسخة A (القديمة):</div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-slate-950 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">معدل التحويل (CVR)</span>
                  <span className="font-mono font-bold text-sm text-slate-200">
                    {getCVR(results.conversionsA, results.visitorsA)}%
                  </span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">معدل الارتداد</span>
                  <span className="font-mono font-bold text-sm text-slate-400">{results.bounceRateA}%</span>
                </div>
              </div>
            </div>

            {/* Stats B */}
            <div className="bg-indigo-950/40 p-4 rounded-xl border border-indigo-500/40">
              <div className="text-xs text-indigo-300 font-bold mb-2 flex items-center justify-between">
                <span>نتائج النسخة B (المحسنة):</span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                  <ArrowUpRight className="w-3.5 h-3.5" /> تفوق إحصائي
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-slate-950 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">معدل التحويل (CVR)</span>
                  <span className="font-mono font-bold text-sm text-emerald-400">
                    {getCVR(results.conversionsB, results.visitorsB)}%
                  </span>
                </div>
                <div className="p-2 bg-slate-950 rounded-lg">
                  <span className="text-[10px] text-slate-500 block">معدل الارتداد</span>
                  <span className="font-mono font-bold text-sm text-emerald-300">{results.bounceRateB}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Act phase decision */}
          <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-xl text-xs space-y-2 text-emerald-200">
            <div className="flex items-center gap-1.5 font-bold text-emerald-400">
              <Award className="w-4 h-4" />
              <span>خطوة التصرف (Act Phase): اعتماد النسخة B لجميع الزوار بنسبة 100%</span>
            </div>
            <p className="leading-relaxed">
              أثبتت البيانات الإحصائية أن زر الدعوة للإجراء (CTA) الأخضر ذي التباين العالي رفع معدل التحويل من 12.0% إلى{" "}
              {getCVR(results.conversionsB, results.visitorsB)}% وخفض معدل الارتداد. وبناءً على ذلك تم اعتماد النسخة B
              وإغلاق دورة PDCA الحالية لبدء دورة جديدة لتحسين سرعة الموقع.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
