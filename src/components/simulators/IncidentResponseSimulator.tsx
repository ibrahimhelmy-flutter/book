"use client";

import React, { useState } from "react";
import { AlertCircle, ShieldAlert, CheckCircle2, RotateCcw, HelpCircle, FileText, ArrowRight } from "lucide-react";

interface StepOption {
  id: string;
  name: string;
  correctIndex: number;
}

const CORRECT_STEPS = [
  { index: 1, name: "1. التحضير (Preparation)", desc: "إعداد سياسات الاستجابة، تدريب الفريق، وتجهيز أدوات العزل والنسخ الاحتياطي مسبقاً." },
  { index: 2, name: "2. الاكتشاف والتحليل (Detection)", desc: "رصد التنبيهات الأمنية وتأكيد حدوث اختراق أمني وتحديد نطاقه." },
  { index: 3, name: "3. الاحتواء (Containment)", desc: "عزل الأجهزة المصابة عن الشبكة فوراً وإغلاق المنافذ لمنع انتشار التهديد." },
  { index: 4, name: "4. الاستئصال (Eradication)", desc: "حذف البرمجيات الخبيثة وسد الثغرات المستغلة وإلغاء صلاحيات المخترق." },
  { index: 5, name: "5. الاستعادة (Recovery)", desc: "استرجاع الأنظمة والبيانات من النسخ الاحتياطية النظيفة وإعادة تشغيل الخدمات بأمان." },
  { index: 6, name: "6. الدروس المستفادة (Lessons Learned)", desc: "توثيق تفاصيل الحادث وتحديث خطط الدفاع لمنع تكرار الهجوم مستقبلاً." }
];

export function IncidentResponseSimulator() {
  const [impact, setImpact] = useState<number>(3); // 1 = low, 2 = medium, 3 = high
  const [likelihood, setLikelihood] = useState<number>(3); // 1 = low, 2 = medium, 3 = high
  const [activeTab, setActiveTab] = useState<"six_phases" | "risk_matrix">("six_phases");
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const riskScore = impact * likelihood;

  const getRiskCategory = (score: number) => {
    if (score >= 6) return { label: "خطر جسيم - أولوية معالجة فورية طارئة 🔴", color: "text-red-400 bg-red-950/40 border-red-500/40" };
    if (score >= 3) return { label: "خطر متوسط - معالجة مجدولة مع مراقبة 🟡", color: "text-amber-400 bg-amber-950/40 border-amber-500/40" };
    return { label: "خطر منخفض - قبول المخاطرة أو مراقبة دورية 🟢", color: "text-emerald-400 bg-emerald-950/40 border-emerald-500/40" };
  };

  const handleStepClick = (index: number) => {
    if (userSequence.includes(index)) return;
    const nextSeq = [...userSequence, index];
    setUserSequence(nextSeq);

    // check if last added was in correct sequential order
    const expected = nextSeq.length;
    if (index !== expected) {
      if (index > 3 && !nextSeq.includes(3)) {
        setFeedback("⚠️ خطأ استراتيجي! حاولت تنفيذ الاستئصال أو الاستعادة قبل 'الاحتواء'! هذا سيسمح للمهاجم بإعادة تلويث النسخة النظيفة.");
      } else {
        setFeedback(`⚠️ ترتيب غير صحيح: اخترت المرحلة ${index} بينما الترتيب النموذجي يتطلب المرحلة ${expected}.`);
      }
    } else {
      if (nextSeq.length === 6) {
        setFeedback("🎉 مبروك! أتممت تسلسل مراحل الاستجابة الست بنجاح واحترافية كمهندس أمن سيبراني!");
      } else {
        setFeedback(null);
      }
    }
  };

  const resetSequence = () => {
    setUserSequence([]);
    setFeedback(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-600/20 text-red-400 rounded-xl border border-red-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">محاكي الاستجابة للحوادث ومصفوفة تقييم المخاطر</h3>
            <p className="text-sm text-slate-400">تطبيق نموذج المراحل الست وحساب درجة الخطر (التأثير × الاحتمالية)</p>
          </div>
        </div>

        <div className="flex gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab("six_phases")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "six_phases" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            المراحل الست 🚨
          </button>
          <button
            onClick={() => setActiveTab("risk_matrix")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "risk_matrix" ? "bg-red-600 text-white" : "text-slate-400 hover:text-white"
            }`}
          >
            مصفوفة المخاطر 📊
          </button>
        </div>
      </div>

      {activeTab === "six_phases" ? (
        <div>
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-300">السيناريو: هجوم برمجية فدية يشفر سجلات الطلاب</span>
              <button
                onClick={resetSequence}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> إعادة المحاولة
              </button>
            </div>
            <p className="text-xs text-slate-400">
              انقر على المراحل التالية بالترتيب الزمني الصحيح للسيطرة على الهجوم واستعادة الخدمات:
            </p>
          </div>

          {/* Buttons to pick */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 mb-6">
            {[3, 1, 5, 2, 6, 4].map((stepIdx) => {
              const step = CORRECT_STEPS.find((s) => s.index === stepIdx)!;
              const isSelected = userSequence.includes(stepIdx);
              return (
                <button
                  key={stepIdx}
                  disabled={isSelected}
                  onClick={() => handleStepClick(stepIdx)}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
                    isSelected
                      ? "bg-slate-950 border-slate-800/40 text-slate-600 opacity-50 cursor-not-allowed"
                      : "bg-slate-800 hover:bg-slate-700/80 border-slate-700 text-slate-200"
                  }`}
                >
                  <div className="text-xs font-bold text-white">{step.name}</div>
                  <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{step.desc}</div>
                </button>
              );
            })}
          </div>

          {/* User sequence display */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4">
            <div className="text-xs text-slate-400 font-semibold mb-2">تسلسل خطواتك المنفذة:</div>
            {userSequence.length === 0 ? (
              <div className="text-xs text-slate-500 italic">لم تختر أي خطوة بعد... ابدأ باختيار الخطوة الأولى.</div>
            ) : (
              <div className="flex flex-wrap gap-2 items-center">
                {userSequence.map((idx, pos) => {
                  const step = CORRECT_STEPS.find((s) => s.index === idx)!;
                  const isCorrect = idx === pos + 1;
                  return (
                    <div
                      key={pos}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1.5 ${
                        isCorrect
                          ? "bg-emerald-950/60 border-emerald-500 text-emerald-300"
                          : "bg-red-950/60 border-red-500 text-red-300"
                      }`}
                    >
                      <span>{pos + 1}.</span>
                      <span>{step.name.split(" ")[1]}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Feedback */}
          {feedback && (
            <div className="p-3.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs leading-relaxed text-slate-200">
              {feedback}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Risk Matrix Calculator */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-4">
              <h4 className="font-bold text-sm text-white">معايير تقدير الخطر (Risk Parameters)</h4>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  1. حجم التأثير والضرر (Impact):{" "}
                  <strong className="text-red-400">{impact === 3 ? "كبير (3)" : impact === 2 ? "متوسط (2)" : "صغير (1)"}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={impact}
                  onChange={(e) => setImpact(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  2. درجة الاحتمالية وتكرار الوقوع (Likelihood):{" "}
                  <strong className="text-amber-400">{likelihood === 3 ? "عالية (3)" : likelihood === 2 ? "متوسطة (2)" : "منخفضة (1)"}</strong>
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={likelihood}
                  onChange={(e) => setLikelihood(parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Risk Calculation Result */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-white mb-2">معادلة الخطر المنهجية</h4>
                <div className="font-mono text-xs text-slate-400 bg-slate-900 p-2.5 rounded-lg border border-slate-800 mb-3">
                  درجة الخطر = التأثير ({impact}) × الاحتمالية ({likelihood}) ={" "}
                  <span className="text-white font-bold text-sm">{riskScore} / 9</span>
                </div>
              </div>

              <div className={`p-4 rounded-xl border ${getRiskCategory(riskScore).color}`}>
                <div className="text-xs font-bold">{getRiskCategory(riskScore).label}</div>
                <div className="text-[11px] mt-1 opacity-90">
                  {riskScore >= 6
                    ? "يجب تخصيص الميزانية الفورية وفرق الطوارئ لمعالجة هذه الثغرة قبل أي عمل آخر."
                    : riskScore >= 3
                    ? "وضع ضوابط وقائية وتحديث الإجراءات وتحديد موعد معالجة."
                    : "مراقبة دورية وقبول المخاطرة نظراً لضآلة التأثير والاحتمال."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
