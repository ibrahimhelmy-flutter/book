"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Flame,
  Server,
  ArrowLeft,
  Sparkles,
  FileCheck,
  WifiOff,
  Trash2,
  RefreshCw,
} from "lucide-react";

interface Phase {
  id: number;
  order: number;
  name: string;
  nameEn: string;
  actionText: string;
  iconName: string;
  desc: string;
}

const PHASES: Phase[] = [
  {
    id: 1,
    order: 1,
    name: "1. التحضير",
    nameEn: "Preparation",
    actionText: "تجهيز خطة الطوارئ وتدريب الفريق والنسخ المعزولة مسبقاً",
    iconName: "Shield",
    desc: "إعداد سياسات الاستجابة وتدريب الكوادر وتجهيز نسخ احتياطية معزولة (Air-gapped).",
  },
  {
    id: 2,
    order: 2,
    name: "2. الاكتشاف والتحليل",
    nameEn: "Detection & Analysis",
    actionText: "رصد التنبيه وتأكيد الإصابة وحصر نطاق الخوادم المتأثرة",
    iconName: "Flame",
    desc: "رصد التنبيهات الأمنية لتأكيد حدوث الهجوم وتحديد نوعه وسرعة انتشاره.",
  },
  {
    id: 3,
    order: 3,
    name: "3. الاحتواء",
    nameEn: "Containment",
    actionText: "فصل الأجهزة المصابة عن الشبكة فوراً لمنع انتشار العدوى",
    iconName: "WifiOff",
    desc: "عزل الأجهزة المصابة عن الشبكة لحصار الهجوم ومنعه من الانتقال لبقية الخوادم.",
  },
  {
    id: 4,
    order: 4,
    name: "4. الاستئصال",
    nameEn: "Eradication",
    actionText: "حذف البرمجية الخبيثة وسد الثغرة الأمنية المستخدمة بالكامل",
    iconName: "Trash2",
    desc: "إزالة البرمجيات الخبيثة وسد الثغرة المستغلة وإلغاء صلاحيات حسابات المخترقين.",
  },
  {
    id: 5,
    order: 5,
    name: "5. الاستعادة والتعافي",
    nameEn: "Recovery",
    actionText: "استرجاع الأنظمة من النسخ الاحتياطية النظيفة وإعادة تشغيلها",
    iconName: "RefreshCw",
    desc: "استعادة البيانات من النسخ الاحتياطية النظيفة وتشغيل الخدمات تدريجياً مع المراقبة.",
  },
  {
    id: 6,
    order: 6,
    name: "6. الدروس المستفادة",
    nameEn: "Lessons Learned",
    actionText: "توثيق الحادث في تقرير رسمي وتحديث خطط الدفاع لمنع التكرار",
    iconName: "FileCheck",
    desc: "تحليل الثغرات وتحديث السياسات الأمنية وبرامج التوعية لتفادي تكرار الحادث مستقبلاً.",
  },
];

export function IncidentResponseSOCSimulator() {
  const [currentStep, setCurrentStep] = useState<number>(0); // 0 to 6 completed
  const [mistakeNotice, setMistakeNotice] = useState<string | null>(null);

  const handlePhaseClick = (order: number) => {
    const nextExpected = currentStep + 1;

    if (order === nextExpected) {
      setMistakeNotice(null);
      setCurrentStep(order);
    } else {
      // User clicked out of order
      if (order === 5 && currentStep < 3) {
        setMistakeNotice(
          "🚨 خطأ فادح وشائع جداً في الامتحانات! حاولت البدء بـ 'الاستعادة' قبل 'الاحتواء'! هذا سيؤدي إلى إصابة وتشفير النسخ الاحتياطية النظيفة فوراً!"
        );
      } else if (order > nextExpected) {
        setMistakeNotice(
          `⚠️ تسلسل غير صحيح: الترتيب النموذجي يتطلب أولاً المرحلة ${nextExpected} (${PHASES[nextExpected - 1].name}) قبل المرحلة ${order}.`
        );
      }
    }
  };

  const resetAll = () => {
    setCurrentStep(0);
    setMistakeNotice(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 text-red-400 rounded-2xl border border-red-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">
              غرفة عمليات الاستجابة للحوادث السيبرانية (CIRT Command)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              قيادة مراحل الاستجابة الست لهجوم فدية وفق الترتيب المعتمد (ص 45 - 46)
            </p>
          </div>
        </div>

        <button
          onClick={resetAll}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer self-start sm:self-auto"
          title="إعادة المحاولة"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Emergency Incident Briefing Banner */}
      <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-4 mb-6 text-xs sm:text-sm text-red-200 flex items-start gap-3">
        <Flame className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <strong>بلاغ طوارئ سيبرانية:</strong> رصد هجوم برمجية فدية (Ransomware) يهدد بتشفير خوادم درجات الطلاب.
          بصفتك قائد الفريق الأمني، انقر على المراحل أدناه <strong>بالترتيب الصحيح (من 1 إلى 6)</strong> لإنقاذ المؤسسة وتأمين بياناتها!
        </div>
      </div>

      {/* Animated Visual Pipeline (Subway map) */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-300">مسار المراحل الست المعتمد:</span>
          <span className="text-xs font-mono font-bold text-emerald-400">
            {currentStep} من 6 مراحل مكتملة
          </span>
        </div>

        {/* 6 Steps Progress Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {PHASES.map((p) => {
            const isCompleted = currentStep >= p.order;
            const isCurrent = currentStep + 1 === p.order;

            return (
              <div
                key={p.id}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isCompleted
                    ? "bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold"
                    : isCurrent
                    ? "bg-indigo-950/60 border-indigo-500 text-indigo-300 animate-pulse font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-500"
                }`}
              >
                <div className="text-[10px] font-mono">
                  {isCompleted ? "✅ مكتملة" : isCurrent ? "👉 المرحلة التالية" : `مرحلة ${p.order}`}
                </div>
                <div className="text-xs truncate mt-0.5">{p.name.split(". ")[1]}</div>
              </div>
            );
          })}
        </div>

        {/* Live Visual Status of Target Server */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-right">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border transition-all ${
              currentStep === 6
                ? "bg-emerald-950/60 border-emerald-500 text-emerald-400"
                : currentStep >= 3
                ? "bg-amber-950/60 border-amber-500 text-amber-400"
                : "bg-red-950/60 border-red-500 text-red-400 animate-pulse"
            }`}>
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">حالة الخادم المستهدف:</div>
              <div className="text-[11px] text-slate-400">
                {currentStep === 0 && "🔥 خادم مصاب يطلب فدية — بانتظار بدء خطة الطوارئ"}
                {currentStep === 1 && "📋 الفريق مستعد وخطة التحضير مفعلة"}
                {currentStep === 2 && "🎯 تم تشخيص نوع الهجوم وحصر الأجهزة المصابة"}
                {currentStep === 3 && "🛑 تم عزل الخادم وفصله عن الشبكة بنجاح (توقف انتشار الفيروس)"}
                {currentStep === 4 && "🧹 تم حذف الفيروس وسد الثغرة الأمنية بالكامل"}
                {currentStep === 5 && "💾 تم استرجاع النسخ الاحتياطية النظيفة بأمان"}
                {currentStep === 6 && "🏆 تم توثيق الدروس المستفادة وتحصين المنظومة بنسبة 100%!"}
              </div>
            </div>
          </div>

          {currentStep === 6 && (
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full text-xs font-bold shadow-lg">
              نجاح المهمة 100% 🎉
            </span>
          )}
        </div>
      </div>

      {/* Mistake Alert Banner */}
      {mistakeNotice && (
        <div className="bg-amber-950/70 border border-amber-500/50 rounded-2xl p-4 mb-6 text-amber-200 text-xs sm:text-sm leading-relaxed flex items-start gap-3 animate-shake">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>{mistakeNotice}</div>
        </div>
      )}

      {/* Clickable Phase Action Cards */}
      <div>
        <div className="text-xs font-bold text-slate-300 mb-3">
          انقر على الإجراء الصحيح للمرحلة المطلوبة حالياً:
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PHASES.map((p) => {
            const isDone = currentStep >= p.order;

            return (
              <button
                key={p.id}
                onClick={() => handlePhaseClick(p.order)}
                disabled={isDone}
                className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  isDone
                    ? "bg-slate-950/40 border-slate-800 text-slate-500 opacity-50 cursor-not-allowed"
                    : "bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-white shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-red-400">{p.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{p.nameEn}</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-200 mb-1">{p.actionText}</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono flex items-center justify-between">
                  <span>المرحلة {p.order}</span>
                  <span>{isDone ? "تم التنفيذ ✅" : "انقر للتنفيذ 👈"}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
