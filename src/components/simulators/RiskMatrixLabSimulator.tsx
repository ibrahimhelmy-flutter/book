"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Shield,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface Scenario {
  id: string;
  title: string;
  initialImpact: number;
  initialLikelihood: number;
  strategy: "mitigation" | "avoidance" | "transferral" | "acceptance";
  strategyName: string;
  strategyAction: string;
  reducedImpact: number;
  reducedLikelihood: number;
}

const SCENARIOS: Scenario[] = [
  {
    id: "s1",
    title: "1. هجوم فدية يشفر قاعدة درجات الطلاب",
    initialImpact: 3,
    initialLikelihood: 3,
    strategy: "mitigation",
    strategyName: "التخفيف (Mitigation)",
    strategyAction: "تطبيق نسخ احتياطي يومي معزول (Air-gapped) وتحديث برامج الأمان لتقليص الأثر والاحتمالية.",
    reducedImpact: 1,
    reducedLikelihood: 1,
  },
  {
    id: "s2",
    title: "2. تسريب امتحانات عبر تطبيقات محادثة غير رسمية",
    initialImpact: 3,
    initialLikelihood: 2,
    strategy: "avoidance",
    strategyName: "التجنب (Avoidance)",
    strategyAction: "إلغاء الخطر تماماً بحظر تداول وثائق الامتحانات عبر التطبيقات وإلزام القنوات الرسمية المعزولة.",
    reducedImpact: 1,
    reducedLikelihood: 1,
  },
  {
    id: "s3",
    title: "3. خسائر مالية ضخمة جراء هجمات حرمان الخدمة (DDoS)",
    initialImpact: 3,
    initialLikelihood: 2,
    strategy: "transferral",
    strategyName: "النقل (Transferral)",
    strategyAction: "شراء بوليصة تأمين سيبراني والاستعانة بشركة حماية سحابية تتحمل تكاليف التعويض المالي.",
    reducedImpact: 1,
    reducedLikelihood: 1,
  },
  {
    id: "s4",
    title: "4. تعطل فأرة أو لوحة مفاتيح بمعمل الطلاب",
    initialImpact: 1,
    initialLikelihood: 2,
    strategy: "acceptance",
    strategyName: "القبول (Acceptance)",
    strategyAction: "قبول الخطر والاحتفاظ بقطع غيار بديلة دون إنفاق مبالغ باهظة في حلول حماية معقدة.",
    reducedImpact: 1,
    reducedLikelihood: 2,
  },
];

export function RiskMatrixLabSimulator() {
  const [impact, setImpact] = useState<number>(3); // 1, 2, 3
  const [likelihood, setLikelihood] = useState<number>(3); // 1, 2, 3
  const [activeScenarioId, setActiveScenarioId] = useState<string>("s1");
  const [isStrategyApplied, setIsStrategyApplied] = useState<boolean>(false);

  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId)!;
  const score = impact * likelihood;

  const selectScenario = (id: string) => {
    const sc = SCENARIOS.find((s) => s.id === id)!;
    setActiveScenarioId(id);
    setImpact(sc.initialImpact);
    setLikelihood(sc.initialLikelihood);
    setIsStrategyApplied(false);
  };

  const applyTreatment = () => {
    setIsStrategyApplied(true);
    setImpact(activeScenario.reducedImpact);
    setLikelihood(activeScenario.reducedLikelihood);
  };

  const resetAll = () => {
    setIsStrategyApplied(false);
    setImpact(activeScenario.initialImpact);
    setLikelihood(activeScenario.initialLikelihood);
  };

  const getRiskCategory = (val: number) => {
    if (val >= 6) {
      return {
        level: "خطر جسيم (مرتفع)",
        color: "text-red-400 bg-red-950/60 border-red-500/50",
        pill: "خطر جسيم 🔴",
      };
    }
    if (val >= 3) {
      return {
        level: "خطر متوسط",
        color: "text-amber-400 bg-amber-950/60 border-amber-500/50",
        pill: "خطر متوسط 🟡",
      };
    }
    return {
      level: "خطر منخفض",
      color: "text-emerald-400 bg-emerald-950/60 border-emerald-500/50",
      pill: "خطر منخفض 🟢",
    };
  };

  const riskCat = getRiskCategory(score);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-600/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">
              حاسبة ومصفوفة تقييم المخاطر 3×3 واستراتيجيات المعالجة
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              تطبيق معادلة الخطر (الأثر × الاحتمالية) واستراتيجيات المعالجة الأربع (ص 47)
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
      <div className="bg-amber-950/30 border border-amber-500/20 rounded-2xl p-4 mb-6 text-xs sm:text-sm text-amber-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong>معادلة المخاطر (ص 47):</strong>{" "}
          <span className="font-mono font-bold text-amber-300">درجة الخطر = الأثر (Impact) × الاحتمالية (Likelihood)</span>.
          تتراوح النتيجة بين 1 و 9. استراتيجيات المعالجة الأربع هي:{" "}
          <strong>1. التخفيف</strong>، <strong>2. التجنب</strong>، <strong>3. النقل</strong>، <strong>4. القبول</strong>.
        </div>
      </div>

      {/* Scenario Selectors */}
      <div className="mb-6">
        <div className="text-xs font-bold text-slate-300 mb-2">اختر سيناريو واقعي من المنهج:</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => selectScenario(sc.id)}
              className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer ${
                activeScenarioId === sc.id
                  ? "bg-slate-950 border-amber-500 ring-2 ring-amber-500/20 text-white font-bold"
                  : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="text-[10px] font-mono text-amber-400">{sc.strategyName.split(" ")[0]}</div>
              <div className="text-xs truncate mt-0.5">{sc.title}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Central Visual 3x3 Matrix Grid & Sliders */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 mb-6">
        
        {/* The 3x3 Color Matrix */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-300">مصفوفة المخاطر 3×3:</span>
            <span className="text-xs font-mono text-slate-500">المحور الرأسي: الأثر | المحور الأفقي: الاحتمالية</span>
          </div>

          <div className="relative">
            {/* 3x3 Grid container */}
            <div className="grid grid-cols-3 gap-2">
              {/* Row 3: Impact = 3 (مرتفع) */}
              {[1, 2, 3].map((lik) => {
                const cellScore = 3 * lik;
                const isSelected = impact === 3 && likelihood === lik;
                const cat = getRiskCategory(cellScore);

                return (
                  <div
                    key={`3-${lik}`}
                    onClick={() => {
                      setImpact(3);
                      setLikelihood(lik);
                      setIsStrategyApplied(false);
                    }}
                    className={`h-20 sm:h-24 rounded-2xl border p-2 flex flex-col items-center justify-center transition-all cursor-pointer select-none relative ${
                      cellScore >= 6
                        ? "bg-red-950/40 border-red-500/40 text-red-300"
                        : "bg-amber-950/40 border-amber-500/40 text-amber-300"
                    } ${isSelected ? "ring-4 ring-white shadow-2xl scale-105 z-10" : "hover:opacity-90"}`}
                  >
                    <span className="text-lg sm:text-2xl font-black font-mono">{cellScore}</span>
                    <span className="text-[10px] font-bold mt-1">{cat.pill}</span>
                    {isSelected && (
                      <span className="absolute -top-2 px-2 py-0.5 bg-white text-slate-950 text-[9px] font-bold rounded-full shadow">
                        الوضع الحالي 📍
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Row 2: Impact = 2 (متوسط) */}
              {[1, 2, 3].map((lik) => {
                const cellScore = 2 * lik;
                const isSelected = impact === 2 && likelihood === lik;
                const cat = getRiskCategory(cellScore);

                return (
                  <div
                    key={`2-${lik}`}
                    onClick={() => {
                      setImpact(2);
                      setLikelihood(lik);
                      setIsStrategyApplied(false);
                    }}
                    className={`h-20 sm:h-24 rounded-2xl border p-2 flex flex-col items-center justify-center transition-all cursor-pointer select-none relative ${
                      cellScore >= 6
                        ? "bg-red-950/40 border-red-500/40 text-red-300"
                        : cellScore >= 3
                        ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                        : "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    } ${isSelected ? "ring-4 ring-white shadow-2xl scale-105 z-10" : "hover:opacity-90"}`}
                  >
                    <span className="text-lg sm:text-2xl font-black font-mono">{cellScore}</span>
                    <span className="text-[10px] font-bold mt-1">{cat.pill}</span>
                    {isSelected && (
                      <span className="absolute -top-2 px-2 py-0.5 bg-white text-slate-950 text-[9px] font-bold rounded-full shadow">
                        الوضع الحالي 📍
                      </span>
                    )}
                  </div>
                );
              })}

              {/* Row 1: Impact = 1 (منخفض) */}
              {[1, 2, 3].map((lik) => {
                const cellScore = 1 * lik;
                const isSelected = impact === 1 && likelihood === lik;
                const cat = getRiskCategory(cellScore);

                return (
                  <div
                    key={`1-${lik}`}
                    onClick={() => {
                      setImpact(1);
                      setLikelihood(lik);
                      setIsStrategyApplied(false);
                    }}
                    className={`h-20 sm:h-24 rounded-2xl border p-2 flex flex-col items-center justify-center transition-all cursor-pointer select-none relative ${
                      cellScore >= 3
                        ? "bg-amber-950/40 border-amber-500/40 text-amber-300"
                        : "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    } ${isSelected ? "ring-4 ring-white shadow-2xl scale-105 z-10" : "hover:opacity-90"}`}
                  >
                    <span className="text-lg sm:text-2xl font-black font-mono">{cellScore}</span>
                    <span className="text-[10px] font-bold mt-1">{cat.pill}</span>
                    {isSelected && (
                      <span className="absolute -top-2 px-2 py-0.5 bg-white text-slate-950 text-[9px] font-bold rounded-full shadow">
                        الوضع الحالي 📍
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sliders & Calculation Card */}
        <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-300">نتيجة التقييم اللحظي:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskCat.color}`}>
                الدرجة: {score} ({riskCat.level})
              </span>
            </div>

            {/* Impact Slider */}
            <div className="mb-4">
              <div className="flex justify-between text-xs font-bold text-slate-200 mb-1.5">
                <span>1. الأثر (Impact):</span>
                <span className="font-mono text-amber-400">
                  {impact === 3 ? "مرتفع (3)" : impact === 2 ? "متوسط (2)" : "منخفض (1)"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={impact}
                onChange={(e) => {
                  setImpact(Number(e.target.value));
                  setIsStrategyApplied(false);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Likelihood Slider */}
            <div className="mb-5">
              <div className="flex justify-between text-xs font-bold text-slate-200 mb-1.5">
                <span>2. الاحتمالية (Likelihood):</span>
                <span className="font-mono text-amber-400">
                  {likelihood === 3 ? "مرتفعة (3)" : likelihood === 2 ? "متوسطة (2)" : "منخفضة (1)"}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="3"
                step="1"
                value={likelihood}
                onChange={(e) => {
                  setLikelihood(Number(e.target.value));
                  setIsStrategyApplied(false);
                }}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Strategy Treatment Button */}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={applyTreatment}
              className={`w-full p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg ${
                isStrategyApplied
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-600 hover:bg-amber-500 text-white"
              }`}
            >
              <Shield className="w-4 h-4" />
              {isStrategyApplied
                ? `✅ تم تطبيق استراتيجية ${activeScenario.strategyName}`
                : `تطبيق استراتيجية: ${activeScenario.strategyName} 🛡️`}
            </button>
            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
              {activeScenario.strategyAction}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
