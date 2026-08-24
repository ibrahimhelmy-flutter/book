"use client";

import React, { useState } from "react";
import { Cpu, Zap, Activity, Info } from "lucide-react";

interface ProcessorData {
  year: number;
  name: string;
  transistorCount: number;
  processNm: number;
  cores: number;
  note: string;
}

const HISTORICAL_PROCESSORS: ProcessorData[] = [
  { year: 1971, name: "Intel 4004", transistorCount: 2300, processNm: 10000, cores: 1, note: "أول معالج دقيق تجاري في العالم" },
  { year: 1978, name: "Intel 8086", transistorCount: 29000, processNm: 3000, cores: 1, note: "معمارية x86 التي بدأت ثورة الحواسب الشخصية" },
  { year: 1989, name: "Intel 80486", transistorCount: 1200000, processNm: 1000, cores: 1, note: "تجاوز حاجز المليون ترانزستور مع ذاكرة كاش مدمجة" },
  { year: 2000, name: "Pentium 4", transistorCount: 42000000, processNm: 180, cores: 1, note: "بداية مواجهة حدود التبريد واستهلاك الطاقة" },
  { year: 2010, name: "Intel Core i7 (Nehalem)", transistorCount: 1170000000, processNm: 32, cores: 4, note: "التحول الكبير نحو تعدد الأنوية (Multi-core)" },
  { year: 2022, name: "Apple M1 Ultra", transistorCount: 114000000000, processNm: 5, cores: 20, note: "أكثر من 114 مليار ترانزستور بتقنية 5 نانومتر" },
  { year: 2026, name: "معالجات الجيل الكمومي والهجين", transistorCount: 300000000000, processNm: 2, cores: 64, note: "الاقتراب من الحدود الذرية وظهور الحوسبة الكمومية المساعدة" }
];

export function MooreLawSimulator() {
  const [selectedYear, setSelectedYear] = useState<number>(2022);

  const currentProc =
    HISTORICAL_PROCESSORS.reduce((prev, curr) =>
      Math.abs(curr.year - selectedYear) < Math.abs(prev.year - selectedYear) ? curr : prev
    );

  // Theoretical Moore's law extrapolation from 1971 (doubling every 2 years)
  const yearsSince1971 = selectedYear - 1971;
  const theoreticalTransistors = 2300 * Math.pow(2, yearsSince1971 / 2);

  const formatNumber = (num: number) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)} مليار`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)} مليون`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)} ألف`;
    return num.toLocaleString("ar-EG");
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">محاكي قانون مور والتطور الحوسبي</h3>
            <p className="text-sm text-slate-400">تحليل مضاعفة الترانزستورات والتحديات الفيزيائية المعاصرة</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs font-semibold rounded-full border border-blue-500/20">
          تفاعلي ⚡
        </span>
      </div>

      {/* Year Slider */}
      <div className="mb-8 bg-slate-950/60 p-5 rounded-xl border border-slate-800/80">
        <div className="flex justify-between items-center mb-3">
          <label className="text-sm font-medium text-slate-300">السنة الزمنية المختارة:</label>
          <span className="text-2xl font-black text-blue-400 font-mono">{selectedYear}</span>
        </div>
        <input
          type="range"
          min="1971"
          max="2026"
          step="1"
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
          className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
          <span>1971 (Intel 4004)</span>
          <span>1995 (ظهور الويب)</span>
          <span>2010 (السحابة و Multi-core)</span>
          <span>2026 (النانوميتر & AI)</span>
        </div>
      </div>

      {/* Live Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>المعالج الأقرب تاريخياً</span>
          </div>
          <div className="text-lg font-bold text-emerald-400">{currentProc.name}</div>
          <div className="text-xs text-slate-400 mt-1">{currentProc.note}</div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>عدد الترانزستورات الفعلي</span>
          </div>
          <div className="text-xl font-black text-amber-400 font-mono">
            {formatNumber(currentProc.transistorCount)}
          </div>
          <div className="text-xs text-slate-400 mt-1">دقة التصنيع: {currentProc.processNm} نانومتر</div>
        </div>

        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>توقع قانون مور النظري</span>
          </div>
          <div className="text-xl font-black text-purple-400 font-mono">
            {formatNumber(theoreticalTransistors)}
          </div>
          <div className="text-xs text-slate-400 mt-1">مضاعفة كل عامين بالضبط</div>
        </div>
      </div>

      {/* Physics Limit Explanation */}
      <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-sm flex gap-3 items-start">
        <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-slate-300 leading-relaxed">
          <p className="font-semibold text-white">حدود قانون مور الفيزيائية:</p>
          <p>
            مع وصول دقة التصنيع إلى أقل من 3 نانومتر، أصبحت الإلكترونات قادرة على القفز عبر الحواجز الذرية بسبب ظاهرة
            <strong className="text-amber-300"> النفق الكمومي (Quantum Tunneling)</strong>، مما يسبب تسرباً للحرارة والتيار. لذلك لجأت الصناعة إلى
            <strong className="text-blue-300"> تعدد الأنوية (Multi-core)</strong> وتطوير
            <strong className="text-purple-300"> الحوسبة الكمومية والرقائق المتخصصة بالذكاء الاصطناعي</strong>.
          </p>
        </div>
      </div>
    </div>
  );
}
