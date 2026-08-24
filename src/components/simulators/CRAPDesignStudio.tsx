"use client";

import React, { useState } from "react";
import { Layout, Check, X, Sparkles, Eye, Info } from "lucide-react";

export function CRAPDesignStudio() {
  const [contrastEnabled, setContrastEnabled] = useState<boolean>(true);
  const [repetitionEnabled, setRepetitionEnabled] = useState<boolean>(true);
  const [alignmentEnabled, setAlignmentEnabled] = useState<boolean>(true);
  const [proximityEnabled, setProximityEnabled] = useState<boolean>(true);

  const toggleAll = (enable: boolean) => {
    setContrastEnabled(enable);
    setRepetitionEnabled(enable);
    setAlignmentEnabled(enable);
    setProximityEnabled(enable);
  };

  const getScore = () => {
    let count = 0;
    if (contrastEnabled) count += 25;
    if (repetitionEnabled) count += 25;
    if (alignmentEnabled) count += 25;
    if (proximityEnabled) count += 25;
    return count;
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-pink-600/20 text-pink-400 rounded-xl border border-pink-500/30">
            <Layout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">استوديو مبادئ التصميم البصري (CRAP Studio)</h3>
            <p className="text-sm text-slate-400">
              اختبر تأثير التباين (Contrast)، التكرار (Repetition)، المحاذاة (Alignment)، والتقارب (Proximity)
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => toggleAll(false)}
            className="px-2.5 py-1 bg-red-950/40 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-900/40 transition-all cursor-pointer"
          >
            تصميم سيء (تعطيل الكل) ❌
          </button>
          <button
            onClick={() => toggleAll(true)}
            className="px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs rounded-lg hover:bg-emerald-900/40 transition-all cursor-pointer"
          >
            تصميم مثالي (تفعيل الكل) ✨
          </button>
        </div>
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {/* Contrast */}
        <button
          onClick={() => setContrastEnabled(!contrastEnabled)}
          className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
            contrastEnabled
              ? "bg-pink-950/50 border-pink-500 text-pink-300 ring-2 ring-pink-500/30"
              : "bg-slate-950 border-slate-800 text-slate-500"
          }`}
        >
          <div className="flex justify-between items-center text-xs font-mono">
            <span>C - التباين</span>
            {contrastEnabled ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
          </div>
          <div className="text-xs font-bold mt-1 text-white">إبراز الأهم والأزرار</div>
        </button>

        {/* Repetition */}
        <button
          onClick={() => setRepetitionEnabled(!repetitionEnabled)}
          className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
            repetitionEnabled
              ? "bg-purple-950/50 border-purple-500 text-purple-300 ring-2 ring-purple-500/30"
              : "bg-slate-950 border-slate-800 text-slate-500"
          }`}
        >
          <div className="flex justify-between items-center text-xs font-mono">
            <span>R - التكرار</span>
            {repetitionEnabled ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
          </div>
          <div className="text-xs font-bold mt-1 text-white">اتساق الألوان والخطوط</div>
        </button>

        {/* Alignment */}
        <button
          onClick={() => setAlignmentEnabled(!alignmentEnabled)}
          className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
            alignmentEnabled
              ? "bg-blue-950/50 border-blue-500 text-blue-300 ring-2 ring-blue-500/30"
              : "bg-slate-950 border-slate-800 text-slate-500"
          }`}
        >
          <div className="flex justify-between items-center text-xs font-mono">
            <span>A - المحاذاة</span>
            {alignmentEnabled ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
          </div>
          <div className="text-xs font-bold mt-1 text-white">محاذاة خط الأساس اليميني</div>
        </button>

        {/* Proximity */}
        <button
          onClick={() => setProximityEnabled(!proximityEnabled)}
          className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
            proximityEnabled
              ? "bg-amber-950/50 border-amber-500 text-amber-300 ring-2 ring-amber-500/30"
              : "bg-slate-950 border-slate-800 text-slate-500"
          }`}
        >
          <div className="flex justify-between items-center text-xs font-mono">
            <span>P - التقارب</span>
            {proximityEnabled ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-red-400" />}
          </div>
          <div className="text-xs font-bold mt-1 text-white">تجميع العناصر المترابطة</div>
        </button>
      </div>

      {/* Live Visual Canvas */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> معاينة البطاقة التصميمية الناتجة:
          </span>
          <span className="text-xs font-mono font-bold text-pink-400">
            جودة تجربة المستخدم: {getScore()}%
          </span>
        </div>

        {/* The Card */}
        <div
          className={`rounded-2xl transition-all duration-300 ${
            proximityEnabled ? "p-6 max-w-md mx-auto" : "p-2 max-w-full space-y-8"
          } ${
            contrastEnabled
              ? "bg-slate-900 border-2 border-pink-500/40 shadow-2xl shadow-pink-950/20"
              : "bg-slate-800/40 border border-slate-700/30 text-slate-500"
          }`}
        >
          {/* Card Header & Title */}
          <div className={`${alignmentEnabled ? "text-right" : "text-center"}`}>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full inline-block mb-2 font-mono ${
                repetitionEnabled
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold"
                  : "bg-slate-700 text-slate-400 italic"
              }`}
            >
              كتاب دراسي معتمد • 2026
            </span>

            <h4
              className={`font-black transition-all ${
                contrastEnabled ? "text-xl text-white tracking-tight" : "text-sm text-slate-400 font-normal"
              }`}
            >
              البرمجة والذكاء الاصطناعي (الجزء الأول)
            </h4>

            <p
              className={`text-xs mt-1.5 leading-relaxed ${
                contrastEnabled ? "text-slate-300" : "text-slate-500"
              }`}
            >
              منهج الصف الثاني الثانوي المصري المعتمد وفق رؤية مصر 2030 بالتعاون مع البكالوريا الدولية (IB).
            </p>
          </div>

          {/* Proximity Gap */}
          <div className={`${proximityEnabled ? "mt-4 pt-4 border-t border-slate-800" : "mt-12"}`}>
            <div
              className={`flex items-center justify-between ${
                alignmentEnabled ? "flex-row" : "flex-col gap-3"
              }`}
            >
              <div>
                <span className="text-[11px] text-slate-400 block">السعر للطلاب:</span>
                <span
                  className={`font-mono font-bold ${
                    contrastEnabled ? "text-lg text-emerald-400" : "text-xs text-slate-500"
                  }`}
                >
                  مجاناً للتحميل الرقمي
                </span>
              </div>

              <button
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  contrastEnabled
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/25 hover:opacity-90"
                    : "bg-slate-700 text-slate-400 border border-slate-600"
                } ${repetitionEnabled ? "rounded-xl font-bold" : "rounded-none text-[10px]"}`}
              >
                تحميل المنهج التفاعلي 📥
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Explanatory notes */}
      <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-1">
        <div className="font-bold text-slate-200 flex items-center gap-1 mb-1">
          <Info className="w-4 h-4 text-pink-400" />
          <span>ملخص دور المبادئ الأربعة:</span>
        </div>
        <p>• <strong>التباين (Contrast):</strong> يجذب عين القارئ فوراً للعناوين وأزرار اتخاذ الإجراء (CTA).</p>
        <p>• <strong>التكرار (Repetition):</strong> يخلق مظهر هوية موحدة ومريحة للتصفح عبر الألوان والأيقونات المتسقة.</p>
        <p>• <strong>المحاذاة (Alignment):</strong> يربط العناصر على شبكة يمنية منتظمة تناسب القراءة العربية السلسة.</p>
        <p>• <strong>التقارب (Proximity):</strong> يجمع البيانات المترابطة مكانياً ويفصلها عن غيرها بمسافات بيضاء نقية.</p>
      </div>
    </div>
  );
}
