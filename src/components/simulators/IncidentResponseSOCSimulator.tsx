"use client";

import React, { useState } from "react";
import { ShieldAlert, RotateCcw, AlertTriangle, CheckCircle2, ShieldCheck, Flame, Server, Lock, FileText, ArrowRight, Shield } from "lucide-react";

interface Phase {
  id: number;
  nameAr: string;
  nameEn: string;
  description: string;
  actionText: string;
  correctOrder: number;
  criticalTip: string;
}

const PHASES: Phase[] = [
  {
    id: 1,
    nameAr: "التحضير",
    nameEn: "Preparation",
    description: "إعداد سياسات الاستجابة للطوارئ، وتدريب الفريق الأمني، وتجهيز قنوات الاتصال والنسخ الاحتياطية المعزولة مسبقاً.",
    actionText: "تجهيز خطة الطوارئ والنسخ الاحتياطية",
    correctOrder: 1,
    criticalTip: "التحضير الجيد يقلل زمن التوقف بنسبة تزيد عن 80%."
  },
  {
    id: 2,
    nameAr: "الاكتشاف والتحليل",
    nameEn: "Detection & Analysis",
    description: "رصد التنبيهات الأمنية الشاذة، وتحديد نوع الهجوم (برمجية فدية)، وتقييم النطاق والأنظمة المتأثرة بدقة.",
    actionText: "رصد التنبيه وتأكيد الإصابة وحصر النطاق",
    correctOrder: 2,
    criticalTip: "التشخيص الدقيق يمنع اتخاذ قرارات متسرعة تزيد من تلف الأدلة."
  },
  {
    id: 3,
    nameAr: "الاحتواء",
    nameEn: "Containment",
    description: "فصل الأجهزة والخوادم المصابة عن شبكة المدرسة فوراً وإغلاق المنافذ لمنع انتشار برمجية الفدية إلى باقي الأنظمة.",
    actionText: "عزل الأجهزة المصابة عن الشبكة فوراً",
    correctOrder: 3,
    criticalTip: "الاحتواء هو الخطوة الحاسمة الأولى بعد الاكتشاف لمنع انتشار العدوى لبقية الخوادم."
  },
  {
    id: 4,
    nameAr: "الاستئصال",
    nameEn: "Eradication",
    description: "حذف البرمجيات الخبيثة بالكامل، وإلغاء حسابات المخترقين المسروقة، وسد الثغرة الأمنية المستخدمة في التسلل.",
    actionText: "إزالة البرمجية وسد الثغرة وتطهير النظام",
    correctOrder: 4,
    criticalTip: "عدم الاستئصال الجذري يؤدي إلى إعادة اختراق النظام في غضون دقائق."
  },
  {
    id: 5,
    nameAr: "الاستعادة والتعافي",
    nameEn: "Recovery",
    description: "استرجاع البيانات من النسخ الاحتياطية النظيفة بعد التأكد من سلامتها، وإعادة تشغيل الخدمات تدريجياً مع المراقبة المكثفة.",
    actionText: "استرجاع النسخ النظيفة وإعادة تشغيل الخدمات",
    correctOrder: 5,
    criticalTip: "تحذير: لا تبدأ بالاستعادة قبل اكتمال الاحتواء والاستئصال حتى لا تُشفر نسختك الاحتياطية!"
  },
  {
    id: 6,
    nameAr: "الدروس المستفادة",
    nameEn: "Lessons Learned",
    description: "توثيق الحادث في تقرير رسمي، وتحليل أسباب القصور، وتحديث السياسات الأمنية وبرامج التدريب لمنع تكراره.",
    actionText: "توثيق التقرير النهائي وتحديث السياسات",
    correctOrder: 6,
    criticalTip: "مرحلة الدروس المستفادة ترفع النضج الأمني للمؤسسة وتمنع الهجمات المماثلة مستقبلاً."
  }
];

export function IncidentResponseSOCSimulator() {
  const [selectedPhases, setSelectedPhases] = useState<number[]>([]);
  const [mistakeMessage, setMistakeMessage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const handleSelectPhase = (phaseId: number) => {
    if (selectedPhases.includes(phaseId) || isCompleted) return;

    const nextStep = selectedPhases.length + 1;
    const currentPhase = PHASES.find((p) => p.id === phaseId)!;

    if (currentPhase.correctOrder !== nextStep) {
      if (phaseId === 5 && !selectedPhases.includes(3)) {
        setMistakeMessage(
          "🚨 خطأ فادح ومفهوم خاطئ شائع! حاولت البدء بالاستعادة (Recovery) قبل احتواء الحادث (Containment)! هذا يؤدي لإعادة إصابة وتشفير النسخ الاحتياطية النظيفة فوراً!"
        );
      } else if (phaseId === 4 && !selectedPhases.includes(3)) {
        setMistakeMessage(
          "⚠️ خطأ تسلسل: يجب احتواء التهديد وعزل الأجهزة أولاً قبل البدء بالاستئصال والتطهير!"
        );
      } else {
        setMistakeMessage(
          `⚠️ تسلسل غير صحيح: المرحلة (${currentPhase.nameAr}) ترتيبها الوزاري هو رقم ${currentPhase.correctOrder}، والمرحلة المطلوبة الآن هي رقم ${nextStep}.`
        );
      }
      return;
    }

    setMistakeMessage(null);
    const updated = [...selectedPhases, phaseId];
    setSelectedPhases(updated);

    if (updated.length === 6) {
      setIsCompleted(true);
    }
  };

  const resetAll = () => {
    setSelectedPhases([]);
    setMistakeMessage(null);
    setIsCompleted(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-red-600/20 text-red-400 rounded-2xl border border-red-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">غرفة عمليات الاستجابة للحوادث السيبرانية (CIRT Command)</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              قيادة مراحل الاستجابة الست لحادث أمني خطير وفق المنهج الوزاري المعتمد (ص 45 - 46)
            </p>
          </div>
        </div>

        <button
          onClick={resetAll}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" /> إعادة المحاولة
        </button>
      </div>

      {/* Incident Alert Briefing */}
      <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold font-mono text-red-400 flex items-center gap-1.5">
            <Flame className="w-4 h-4" /> بلاغ طوارئ سيبرانية عاجل (Incident Briefing):
          </span>
          <span className="text-[10px] bg-red-500/20 text-red-300 px-2.5 py-0.5 rounded-full border border-red-500/30 font-bold">
            هجوم برمجية فدية نشط (Ransomware Outbreak)
          </span>
        </div>
        <p className="text-xs sm:text-sm text-red-200 leading-relaxed">
          خادم قاعدة بيانات درجات الامتحانات بدأ بإظهار ملفات مشفرة بامتداد <code>.locked</code> ومطالبة بفدية مالية!
          بصفتك قائد فريق الاستجابة للحوادث، نفذ <strong>مراحل الاستجابة الست بالترتيب الصحيح</strong> لإنقاذ المؤسسة.
        </p>
      </div>

      {/* Progress timeline */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold text-slate-300">مسار إنجاز مراحل الاستجابة:</span>
          <span className="text-xs font-mono text-emerald-400 font-bold">{selectedPhases.length} من 6 مراحل</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
          {[1, 2, 3, 4, 5, 6].map((num) => {
            const isDone = selectedPhases.length >= num;
            const phaseObj = PHASES.find((p) => p.correctOrder === num)!;
            return (
              <div
                key={num}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isDone
                    ? "bg-emerald-950/50 border-emerald-500 text-emerald-300 font-bold"
                    : "bg-slate-900 border-slate-800 text-slate-500"
                }`}
              >
                <div className="text-[10px] font-mono">مرحلة {num}</div>
                <div className="text-xs truncate mt-0.5">{phaseObj.nameAr}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Warning/Error message */}
      {mistakeMessage && (
        <div className="bg-amber-950/60 border border-amber-500/50 p-4 rounded-2xl text-amber-200 text-xs sm:text-sm leading-relaxed mb-6 animate-shake flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>{mistakeMessage}</div>
        </div>
      )}

      {/* Success banner */}
      {isCompleted && (
        <div className="bg-emerald-950/60 border border-emerald-500/50 p-5 rounded-2xl text-emerald-200 text-xs sm:text-sm leading-relaxed mb-6 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <strong className="text-sm sm:text-base text-emerald-300 block mb-1">
              🎉 مبروك! أتممت خطة الاستجابة للحوادث باحترافية كاملة بنسبة 100%!
            </strong>
            لقد حميت شبكة المؤسسة، وطبقت الاحتواء الحاسم قبل الاستئصال والاستعادة، ووثقت الدروس المستفادة بنجاح.
          </div>
        </div>
      )}

      {/* Action Decision Cards (Available options to pick) */}
      <div>
        <h4 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-wider font-mono">
          اختر الإجراء المناسب للمرحلة الحالية:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PHASES.map((phase) => {
            const isPicked = selectedPhases.includes(phase.id);
            return (
              <button
                key={phase.id}
                disabled={isPicked || isCompleted}
                onClick={() => handleSelectPhase(phase.id)}
                className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                  isPicked
                    ? "bg-slate-950/40 border-slate-800 opacity-40 cursor-not-allowed"
                    : "bg-slate-950 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-white shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-red-400">{phase.nameAr}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{phase.nameEn}</span>
                  </div>
                  <h5 className="font-bold text-xs sm:text-sm text-slate-200 mb-1">{phase.actionText}</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{phase.description}</p>
                </div>
                <div className="mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                  💡 {phase.criticalTip}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
