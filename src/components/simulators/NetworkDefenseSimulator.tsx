"use client";

import React, { useState } from "react";
import { Shield, ShieldAlert, ShieldCheck, Database, Server, Laptop, UserCheck, AlertTriangle, Play, RefreshCw } from "lucide-react";

export function NetworkDefenseSimulator() {
  const [hasFirewall, setHasFirewall] = useState<boolean>(true);
  const [hasDMZ, setHasDMZ] = useState<boolean>(true);
  const [hasZeroTrust, setHasZeroTrust] = useState<boolean>(false);
  const [hasVPN, setHasVPN] = useState<boolean>(true);
  const [attackScenario, setAttackScenario] = useState<"web_exploit" | "phishing_endpoint" | "none">("none");
  const [attackLogs, setAttackLogs] = useState<string[]>([]);

  const runAttack = (type: "web_exploit" | "phishing_endpoint") => {
    setAttackScenario(type);
    const logs: string[] = [];

    if (type === "web_exploit") {
      logs.push("🔴 [00:01] هجوم خارجي يستهدف ثغرة في خادم الويب العام (منفذ 443)...");
      if (hasFirewall) {
        logs.push("🟢 [00:02] جدار الحماية الخارجي سمح بمرور حركة الويب 443 لكنه حجب المنافذ الأخرى.");
      } else {
        logs.push("⚠️ [00:02] لا يوجد جدار حماية! جميع منافذ الشبكة مفتوحة للمهاجم.");
      }

      logs.push("🔴 [00:03] المهاجم استغل ثغرة برمجية وسيطر على خادم الويب العام.");

      if (hasDMZ) {
        logs.push("🛡️ [00:04] نجاح العزل! خادم الويب موجود في المنطقة المعزولة (DMZ). جدار الحماية الداخلي منع المهاجم من الوصول إلى قاعدة البيانات السرية.");
        logs.push("✅ [00:05] النتيجة: خادم الويب فقط تأثر وتم إنقاذ بيانات العملاء الداخلية.");
      } else {
        logs.push("💥 [00:04] كارثة أمنية! خادم الويب وقاعدة البيانات في نفس الشبكة بدون DMZ. المهاجم اخترق قاعدة بيانات الطلاب وسرق الدرجات بالكامل.");
        logs.push("❌ [00:05] النتيجة: انهيار أمني شامل للشبكة.");
      }
    } else {
      logs.push("🔴 [00:01] موظف في المنزل فتح بريد تصيد احتيالي (Phishing) وتم اختراق جهازه المحمول...");
      if (!hasVPN) {
        logs.push("⚠️ [00:02] الموظف يتصل بدون VPN عبر شبكة عامة غير مشفرة.");
      } else {
        logs.push("🟢 [00:02] الموظف متصل بنفق VPN مشفر.");
      }

      if (hasZeroTrust) {
        logs.push("🛡️ [00:03] تفعيل نهج انعدام الثقة (Zero Trust)! الجهاز المخترق حاول الوصول لقاعدة البيانات، لكن النظام رفض الوصول وطلب مصادقة متعددة العوامل وفحص سلامة الجهاز.");
        logs.push("✅ [00:04] النتيجة: إحباط الهجوم الداخلي وعزل الجهاز المصاب فوراً.");
      } else {
        logs.push("💥 [00:03] الأمان المحيطي التقليدي افترض أن الجهاز 'داخل الشبكة وموثوق تلقائياً'. تمكن المخترق من التسلل أفقياً وسرقة السجلات.");
        logs.push("❌ [00:04] النتيجة: تسرب البيانات عبر جهاز الموظف المخترق.");
      }
    }
    setAttackLogs(logs);
  };

  const resetSim = () => {
    setAttackScenario("none");
    setAttackLogs([]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">مختبر تصميم أمان الشبكات والدفاع في العمق</h3>
            <p className="text-sm text-slate-400">اختبر صمود هيكلية الشبكة، الـ DMZ، وسياسات Zero Trust ضد الهجمات</p>
          </div>
        </div>
        <button
          onClick={resetSim}
          className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 text-xs"
        >
          <RefreshCw className="w-4 h-4" /> إعادة ضبط
        </button>
      </div>

      {/* Control Switches */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => setHasFirewall(!hasFirewall)}
          className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
            hasFirewall ? "bg-emerald-950/50 border-emerald-500 text-emerald-300" : "bg-slate-950/40 border-slate-800 text-slate-500"
          }`}
        >
          <div className="text-xs font-mono">الطبقة 1</div>
          <div className="text-sm font-bold mt-1">جدار الحماية {hasFirewall ? "✅ مفعّل" : "❌ معطّل"}</div>
        </button>

        <button
          onClick={() => setHasDMZ(!hasDMZ)}
          className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
            hasDMZ ? "bg-blue-950/50 border-blue-500 text-blue-300" : "bg-slate-950/40 border-slate-800 text-slate-500"
          }`}
        >
          <div className="text-xs font-mono">الطبقة 2</div>
          <div className="text-sm font-bold mt-1">عزل الـ DMZ {hasDMZ ? "✅ مفعّل" : "❌ معطّل"}</div>
        </button>

        <button
          onClick={() => setHasVPN(!hasVPN)}
          className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
            hasVPN ? "bg-amber-950/50 border-amber-500 text-amber-300" : "bg-slate-950/40 border-slate-800 text-slate-500"
          }`}
        >
          <div className="text-xs font-mono">الطبقة 3</div>
          <div className="text-sm font-bold mt-1">نفق VPN {hasVPN ? "✅ مفعّل" : "❌ معطّل"}</div>
        </button>

        <button
          onClick={() => setHasZeroTrust(!hasZeroTrust)}
          className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
            hasZeroTrust ? "bg-purple-950/50 border-purple-500 text-purple-300" : "bg-slate-950/40 border-slate-800 text-slate-500"
          }`}
        >
          <div className="text-xs font-mono">الطبقة 4</div>
          <div className="text-sm font-bold mt-1">نهج Zero Trust {hasZeroTrust ? "✅ مفعّل" : "❌ معطّل"}</div>
        </button>
      </div>

      {/* Network Topology Visualizer */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 mb-6">
        <div className="text-xs text-slate-400 font-semibold mb-4">خريطة تضاريس الشبكة الحالية (Network Topology):</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          {/* External / DMZ */}
          <div className={`p-4 rounded-xl border ${hasDMZ ? "bg-blue-950/20 border-blue-500/40" : "bg-slate-900 border-slate-800"}`}>
            <span className="text-xs font-bold text-blue-400 block mb-2">المنطقة المعزولة (DMZ)</span>
            <div className="p-3 bg-slate-900 rounded-lg inline-flex items-center justify-center mb-2 border border-slate-800">
              <Server className="w-6 h-6 text-blue-400" />
            </div>
            <div className="text-xs font-bold text-white">خادم الويب والبريد</div>
            <div className="text-[11px] text-slate-400 mt-1">مواجه للإنترنت الخارجي</div>
          </div>

          {/* Internal Security Gate */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-emerald-400 block mb-2">بوابات التحقق والحماية</span>
            <div className="flex gap-2">
              <div className={`p-2.5 rounded-lg border ${hasFirewall ? "bg-emerald-950/60 border-emerald-500 text-emerald-400" : "bg-slate-950 border-slate-800 text-slate-600"}`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className={`p-2.5 rounded-lg border ${hasZeroTrust ? "bg-purple-950/60 border-purple-500 text-purple-400" : "bg-slate-950 border-slate-800 text-slate-600"}`}>
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              {hasZeroTrust ? "فحص انعدام الثقة مفعل لكل اتصال" : "تحقق محيطي تقليدي"}
            </div>
          </div>

          {/* Internal Vault */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/40">
            <span className="text-xs font-bold text-purple-400 block mb-2">الشبكة الداخلية الآمنة</span>
            <div className="p-3 bg-slate-900 rounded-lg inline-flex items-center justify-center mb-2 border border-slate-800">
              <Database className="w-6 h-6 text-purple-400" />
            </div>
            <div className="text-xs font-bold text-white">قاعدة بيانات الطلاب والدرجات</div>
            <div className="text-[11px] text-slate-400 mt-1">أصول شديدة الحساسية</div>
          </div>
        </div>
      </div>

      {/* Attack Simulation Triggers */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <button
          onClick={() => runAttack("web_exploit")}
          className="flex-1 py-3 px-4 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" /> محاكاة هجوم استغلال ثغرة بموقع الويب
        </button>

        <button
          onClick={() => runAttack("phishing_endpoint")}
          className="flex-1 py-3 px-4 bg-amber-600/90 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Play className="w-4 h-4" /> محاكاة اختراق جهاز موظف عن بُعد
        </button>
      </div>

      {/* Real-time Attack Logs */}
      {attackLogs.length > 0 && (
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs space-y-2">
          <div className="text-slate-400 font-bold mb-1 border-b border-slate-800 pb-1">سجل تحركات الهجوم والاستجابة:</div>
          {attackLogs.map((log, index) => (
            <div key={index} className="leading-relaxed">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
