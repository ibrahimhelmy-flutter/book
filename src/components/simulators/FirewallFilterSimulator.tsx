"use client";

import React, { useState } from "react";
import { Filter, Shield, ShieldCheck, ShieldX, Play, RotateCcw, CheckCircle, XCircle, AlertTriangle, ArrowDown } from "lucide-react";

interface FirewallRule {
  id: string;
  port: number;
  protocol: "TCP" | "UDP";
  description: string;
  action: "ALLOW" | "DROP";
}

interface Packet {
  id: string;
  sourceIp: string;
  destPort: number;
  protocol: "TCP" | "UDP";
  type: "legit_web" | "ssh_attack" | "sql_direct" | "dos_flood";
  label: string;
  payload: string;
}

export function FirewallFilterSimulator() {
  const [rules, setRules] = useState<FirewallRule[]>([
    { id: "r1", port: 443, protocol: "TCP", description: "حركة تصفح الويب الآمن (HTTPS)", action: "ALLOW" },
    { id: "r2", port: 80, protocol: "TCP", description: "حركة الويب غير المشفرة (HTTP)", action: "ALLOW" },
    { id: "r3", port: 22, protocol: "TCP", description: "منفذ إدارة الخادم عن بعد (SSH)", action: "DROP" },
    { id: "r4", port: 3306, protocol: "TCP", description: "منفذ قاعدة بيانات MySQL", action: "DROP" }
  ]);

  const [inspectedPacket, setInspectedPacket] = useState<{
    packet: Packet;
    matchedRule: FirewallRule | undefined;
    verdict: "ALLOW" | "DROP";
    explanation: string;
  } | null>(null);

  const [stats, setStats] = useState<{ allowed: number; dropped: number }>({ allowed: 0, dropped: 0 });

  const toggleRuleAction = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, action: r.action === "ALLOW" ? "DROP" : "ALLOW" } : r))
    );
  };

  const sendPacket = (type: "legit_web" | "ssh_attack" | "sql_direct" | "dos_flood") => {
    let packet: Packet;

    if (type === "legit_web") {
      packet = {
        id: "pkt-" + Math.floor(Math.random() * 10000),
        sourceIp: "197.34.12.89",
        destPort: 443,
        protocol: "TCP",
        type,
        label: "طلب تصفح طالب (HTTPS GET)",
        payload: "GET /student-portal/grades HTTP/1.1 (TLS 1.3 encrypted)"
      };
    } else if (type === "ssh_attack") {
      packet = {
        id: "pkt-" + Math.floor(Math.random() * 10000),
        sourceIp: "185.220.101.5",
        destPort: 22,
        protocol: "TCP",
        type,
        label: "محاولة اختراق SSH للمشرف",
        payload: "SSH-2.0-OpenSSH_8.2 (Brute-Force login: root@server)"
      };
    } else if (type === "sql_direct") {
      packet = {
        id: "pkt-" + Math.floor(Math.random() * 10000),
        sourceIp: "91.240.118.2",
        destPort: 3306,
        protocol: "TCP",
        type,
        label: "استعلام مباشر لقاعدة البيانات",
        payload: "SELECT * FROM student_exams WHERE 1=1 --"
      };
    } else {
      packet = {
        id: "pkt-" + Math.floor(Math.random() * 10000),
        sourceIp: "45.154.255.8",
        destPort: 80,
        protocol: "TCP",
        type,
        label: "طوفان حزم إغراق DoS Flood",
        payload: "TCP SYN Flood packets (30,000 req/sec)"
      };
    }

    const matched = rules.find((r) => r.port === packet.destPort);
    const verdict = matched ? matched.action : "DROP";

    let explanation = "";
    if (verdict === "ALLOW") {
      explanation = `سمح جدار الحماية بمرور الحزمة لأن المنفذ ${packet.destPort} مضبوط على ALLOW بقاعدة مخصصة.`;
    } else {
      explanation = `حجب جدار الحماية الحزمة وأسقطها فوراً لأن المنفذ ${packet.destPort} مضبوط على DROP، مانعاً الهجوم من الوصول للخدمات الداخلية.`;
    }

    setInspectedPacket({
      packet,
      matchedRule: matched,
      verdict,
      explanation
    });

    setStats((prev) => ({
      allowed: prev.allowed + (verdict === "ALLOW" ? 1 : 0),
      dropped: prev.dropped + (verdict === "DROP" ? 1 : 0)
    }));
  };

  const resetAll = () => {
    setInspectedPacket(null);
    setStats({ allowed: 0, dropped: 0 });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">محاكي جدار الحماية وقواعد تصفية الحزم (Packet Filtering)</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              فحص منافذ الشبكة والبروتوكولات وتهيئة قواعد السماح والحجب لصد الهجمات (ص 39)
            </p>
          </div>
        </div>

        <button
          onClick={resetAll}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4" /> إعادة الضبط
        </button>
      </div>

      {/* Concept Definition Banner */}
      <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4 text-xs sm:text-sm text-blue-200 leading-relaxed flex items-start gap-3 mb-6">
        <span className="p-1 bg-blue-500/20 rounded text-blue-300 font-bold shrink-0">المفهوم الوزاري (ص 39):</span>
        <div>
          <strong>جدار الحماية (Firewall):</strong> نظام أمني يراقب ويتحكم في حركة مرور الشبكة الصادرة والواردة بناءً على قواعد أمان محددة مسبقاً.
          يفحص <strong>عناوين IP، وأرقام المنافذ (Ports)، والبروتوكولات</strong> ليقرر إما السماح بمرور الحزمة (Allow) أو إسقاطها وحجبها (Drop).
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Rules Table Configurator */}
        <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-400" />
              <span>جدول قواعد جدار الحماية (Firewall Rules Table):</span>
            </h4>
            <span className="text-xs text-slate-400">انقر لتبديل الإجراء (ALLOW / DROP)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="pb-2">المنفذ (Port)</th>
                  <th className="pb-2">البروتوكول</th>
                  <th className="pb-2">الخدمة المستهدفة</th>
                  <th className="pb-2">الإجراء المعتمد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {rules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-3 font-bold text-blue-300">{rule.port}</td>
                    <td className="py-3 text-slate-400">{rule.protocol}</td>
                    <td className="py-3 text-slate-300 font-sans">{rule.description}</td>
                    <td className="py-3">
                      <button
                        onClick={() => toggleRuleAction(rule.id)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          rule.action === "ALLOW"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30"
                        }`}
                      >
                        {rule.action === "ALLOW" ? "✅ مسموح (ALLOW)" : "🛑 محجوب (DROP)"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>إحصائيات المرور:</span>
            <div className="flex gap-4 font-mono">
              <span className="text-emerald-400">مسموح: {stats.allowed}</span>
              <span className="text-red-400">محجوب: {stats.dropped}</span>
            </div>
          </div>
        </div>

        {/* Packet Traffic Generator */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
              <Play className="w-4 h-4 text-emerald-400" />
              <span>توليد وإرسال حزم بيانات للشبكة:</span>
            </h4>
            <p className="text-xs text-slate-400 mb-4">
              أرسل حزم اختبار متنوعة وشاهد قرار جدار الحماية الفوري لكل منها:
            </p>

            <div className="space-y-2">
              <button
                onClick={() => sendPacket("legit_web")}
                className="w-full p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-right text-xs font-bold text-emerald-400 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>طلب تصفح آمن (منفذ 443 HTTPS) 🌐</span>
                <span className="text-[10px] text-slate-500 font-mono">طالب</span>
              </button>

              <button
                onClick={() => sendPacket("ssh_attack")}
                className="w-full p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-right text-xs font-bold text-amber-400 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>محاولة اتصال عن بعد (منفذ 22 SSH) 🔑</span>
                <span className="text-[10px] text-slate-500 font-mono">مهاجم</span>
              </button>

              <button
                onClick={() => sendPacket("sql_direct")}
                className="w-full p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-right text-xs font-bold text-red-400 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>اتصال بقاعدة البيانات (منفذ 3306) 🗄️</span>
                <span className="text-[10px] text-slate-500 font-mono">مهاجم</span>
              </button>

              <button
                onClick={() => sendPacket("dos_flood")}
                className="w-full p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-right text-xs font-bold text-purple-400 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>طوفان إغراق (منفذ 80 HTTP DoS) ⚡</span>
                <span className="text-[10px] text-slate-500 font-mono">بوت نت</span>
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 mt-4">
            تتم التصفية على مستوى طبقة النقل والشبكة (L3/L4 Packet Inspection).
          </div>
        </div>
      </div>

      {/* Live Packet Inspection Result */}
      {inspectedPacket && (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div className="flex items-center gap-2">
              {inspectedPacket.verdict === "ALLOW" ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <ShieldX className="w-5 h-5 text-red-400" />
              )}
              <span className="font-bold text-sm text-white">
                فحص الحزمة: {inspectedPacket.packet.label}
              </span>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                inspectedPacket.verdict === "ALLOW"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}
            >
              القرار: {inspectedPacket.verdict}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs mb-3 font-mono">
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">عنوان المصدر (Source IP):</span>
              <span className="text-slate-300 font-bold">{inspectedPacket.packet.sourceIp}</span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-500 block">المنفذ المستهدف (Port):</span>
              <span className="text-blue-400 font-bold">{inspectedPacket.packet.destPort} ({inspectedPacket.packet.protocol})</span>
            </div>
            <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 sm:col-span-2">
              <span className="text-[10px] text-slate-500 block">حمولة الحزمة (Payload):</span>
              <span className="text-slate-400 truncate block">{inspectedPacket.packet.payload}</span>
            </div>
          </div>

          <div
            className={`p-3 rounded-xl text-xs leading-relaxed ${
              inspectedPacket.verdict === "ALLOW"
                ? "bg-emerald-950/30 text-emerald-200 border border-emerald-500/20"
                : "bg-red-950/30 text-red-200 border border-red-500/20"
            }`}
          >
            <strong>تحليل الفاحص:</strong> {inspectedPacket.explanation}
          </div>
        </div>
      )}
    </div>
  );
}
