"use client";

import React from "react";
import { AlertTriangle, Clock, Loader2, Play, Sparkles } from "lucide-react";
import type { NavChapter } from "@/types/catalog";
import { FINAL_PRESET, REVIEW_PRESET, type PresetKey, type UnitReviewInfo } from "./exams-logic";

interface PresetsTabProps {
  chapters: NavChapter[];
  review: UnitReviewInfo | null;
  launchingKey: PresetKey | null;
  failedKey: PresetKey | null;
  onLaunch: (key: PresetKey) => void;
  onBackToPractice: () => void;
}

/** Status line on a preset card while its questions load, or after the load failed. */
function PresetStatus({ presetKey, launchingKey, failedKey }: { presetKey: PresetKey; launchingKey: PresetKey | null; failedKey: PresetKey | null }) {
  if (launchingKey === presetKey) {
    return (
      <span className="text-[11px] text-slate-300 flex items-center gap-1.5" aria-live="polite">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
        جارِ تحميل أسئلة الامتحان…
      </span>
    );
  }
  if (failedKey === presetKey) {
    return (
      <span className="text-[11px] text-rose-300 flex items-center gap-1.5" role="alert">
        <AlertTriangle className="w-3.5 h-3.5" />
        تعذر تحميل الأسئلة — اضغط للمحاولة مجدداً.
      </span>
    );
  }
  return null;
}

/** Ready-made timed booklet exams: whole part, unit review(s), and one per chapter. Questions load on click. */
export function PresetsTab({ chapters, review, launchingKey, failedKey, onLaunch, onBackToPractice }: PresetsTabProps) {
  const busy = launchingKey !== null;
  const launch = (key: PresetKey) => {
    if (!busy) onLaunch(key);
  };
  const reviewExamCount = review ? Math.min(review.totalCount, 30) : 0;

  return (
    <section className="space-y-6 animate-fadeIn" aria-busy={busy}>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-2 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black">نماذج البوكليت الامتحانية المعتمدة ⏱️</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            اختر أحد النماذج المعتمدة أدناه لخوض اختبار إلكتروني فوري مع مؤقت زمني وتصحيح آلي وسلالم التقدير.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToPractice}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold transition-colors cursor-pointer"
        >
          ← العودة لبطاقات التدريب المباشر
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Comprehensive Full Exam */}
        <button
          type="button"
          onClick={() => launch(FINAL_PRESET)}
          className="text-right p-6 bg-slate-900/90 hover:bg-slate-800/80 border border-indigo-500/40 rounded-3xl shadow-xl transition-all cursor-pointer flex flex-col justify-between gap-4 group md:col-span-2"
        >
          <div className="space-y-2.5 w-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                الامتحان التجريبي الشامل المعتمد
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> 60 دقيقة
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
              امتحان البوكليت الشامل لكامل منهج الكتاب
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              30 سؤالاً متوازناً تغطي كافة فصول الكتاب بنسب مدروسة بدقة، مع تصحيح آلي ومراجعة الأخطاء.
            </p>
            <PresetStatus presetKey={FINAL_PRESET} launchingKey={launchingKey} failedKey={failedKey} />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 w-full">
            <span className="text-xs font-bold text-indigo-400">30 سؤالاً • 60 درجة</span>
            <span className="px-4 py-2 bg-indigo-600 group-hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5">
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>بدء الاختبار فوراً</span>
            </span>
          </div>
        </button>

        {/* Unit Comprehensive Review */}
        {review && (
          <button
            type="button"
            onClick={() => launch(REVIEW_PRESET)}
            className="text-right p-6 bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 hover:border-amber-500/60 border border-amber-500/40 rounded-3xl shadow-xl transition-all cursor-pointer flex flex-col justify-between gap-4 group md:col-span-2"
          >
            <div className="space-y-2.5 w-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  امتحان مراجعة {review.label} المعتمد
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> 45 دقيقة
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                امتحان المراجعة الشاملة لربط وتحليل مفاهيم {review.label}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {review.totalCount} سؤال اختيار من متعدد من بنك أسئلة المراجعة تغطي كافة موضوعات ودروس {review.label} وأسئلة الربط الشاملة مع تصحيح تفاعلي وإحصائيات فورية.
              </p>
              <PresetStatus presetKey={REVIEW_PRESET} launchingKey={launchingKey} failedKey={failedKey} />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 w-full">
              <span className="text-xs font-bold text-amber-400">
                {reviewExamCount} سؤالاً في الامتحان • {reviewExamCount * 2} درجة (من بنك {review.totalCount} سؤال)
              </span>
              <span className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 group-hover:from-amber-500 group-hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs transition-all shadow-md flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>خوض الامتحان الآن</span>
              </span>
            </div>
          </button>
        )}

        {/* Per-chapter Presets */}
        {chapters.map((ch) => (
          <button
            key={ch.id}
            type="button"
            onClick={() => launch(ch.id)}
            className="text-right p-6 bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-3xl shadow-xl transition-all cursor-pointer flex flex-col justify-between gap-4 group"
          >
            <div className="space-y-2.5 w-full">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  امتحان الوحدة {ch.number}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" /> 35 دقيقة
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">{ch.title}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {ch.description || `18 سؤالاً مركزاً تغطي دروس الوحدة ${ch.number}.`}
              </p>
              <PresetStatus presetKey={ch.id} launchingKey={launchingKey} failedKey={failedKey} />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 w-full">
              <span className="text-xs font-bold text-blue-400">18 سؤالاً • 36 درجة</span>
              <span className="px-4 py-2 bg-slate-800 group-hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>بدء الاختبار</span>
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
