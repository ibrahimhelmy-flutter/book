"use client";

import React, { useState } from "react";
import { Server, Database, Shield, Globe, Laptop, Play, AlertTriangle, CheckCircle, RefreshCw, ArrowLeft, ArrowRight, ShieldAlert, ShieldCheck } from "lucide-react";

export function DMZArchitectureSimulator() {
  const [hasDMZ, setHasDMZ] = useState<boolean>(true);
  const [hasOuterFirewall, setHasOuterFirewall] = useState<boolean>(true);
  const [hasInnerFirewall, setHasInnerFirewall] = useState<boolean>(true);
  const [attackRunning, setAttackRunning] = useState<boolean>(false);
  const [attackStep, setAttackStep] = useState<number>(0);
  const [attackType, setAttackType] = useState<"web_server_rce" | "db_direct_probe">("web_server_rce");
  const [logs, setLogs] = useState<string[]>([]);

  const launchAttack = (type: "web_server_rce" | "db_direct_probe") => {
    setAttackType(type);
    setAttackRunning(true);
    setAttackStep(1);
    const newLogs: string[] = [];

    newLogs.push("🚨 [00:01] المهاجم يطلق هجوماً سيبرانياً من الإنترنت الخارجي...");

    if (!hasOuterFirewall) {
      newLogs.push("⚠️ [00:02] لا يوجد جدار حماية خارجي! حركة المرور غير مفلترة والمهاجم يصل للمنفذ مباشرة.");
    } else {
      newLogs.push("🛡️ [00:02] جدار الحماية الخارجي سمح بمرور حركة الويب 443/80 فقط وفحص الرزم.");
    }

    if (type === "web_server_rce") {
      newLogs.push("💥 [00:03] استغل المهاجم ثغرة برمجية (Zero-day) في خادم الويب العام وسيطر عليه.");

      if (hasDMZ) {
        newLogs.push("🧱 [00:04] خادم الويب يقع داخل المنطقة المعزولة (DMZ)! يحاول المهاجم التسلل لقاعدة البيانات الداخلية...");
        if (hasInnerFirewall) {
          newLogs.push("🛑 [00:05] نجاح العزل التام! جدار الحماية الداخلي منع أي اتصال صادر من خادم الويب نحو الشبكة الداخلية.");
          newLogs.push("✅ [00:06] النتيجة: تم حصر الضرر في DMZ وتم إنقاذ قاعدة بيانات درجات الطلاب والملفات السرية!");
        } else {
          newLogs.push("⚠️ [00:05] المنطقة المعزولة موجودة لكن لا يوجد جدار حماية داخلي يفصلها عن LAN! استطاع المهاجم العبور.");
          newLogs.push("❌ [00:06] النتيجة: تسرب بيانات الطلاب الحساسة!");
        }
      } else {
        newLogs.push("💥 [00:04] كارثة: الشبكة مسطحة وبدون منطقة معزولة (No DMZ)! خادم الويب وقاعدة البيانات في نفس النطاق الشبكي.");
        newLogs.push("🔓 [00:05] تحرك المهاجم أفقياً (Lateral Movement) فوراً وسحب جدول كلمات المرور وسجلات الطلاب.");
        newLogs.push("❌ [00:06] النتيجة: اختراق كامل للمؤسسة وتسريب شامل للبيانات!");
      }
    } else {
      // Direct DB Probe
      if (hasDMZ && hasOuterFirewall) {
        newLogs.push("🛑 [00:03] جدار الحماية الخارجي حجب محاولة الاتصال المباشر بمنفذ قاعدة البيانات 3306.");
        newLogs.push("✅ [00:04] النتيجة: قاعدة البيانات غير مرئية إطلاقاً للإنترنت الخارجي بفضل عزل الشبكة.");
      } else if (!hasOuterFirewall && !hasDMZ) {
        newLogs.push("💥 [00:03] قاعدة البيانات مكشوفة مباشرة للإنترنت بدون جدار حماية أو DMZ!");
        newLogs.push("❌ [00:04] النتيجة: اختراق فوري لقاعدة البيانات وسرقة محتوياتها بالكامل.");
      } else {
        newLogs.push("🛡️ [00:03] تم صد محاولة الوصول المباشر، لكن الهيكل الشبكي يحتاج لتفعيل جداري الحماية والـ DMZ معاً.");
      }
    }

    setLogs(newLogs);
    setAttackStep(3);
  };

  const resetSim = () => {
    setAttackRunning(false);
    setAttackStep(0);
    setLogs([]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-600/20 text-teal-400 rounded-2xl border border-teal-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">مهندس معماريات الشبكات والمنطقة المعزولة (DMZ)</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              تصميم واختبار عزل خوادم الويب العامة عن قواعد البيانات الحساسة باستخدام جداري حماية (ص 40-41)
            </p>
          </div>
        </div>

        <button
          onClick={resetSim}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> إعادة الضبط
        </button>
      </div>

      {/* Concept Definition Banner */}
      <div className="bg-teal-950/40 border border-teal-500/30 rounded-2xl p-4 text-xs sm:text-sm text-teal-200 leading-relaxed flex items-start gap-3 mb-6">
        <span className="p-1 bg-teal-500/20 rounded text-teal-300 font-bold shrink-0">المفهوم الوزاري (ص 40-41):</span>
        <div>
          <strong>المنطقة منزوعة السلاح (DMZ):</strong> شبكة فرعية تفصل بين الشبكة الداخلية الموثوقة والإنترنت غير الموثوق.
          توضع فيها الخوادم المتاحة للجمهور (مثل خادم الويب وخادم البريد)، وتُحمى بواسطة <strong>جداري حماية</strong> (خارجي وداخلي) لمنع المهاجم الذي يخترق خادم الويب من الوصول إلى قواعد البيانات الداخلية.
        </div>
      </div>

      {/* Network Architectural Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setHasOuterFirewall(!hasOuterFirewall)}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
            hasOuterFirewall
              ? "bg-slate-950 border-teal-500 ring-2 ring-teal-500/20 text-white"
              : "bg-slate-950/40 border-slate-800 text-slate-500"
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-mono text-teal-400">الضابط 1</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${hasOuterFirewall ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-500"}`}>
              {hasOuterFirewall ? "مفعّل" : "معطّل"}
            </span>
          </div>
          <div className="text-xs sm:text-sm font-bold">جدار الحماية الخارجي (Outer Firewall)</div>
          <div className="text-[11px] text-slate-400 mt-1">يفحص وينقي حركة البيانات الواردة من الإنترنت.</div>
        </button>

        <button
          onClick={() => setHasDMZ(!hasDMZ)}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
            hasDMZ
              ? "bg-slate-950 border-teal-500 ring-2 ring-teal-500/20 text-white"
              : "bg-slate-950/40 border-slate-800 text-slate-500"
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-mono text-teal-400">الهيكل الشبكي</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${hasDMZ ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-500"}`}>
              {hasDMZ ? "عزل DMZ نشط" : "شبكة مسطحة (خطر)"}
            </span>
          </div>
          <div className="text-xs sm:text-sm font-bold">تفعيل المنطقة المعزولة (DMZ Subnet)</div>
          <div className="text-[11px] text-slate-400 mt-1">عزل خوادم الويب في منطقة وسطى محايدة.</div>
        </button>

        <button
          onClick={() => setHasInnerFirewall(!hasInnerFirewall)}
          className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
            hasInnerFirewall
              ? "bg-slate-950 border-teal-500 ring-2 ring-teal-500/20 text-white"
              : "bg-slate-950/40 border-slate-800 text-slate-500"
          }`}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] font-mono text-teal-400">الضابط 2</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${hasInnerFirewall ? "bg-teal-500/20 text-teal-300" : "bg-slate-800 text-slate-500"}`}>
              {hasInnerFirewall ? "مفعّل" : "معطّل"}
            </span>
          </div>
          <div className="text-xs sm:text-sm font-bold">جدار الحماية الداخلي (Inner Firewall)</div>
          <div className="text-[11px] text-slate-400 mt-1">حظر أي اتصالات غير مصرح بها من DMZ نحو LAN.</div>
        </button>
      </div>

      {/* Visual Topology Diagram */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 mb-6 overflow-x-auto">
        <div className="min-w-[700px] flex items-center justify-between gap-3">
          {/* Public Internet */}
          <div className="flex flex-col items-center p-4 bg-slate-900/80 border border-slate-800 rounded-2xl w-36 text-center shrink-0">
            <Globe className="w-8 h-8 text-blue-400 mb-2" />
            <span className="text-xs font-bold text-white">الإنترنت العام</span>
            <span className="text-[10px] text-slate-400 mt-1">غير موثوق (Untrusted)</span>
          </div>

          {/* Outer Firewall Node */}
          <div className="flex flex-col items-center shrink-0">
            <div className={`p-3 rounded-2xl border transition-all ${
              hasOuterFirewall ? "bg-teal-950/80 border-teal-500 text-teal-400" : "bg-slate-900 border-red-900 text-red-500"
            }`}>
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono mt-1 text-slate-400">
              {hasOuterFirewall ? "جدار خارجي" : "بدون جدار"}
            </span>
          </div>

          {/* Middle Zone: DMZ or Flat Subnet */}
          <div className={`flex-1 p-4 rounded-2xl border text-center transition-all ${
            hasDMZ
              ? "bg-teal-950/20 border-teal-500/40"
              : "bg-red-950/20 border-red-500/30"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase font-mono text-teal-400">
                {hasDMZ ? "المنطقة المعزولة (DMZ)" : "الشبكة بدون عزل (Flat Network)"}
              </span>
              <span className="text-[10px] text-slate-400">المنفذ 80/443</span>
            </div>
            <div className="flex items-center justify-center gap-4 py-2">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center">
                <Server className="w-6 h-6 text-amber-400 mb-1" />
                <span className="text-xs font-bold text-white">خادم الويب</span>
                <span className="text-[9px] text-slate-400">Web Server</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center">
                <Server className="w-6 h-6 text-purple-400 mb-1" />
                <span className="text-xs font-bold text-white">خادم البريد</span>
                <span className="text-[9px] text-slate-400">Mail Server</span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              {hasDMZ ? "الخوادم معزولة عن قواعد البيانات الداخلية" : "⚠️ الخوادم وقواعد البيانات على نفس الشبكة بدون حواجز!"}
            </span>
          </div>

          {/* Inner Firewall Node */}
          <div className="flex flex-col items-center shrink-0">
            <div className={`p-3 rounded-2xl border transition-all ${
              hasInnerFirewall && hasDMZ ? "bg-teal-950/80 border-teal-500 text-teal-400" : "bg-slate-900 border-red-900 text-red-500"
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-mono mt-1 text-slate-400">
              {hasInnerFirewall && hasDMZ ? "جدار داخلي" : "مفتوح"}
            </span>
          </div>

          {/* Internal Private LAN */}
          <div className="flex flex-col items-center p-4 bg-slate-900/80 border border-slate-800 rounded-2xl w-44 text-center shrink-0">
            <Database className="w-8 h-8 text-emerald-400 mb-1" />
            <span className="text-xs font-bold text-white">قاعدة البيانات السرية</span>
            <span className="text-[10px] text-emerald-400 font-mono mt-0.5">درجات وسجلات الطلاب</span>
            <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1">
              <Laptop className="w-3 h-3" /> أجهزة الإدارة (LAN)
            </div>
          </div>
        </div>
      </div>

      {/* Attack Launch & Interactive Results */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
          <h4 className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>محاكاة الهجمات السيبرانية واختبار صمود المنظومة:</span>
          </h4>
          <span className="text-xs text-slate-500">اختر نوع الهجوم لرؤية مسار الاختراق</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => launchAttack("web_server_rce")}
            className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-right transition-all cursor-pointer"
          >
            <div className="text-xs font-bold text-amber-400">اختراق خادم الويب العام (Web Exploit) 🌐</div>
            <div className="text-[11px] text-slate-400 mt-1">
              المهاجم يسيطر على خادم الويب ويحاول التسلل أفقياً لقاعدة البيانات.
            </div>
          </button>

          <button
            onClick={() => launchAttack("db_direct_probe")}
            className="p-3 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-right transition-all cursor-pointer"
          >
            <div className="text-xs font-bold text-red-400">محاولة اتصال مباشر بقاعدة البيانات 🗄️</div>
            <div className="text-[11px] text-slate-400 mt-1">
              المهاجم يحاول فحص منفذ 3306 مباشرة من خارج المؤسسة عبر الإنترنت.
            </div>
          </button>
        </div>

        {/* Live Attack Terminal Logs */}
        {logs.length > 0 && (
          <div className="bg-black/80 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-1.5 animate-fadeIn">
            <div className="text-[10px] text-slate-500 mb-2 border-b border-slate-800 pb-1">
              سجل أحداث الهجوم المباشر (Security Incident Timeline):
            </div>
            {logs.map((log, idx) => (
              <div key={idx} className={log.includes("✅") ? "text-emerald-400" : log.includes("❌") || log.includes("💥") ? "text-red-400 font-bold" : "text-slate-300"}>
                {log}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
