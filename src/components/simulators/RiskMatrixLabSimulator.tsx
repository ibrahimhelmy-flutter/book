"use client";

import React, { useState } from "react";
import { BarChart3, AlertOctagon, Shield, RotateCcw, CheckCircle, ArrowRight, HelpCircle, Layers } from "lucide-react";

interface Scenario {
  id: string;
  title: string;
  initialImpact: number;
  initialLikelihood: number;
  context: string;
  recommendedStrategy: "mitigation" | "avoidance" | "transferral" | "acceptance";
  strategyAction: string;
  newImpact: number;
  newLikelihood: number;
}

const SCENARIOS: Scenario[] = [
  {
    id: "s1",
    title: "هجوم برمجية فدية يشفر خادم قاعدة بيانات الامتحانات",
    initialImpact: 3,
    initialLikelihood: 3,
    context: "تأثير فادح على سير الامتحانات وتوقف الخدمات، واحتمالية حدوث مرتفعة بسبب ثغرات البريد والتصيد.",
    recommendedStrategy: "mitigation",
    strategyAction: "تطبيق نسخ احتياطي يومي معزول (Air-gapped) وتحديث برمجيات الأمان.",
    newImpact: 1,
    newLikelihood: 1
  },
  {
    id: "s2",
    title: "انقطاع التيار الكهربائي عن معمل الحاسب بالمدرسة",
    initialImpact: 2,
    initialLikelihood: 2,
    context: "تأثير متوسط يؤخر الحصة، واحتمالية حدوث متوسطة في فترات الصيف.",
    recommendedStrategy: "mitigation",
    strategyAction: "تركيب أجهزة تزويد طاقة غير منقطعة (UPS) لخوادم وأجهزة المعمل الرئيسية.",
    newImpact: 1,
    newLikelihood: 1
  },
  {
    id: "s3",
    title: "تسريب أسئلة الامتحانات عبر استخدام تطبيقات محادثة عامة غير مشفرة",
    initialImpact: 3,
    initialLikelihood: 2,
    context: "تأثير جسيم جداً يلغي الامتحانات ويهدر جهود الطلاب، واحتمالية حدوث متوسطة عند غياب الضوابط.",
    recommendedStrategy: "avoidance",
    strategyAction: "تجنب الخطر تماماً: حظر تداول أي مستندات امتحانية عبر تطبيقات الطرف الثالث وإلزام المعلمين بالبوابة الوزارية المعزولة.",
    newImpact: 1,
    newLikelihood: 1
  },
  {
    id: "s4",
    title: "خسائر مالية ضخمة ناتجة عن هجمات الحرمان من الخدمة (DDoS)",
    initialImpact: 3,
    initialLikelihood: 2,
    context: "تأثير مالي كبير وسمعة متضررة إذا سقطت البوابة خلال فترة التقديم.",
    recommendedStrategy: "transferral",
    strategyAction: "نقل الخطر: التعاقد مع شركة تأمين سيبراني واستخدام خدمات حماية سحابية احترافية تتكفل بالتعويض.",
    newImpact: 1,
    newLikelihood: 1
  },
  {
    id: "s5",
    title: "تعطل فأرة أو لوحة مفاتيح أحد أجهزة معمل الطلاب",
    initialImpact: 1,
    initialLikelihood: 2,
    context: "تأثير ضئيل جداً وتكلفة إصلاح منخفضة لا تبرر أي استثمار تأميني.",
    recommendedStrategy: "acceptance",
    strategyAction: "قبول المخاطرة: الاحتفاظ بقطع غيار بديلة في المستودع واستبدالها عند الحاجة دون تدابير باهظة.",
    newImpact: 1,
    newLikelihood: 2
  }
];

export function RiskMatrixLabSimulator() {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>("s1");
  const [impact, setImpact] = useState<number>(3);
  const [likelihood, setLikelihood] = useState<number>(3);
  const [appliedStrategy, setAppliedStrategy] = useState<string | null>(null);

  const activeScenario = SCENARIOS.find((s) => s.id === selectedScenarioId)!;

  const currentScore = impact * likelihood;

  const getRiskDetails = (score: number) => {
    if (score >= 6) {
      return {
        level: "خطر جسيم (مرتفع)",
        color: "text-red-400 bg-red-950/40 border-red-500/40",
        action: "أولوية معالجة فورية وعاجلة — لا يجوز بدء النشاط قبل خفض درجة الخطر."
      };
    }
    if (score >= 3) {
      return {
        level: "خطر متوسط",
        color: "text-amber-400 bg-amber-950/40 border-amber-500/40",
        action: "معالجة مجدولة مع خطة عمل واضحة وتعيين مسؤول للمراقبة."
      };
    }
    return {
      level: "خطر منخفض",
      color: "text-emerald-400 bg-emerald-950/40 border-emerald-500/40",
      action: "قبول المخاطرة أو مراقبة دورية روتينية بإجراءات عادية."
    };
  };

  const riskDetails = getRiskDetails(currentScore);

  const applyScenarioPreset = (sc: Scenario) => {
    setSelectedScenarioId(sc.id);
    setImpact(sc.initialImpact);
    setLikelihood(sc.initialLikelihood);
    setAppliedStrategy(null);
  };

  const applyMitigation = () => {
    setImpact(activeScenario.newImpact);
    setLikelihood(activeScenario.newLikelihood);
    setAppliedStrategy(activeScenario.recommendedStrategy);
  };

  const resetAll = () => {
    applyScenarioPreset(activeScenario);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-600/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">حاسبة ومصفوفة تقييم المخاطر 3×3 واستراتيجيات المعالجة</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              تطبيق معادلة الخطر المقررة (التأثير × الاحتمالية) واستراتيجيات المعالجة الأربع (ص 47)
            </p>
          </div>
        </div>

        <button
          onClick={resetAll}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" /> إعادة الحساب
        </button>
      </div>

      {/* Formula Banner */}
      <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-4 text-xs sm:text-sm text-amber-200 leading-relaxed flex items-start gap-3 mb-6">
        <span className="p-1 bg-amber-500/20 rounded text-amber-300 font-bold shrink-0">المعادلة الوزارية (ص 47):</span>
        <div>
          <strong>درجة الخطر (Risk Score) = التأثير (Impact) × الاحتمالية (Likelihood)</strong>.
          تتراوح درجات الخطر من 1 إلى 9 عبر مصفوفة 3×3، وتصنف المخاطر إلى (منخفضة 1-2)، (متوسطة 3-4)، و(جسيمة 6-9) وتتطلب استراتيجيات معالجة محددة (التخفيف، التجنب، النقل، أو القبول).
        </div>
      </div>

      {/* Scenario Selector */}
      <div className="mb-6">
        <h4 className="text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider font-mono">
          اختر سيناريو خطر لتجربته:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => applyScenarioPreset(sc)}
              className={`p-3 rounded-xl border text-right text-xs transition-all cursor-pointer ${
                selectedScenarioId === sc.id
                  ? "bg-amber-950/50 border-amber-500 text-amber-200 font-bold ring-2 ring-amber-500/20"
                  : "bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="truncate font-semibold">{sc.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Grid & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Sliders & Controls */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>ضبط معلمات الخطر:</span>
            </h4>

            {/* Impact Slider */}
            <div className="mb-5">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-300 font-bold">1. مستوى التأثير (Impact):</span>
                <span className="font-mono font-bold text-amber-400">
                  {impact === 3 ? "3 (مرتفع / جسيم)" : impact === 2 ? "2 (متوسط)" : "1 (منخفض)"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={impact}
                onChange={(e) => { setImpact(Number(e.target.value)); setAppliedStrategy(null); }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>1 (منخفض)</span>
                <span>2 (متوسط)</span>
                <span>3 (مرتفع)</span>
              </div>
            </div>

            {/* Likelihood Slider */}
            <div className="mb-5">
              <div className="flex justify-between items-center text-xs mb-2">
                <span className="text-slate-300 font-bold">2. احتمالية الحدوث (Likelihood):</span>
                <span className="font-mono font-bold text-amber-400">
                  {likelihood === 3 ? "3 (مرتفع)" : likelihood === 2 ? "2 (متوسط)" : "1 (منخفض)"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={likelihood}
                onChange={(e) => { setLikelihood(Number(e.target.value)); setAppliedStrategy(null); }}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>1 (منخفض)</span>
                <span>2 (متوسط)</span>
                <span>3 (مرتفع)</span>
              </div>
            </div>

            {/* Calculation Card */}
            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-1">النتيجة الحسابية:</span>
              <div className="text-2xl font-black font-mono text-white">
                {impact} × {likelihood} = <span className="text-amber-400">{currentScore}</span>
              </div>
              <div className={`mt-2 py-1 px-3 rounded-full text-xs font-bold border inline-block ${riskDetails.color}`}>
                {riskDetails.level}
              </div>
            </div>
          </div>

          {/* Strategy action trigger */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              onClick={applyMitigation}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              <span>تطبيق استراتيجية المعالجة ({activeScenario.recommendedStrategy})</span>
            </button>
          </div>
        </div>

        {/* 3x3 Risk Matrix Board */}
        <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-200">مصفوفة تقييم المخاطر 3×3 (جدول 7 ص 47):</h4>
            <span className="text-[11px] text-slate-400">انقر على أي خلية لتحديدها مباشرة</span>
          </div>

          {/* Matrix Visual Table */}
          <div className="relative">
            <div className="text-center text-xs font-bold text-slate-400 mb-2 font-mono">
              الاحتمالية (Likelihood) ➔
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {/* Header row */}
              <div className="p-2 text-slate-500 font-mono font-bold text-[11px] flex items-center justify-center">
                التأثير ↓
              </div>
              <div className="p-2 bg-slate-900/60 rounded-lg text-slate-300 font-mono font-bold">1 (منخفض)</div>
              <div className="p-2 bg-slate-900/60 rounded-lg text-slate-300 font-mono font-bold">2 (متوسط)</div>
              <div className="p-2 bg-slate-900/60 rounded-lg text-slate-300 font-mono font-bold">3 (مرتفع)</div>

              {/* Row 3 (Impact = 3) */}
              <div className="p-2 bg-slate-900/60 rounded-lg text-slate-300 font-mono font-bold flex items-center justify-center">
                3 (مرتفع)
              </div>
              {/* (3, 1) = 3 */}
              <button
                onClick={() => { setImpact(3); setLikelihood(1); setAppliedStrategy(null); }}
                className={`p-4 rounded-xl border font-mono font-bold text-sm transition-all cursor-pointer ${
                  impact === 3 && likelihood === 1
                    ? "ring-4 ring-white bg-amber-600 text-white font-black scale-105"
                    : "bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60"
                }`}
              >
                3
              </button>
              {/* (3, 2) = 6 */}
              <button
                onClick={() => { setImpact(3); setLikelihood(2); setAppliedStrategy(null); }}
                className={`p-4 rounded-xl border font-mono font-bold text-sm transition-all cursor-pointer ${
                  impact === 3 && likelihood === 2
                    ? "ring-4 ring-white bg-red-600 text-white font-black scale-105"
                    : "bg-red-950/70 border-red-500/50 text-red-300 hover:bg-red-900/70"
                }`}
              >
                6
              </button>
              {/* (3, 3) = 9 */}
              <button
                onClick={() => { setImpact(3); setLikelihood(3); setAppliedStrategy(null); }}
                className={`p-4 rounded-xl border font-mono font-bold text-sm transition-all cursor-pointer ${
                  impact === 3 && likelihood === 3
                    ? "ring-4 ring-white bg-red-600 text-white font-black scale-105"
                    : "bg-red-950/80 border-red-500/60 text-red-200 hover:bg-red-900/80"
                }`}
              >
                9 🚨
              </button>

              {/* Row 2 (Impact = 2) */}
              <div className="p-2 bg-slate-900/60 rounded-lg text-slate-300 font-mono font-bold flex items-center justify-center">
                2 (متوسط)
              </div>
              {/* (2, 1) = 2 */}
              <button
                onClick={() => { setImpact(2); setLikelihood(1); setAppliedStrategy(null); }}
                className={`p-4 rounded-xl border font-mono font-bold text-sm transition-all cursor-pointer ${
                  impact === 2 && likelihood === 1
                    ? "ring-4 ring-white bg-emerald-600 text-white font-black scale-105"
                    : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
                }`}
              >
                2
              </button>
              {/* (2, 2) = 4 */}
              <button
                onClick={() => { setImpact(2); setLikelihood(2); setAppliedStrategy(null); }}
                className={`p-4 rounded-xl border font-mono font-bold text-sm transition-all cursor-pointer ${
                  impact === 2 && likelihood === 2
                    ? "ring-4 ring-white bg-amber-600 text-white font-black scale-105"
                    : "bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60"
                }`}
              >
                4
              </button>
              {/* (2, 3) = 6 */}
              <button
                onClick={() => { setImpact(2); setLikelihood(3); setAppliedStrategy(null); }}
                className={`p-4 rounded-xl border font-mono font-bold text-sm transition-all cursor-pointer ${
                  impact === 2 && likelihood === 3
                    ? "ring-4 ring-white bg-red-600 text-white font-black scale-105"
                    : "bg-red-950/70 border-red-500/50 text-red-300 hover:bg-red-900/70"
                }`}
              >
                6
              </button>

              {/* Row 1 (Impact = 1) */}
              <div className="p-2 bg-slate-900/60 rounded-lg text-slate-300 font-mono font-bold flex items-center justify-center">
                1 (منخفض)
              </div>
              {/* (1, 1) = 1 */}
              <button
                onClick={() => { setImpact(1); setLikelihood(1); setAppliedStrategy(null); }}
                className={`p-4 rounded-xl border font-mono font-bold text-sm transition-all cursor-pointer ${
                  impact === 1 && likelihood === 1
                    ? "ring-4 ring-white bg-emerald-600 text-white font-black scale-105"
                    : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
                }`}
              >
                1
              </button>
              {/* (1, 2) = 2 */}
              <button
                onClick={() => { setImpact(1); setLikelihood(2); setAppliedStrategy(null); }}
                className={`p-4 rounded-xl border font-mono font-bold text-sm transition-all cursor-pointer ${
                  impact === 1 && likelihood === 2
                    ? "ring-4 ring-white bg-emerald-600 text-white font-black scale-105"
                    : "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60"
                }`}
              >
                2
              </button>
              {/* (1, 3) = 3 */}
              <button
                onClick={() => { setImpact(1); setLikelihood(3); setAppliedStrategy(null); }}
                className={`p-4 rounded-xl border font-mono font-bold text-sm transition-all cursor-pointer ${
                  impact === 1 && likelihood === 3
                    ? "ring-4 ring-white bg-amber-600 text-white font-black scale-105"
                    : "bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60"
                }`}
              >
                3
              </button>
            </div>
          </div>

          {/* Applied Strategy Feedback */}
          {appliedStrategy && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-200 animate-fadeIn">
              <div className="flex items-center gap-2 font-bold mb-1 text-emerald-300">
                <CheckCircle className="w-4 h-4" />
                <span>تم تطبيق الاستراتيجية بنجاح: {activeScenario.strategyAction}</span>
              </div>
              <p className="text-slate-300 mt-1 leading-relaxed">
                انخفضت درجة الخطر من ({activeScenario.initialImpact * activeScenario.initialLikelihood}) إلى ({currentScore})! أصبح الخطر تحت السيطرة ضمن النطاق المقبول.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* The 4 Strategies Educational Footer */}
      <div className="pt-6 border-t border-slate-800">
        <h4 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider font-mono">
          استراتيجيات معالجة المخاطر الأربع المقررة في المنهج (ص 47):
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-bold text-emerald-400 block mb-1">1. التخفيف (Mitigation)</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              اتخاذ إجراءات وضوابط تقنية لتقليل التأثير أو الاحتمالية (مثل النسخ الاحتياطي وجدران الحماية).
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-bold text-blue-400 block mb-1">2. التجنب (Avoidance)</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              إيقاف النشاط أو الخدمة عالية المخاطر تماماً للقضاء على الخطر من جذوره.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-bold text-purple-400 block mb-1">3. النقل (Transferral)</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              تحويل عبء الخسارة المالية إلى طرف ثالث مثل شركات التأمين السيبراني أو الخدمات السحابية.
            </p>
          </div>
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">4. القبول (Acceptance)</span>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              التعايش مع المخاطر المنخفضة عندما تكون تكلفة المعالجة أكبر من قيمة الخسارة المحتملة.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
