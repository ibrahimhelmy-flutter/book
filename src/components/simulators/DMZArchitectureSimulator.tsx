"use client";

import React, { useState } from "react";
import {
  Server,
  Database,
  Shield,
  Globe,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Lock,
} from "lucide-react";

export function DMZArchitectureSimulator() {
  const [hasDMZ, setHasDMZ] = useState<boolean>(true);
  const [hasOuterFirewall, setHasOuterFirewall] = useState<boolean>(true);
  const [hasInnerFirewall, setHasInnerFirewall] = useState<boolean>(true);

  // Attack animation state
  const [attackStep, setAttackStep] = useState<number>(0); // 0=idle, 1=hit outer, 2=hit web server, 3=hit inner/db
  const [attackType, setAttackType] = useState<"web_exploit" | "direct_db">("web_exploit");
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

  const launchAttack = (type: "web_exploit" | "direct_db") => {
    if (isSimulating) return;
    setAttackType(type);
    setIsSimulating(true);
    setAttackStep(1); // Attack reaches perimeter

    setTimeout(() => {
      setAttackStep(2); // Reaches Web Server / DMZ
    }, 900);

    setTimeout(() => {
      setAttackStep(3); // Attempting to reach Database / LAN
      setIsSimulating(false);
    }, 2000);
  };

  const resetAll = () => {
    setAttackStep(0);
    setIsSimulating(false);
  };

  // Outcome calculations
  const isDbSafe =
    attackType === "web_exploit"
      ? hasDMZ && hasInnerFirewall
      : hasOuterFirewall || (hasDMZ && hasInnerFirewall);

  const isWebServerHacked =
    attackType === "web_exploit" && attackStep >= 2;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-600/20 text-teal-400 rounded-2xl border border-teal-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">
              مهندس معماريات الشبكات والمنطقة المعزولة (DMZ)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              عزل خوادم الويب العامة عن قواعد البيانات الحساسة باستخدام جداري حماية (ص 40 - 41)
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
      <div className="bg-teal-950/30 border border-teal-500/20 rounded-2xl p-4 mb-6 text-xs sm:text-sm text-teal-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <strong>الفكرة الجوهرية (ص 40-41):</strong> خادم الويب معرض دائماً لمخاطر الإنترنت.
          لذلك نضعه في <strong>منطقة معزولة (DMZ)</strong> محاطة بـ <strong>جداري حماية</strong> (خارجي وداخلي).
          إذا نجح المخترق في السيطرة على خادم الويب، يمنعه الجدار الداخلي من التسلل لقاعدة بيانات الطلاب!
        </div>
      </div>

      {/* Architectural Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        {/* Toggle 1 */}
        <button
          onClick={() => {
            setHasOuterFirewall(!hasOuterFirewall);
            setAttackStep(0);
          }}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
            hasOuterFirewall
              ? "bg-slate-950 border-teal-500 ring-2 ring-teal-500/20 text-white"
              : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700"
          }`}
        >
          <div>
            <div className="text-xs font-bold">1. جدار الحماية الخارجي</div>
            <div className="text-[11px] text-slate-400">Outer Firewall</div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${hasOuterFirewall ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-500"}`}>
            {hasOuterFirewall ? "مفعّل" : "معطّل"}
          </span>
        </button>

        {/* Toggle 2 */}
        <button
          onClick={() => {
            setHasDMZ(!hasDMZ);
            setAttackStep(0);
          }}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
            hasDMZ
              ? "bg-slate-950 border-teal-500 ring-2 ring-teal-500/20 text-white"
              : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700"
          }`}
        >
          <div>
            <div className="text-xs font-bold">2. عزل المنطقة المحايدة (DMZ)</div>
            <div className="text-[11px] text-slate-400">{hasDMZ ? "شبكة معزولة" : "شبكة مسطحة (خطر)"}</div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${hasDMZ ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-500"}`}>
            {hasDMZ ? "نشطة" : "معطلة"}
          </span>
        </button>

        {/* Toggle 3 */}
        <button
          onClick={() => {
            setHasInnerFirewall(!hasInnerFirewall);
            setAttackStep(0);
          }}
          className={`p-3.5 rounded-2xl border text-right transition-all cursor-pointer flex items-center justify-between ${
            hasInnerFirewall
              ? "bg-slate-950 border-teal-500 ring-2 ring-teal-500/20 text-white"
              : "bg-slate-950/40 border-slate-800 text-slate-500 hover:border-slate-700"
          }`}
        >
          <div>
            <div className="text-xs font-bold">3. جدار الحماية الداخلي</div>
            <div className="text-[11px] text-slate-400">Inner Firewall</div>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${hasInnerFirewall ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-500"}`}>
            {hasInnerFirewall ? "مفعّل" : "معطّل"}
          </span>
        </button>
      </div>

      {/* Visual Animated Network Topology */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 mb-6 overflow-x-auto">
        <div className="min-w-[620px] flex items-center justify-between gap-3 relative py-2">
          
          {/* Node 1: Public Internet */}
          <div className="flex flex-col items-center p-3 bg-slate-900/80 border border-slate-800 rounded-2xl w-32 text-center shrink-0">
            <Globe className="w-7 h-7 text-blue-400 mb-1" />
            <span className="text-xs font-bold text-white">الإنترنت العام</span>
            <span className="text-[10px] text-slate-400">غير موثوق</span>
          </div>

          {/* Connection Line with Attack Dot */}
          <div className="flex-1 relative flex items-center justify-center">
            <div className={`h-1.5 w-full rounded-full transition-all ${
              attackStep >= 1 ? "bg-gradient-to-l from-red-500 to-amber-500 animate-pulse" : "bg-slate-800"
            }`} />
            {attackStep === 1 && (
              <span className="absolute px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full animate-bounce">
                هجوم 🚨
              </span>
            )}
          </div>

          {/* Node 2: Outer Firewall */}
          <div className="flex flex-col items-center shrink-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
              hasOuterFirewall
                ? "bg-teal-950/80 border-teal-500 text-teal-400 shadow-lg shadow-teal-950/30"
                : "bg-slate-900 border-red-900 text-red-500"
            }`}>
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono mt-1 text-slate-400">
              {hasOuterFirewall ? "جدار خارجي" : "بدون جدار"}
            </span>
          </div>

          {/* Connection Line */}
          <div className="flex-1 relative flex items-center justify-center">
            <div className={`h-1.5 w-full rounded-full transition-all ${
              attackStep >= 2 ? "bg-gradient-to-l from-red-500 to-amber-500 animate-pulse" : "bg-slate-800"
            }`} />
          </div>

          {/* Node 3: DMZ Zone (Web Server) */}
          <div className={`p-3 rounded-2xl border text-center transition-all w-40 shrink-0 ${
            hasDMZ
              ? "bg-teal-950/20 border-teal-500/40"
              : "bg-red-950/20 border-red-500/30"
          }`}>
            <span className="text-[10px] font-bold block text-teal-400 mb-1">
              {hasDMZ ? "المنطقة المعزولة (DMZ)" : "شبكة مسطحة ⚠️"}
            </span>
            <div className={`p-2.5 rounded-xl border flex flex-col items-center mx-auto transition-all ${
              isWebServerHacked
                ? "bg-amber-950/80 border-amber-500 text-amber-300 animate-pulse"
                : "bg-slate-900 border-slate-800 text-white"
            }`}>
              <Server className="w-5 h-5 mb-0.5" />
              <span className="text-xs font-bold">خادم الويب</span>
              <span className="text-[9px] text-slate-400">
                {isWebServerHacked ? "⚠️ تم اختراقه" : "المنفذ 443"}
              </span>
            </div>
          </div>

          {/* Connection Line with Deflection / Breach */}
          <div className="flex-1 relative flex items-center justify-center">
            <div className={`h-1.5 w-full rounded-full transition-all ${
              attackStep === 3
                ? isDbSafe
                  ? "bg-slate-800"
                  : "bg-red-600 animate-pulse"
                : "bg-slate-800"
            }`} />
            {attackStep === 3 && isDbSafe && (
              <span className="absolute px-2 py-0.5 bg-emerald-600 text-white text-[10px] font-bold rounded-full">
                صد 🛑
              </span>
            )}
          </div>

          {/* Node 4: Inner Firewall */}
          <div className="flex flex-col items-center shrink-0">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
              hasInnerFirewall && hasDMZ
                ? "bg-teal-950/80 border-teal-500 text-teal-400 shadow-lg shadow-teal-950/30"
                : "bg-slate-900 border-red-900 text-red-500"
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono mt-1 text-slate-400">
              {hasInnerFirewall && hasDMZ ? "جدار داخلي" : "مفتوح"}
            </span>
          </div>

          {/* Connection Line */}
          <div className="flex-1 relative flex items-center justify-center">
            <div className={`h-1.5 w-full rounded-full transition-all ${
              attackStep === 3 && !isDbSafe ? "bg-red-600 animate-pulse" : "bg-slate-800"
            }`} />
          </div>

          {/* Node 5: Internal LAN (Database) */}
          <div className={`p-3 rounded-2xl border text-center transition-all w-36 shrink-0 ${
            attackStep === 3 && !isDbSafe
              ? "bg-red-950/70 border-red-500 text-red-300 animate-shake"
              : "bg-slate-900/90 border-slate-800 text-white"
          }`}>
            <Database className={`w-6 h-6 mx-auto mb-1 ${
              attackStep === 3 && !isDbSafe ? "text-red-400" : "text-emerald-400"
            }`} />
            <span className="text-xs font-bold block">قاعدة البيانات</span>
            <span className={`text-[10px] font-mono ${
              attackStep === 3 && !isDbSafe ? "text-red-400 font-bold" : "text-slate-400"
            }`}>
              {attackStep === 3 && !isDbSafe ? "💥 تسربت الدرجات!" : "درجات الطلاب 🔒"}
            </span>
          </div>

        </div>
      </div>

      {/* Attack Simulator Bar & Live Verdict */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
          <div className="text-xs font-bold text-slate-200">
            اختر سيناريو الهجوم لرؤية كيفية عمل العزل الشبكي:
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => launchAttack("web_exploit")}
              disabled={isSimulating}
              className="flex-1 sm:flex-initial px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              اختراق خادم الويب العام 🌐
            </button>
            <button
              onClick={() => launchAttack("direct_db")}
              disabled={isSimulating}
              className="flex-1 sm:flex-initial px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              محاولة اختراق مباشر لقاعدة البيانات 🗄️
            </button>
          </div>
        </div>

        {/* Live Attack Outcome */}
        {attackStep === 3 && (
          <div className={`p-4 rounded-xl border text-xs sm:text-sm animate-fadeIn leading-relaxed ${
            isDbSafe
              ? "bg-emerald-950/50 border-emerald-500/50 text-emerald-200"
              : "bg-red-950/50 border-red-500/50 text-red-200"
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              {isDbSafe ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              )}
              <span>
                {isDbSafe
                  ? "نجاح العزل التام! تم إنقاذ قاعدة البيانات وحصر الضرر في الـ DMZ ✅"
                  : "كارثة أمنية! تحرك المهاجم أفقياً واخترق قاعدة البيانات ❌"}
              </span>
            </div>
            <p className="text-xs mt-1 text-slate-300">
              {isDbSafe
                ? "حتى لو تم اختراق خادم الويب، فإن وجوده داخل المنطقة المعزولة (DMZ) ووجود جدار الحماية الداخلي منع المهاجم من الوصول إلى السجلات الحساسة."
                : "الشبكة تفتقر إلى عزل DMZ أو جدار الحماية الداخلي، مما سمح للمهاجم بالانتقال أفقياً من خادم الويب المخترق إلى قاعدة بيانات درجات الطلاب."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
