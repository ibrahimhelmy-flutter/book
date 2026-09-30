"use client";

import React, { useState } from "react";
import {
  Filter,
  Shield,
  ShieldCheck,
  ShieldX,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowLeft,
  Server,
  User,
} from "lucide-react";

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
  protocol: "TCP";
  label: string;
  isMalicious: boolean;
}

export function FirewallFilterSimulator() {
  const [rules, setRules] = useState<FirewallRule[]>([
    { id: "r1", port: 443, protocol: "TCP", description: "تصفح ويب آمن (HTTPS)", action: "ALLOW" },
    { id: "r2", port: 80, protocol: "TCP", description: "تصفح ويب عادي (HTTP)", action: "ALLOW" },
    { id: "r3", port: 22, protocol: "TCP", description: "إدارة الخادم عن بعد (SSH)", action: "DROP" },
    { id: "r4", port: 3306, protocol: "TCP", description: "قاعدة بيانات (MySQL)", action: "DROP" },
  ]);

  const [activePacket, setActivePacket] = useState<Packet | null>(null);
  const [packetState, setPacketState] = useState<"idle" | "in_flight" | "decided">("idle");
  const [stats, setStats] = useState<{ allowed: number; dropped: number }>({ allowed: 0, dropped: 0 });

  const toggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, action: r.action === "ALLOW" ? "DROP" : "ALLOW" } : r))
    );
  };

  const sendPacket = (destPort: number, label: string, isMalicious: boolean) => {
    const pkt: Packet = {
      id: "pkt-" + Math.floor(Math.random() * 1000),
      sourceIp: isMalicious ? "185.220.101.5" : "197.34.12.89",
      destPort,
      protocol: "TCP",
      label,
      isMalicious,
    };

    setActivePacket(pkt);
    setPacketState("in_flight");

    setTimeout(() => {
      setPacketState("decided");
      const matched = rules.find((r) => r.port === destPort);
      const verdict = matched ? matched.action : "DROP";

      setStats((prev) => ({
        allowed: prev.allowed + (verdict === "ALLOW" ? 1 : 0),
        dropped: prev.dropped + (verdict === "DROP" ? 1 : 0),
      }));
    }, 700);
  };

  const currentVerdict =
    activePacket
      ? (rules.find((r) => r.port === activePacket.destPort)?.action || "DROP")
      : null;

  const resetAll = () => {
    setActivePacket(null);
    setPacketState("idle");
    setStats({ allowed: 0, dropped: 0 });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 text-white shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
            <Filter className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black">
              محاكي جدار الحماية وتصفية الحزم (Packet Filtering)
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              فحص منافذ الشبكة وقواعد السماح (ALLOW) والحجب (DROP) لحظياً (ص 39)
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
      <div className="bg-blue-950/30 border border-blue-500/20 rounded-2xl p-4 mb-6 text-xs sm:text-sm text-blue-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong>الفكرة الجوهرية (ص 39):</strong> جدار الحماية يفحص كل حزمة تمر عبره (رقم المنفذ وعنوان IP).
          إذا كان المنفذ مسموحاً (<strong>ALLOW</strong>)، تعبر الحزمة إلى الخادم. وإذا كان محجوباً (<strong>DROP</strong>)،
          يسقطها الجدار فوراً ويحمي الشبكة.
        </div>
      </div>

      {/* Visual Animated Packet Filtering Arena */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl p-5 sm:p-6 mb-6 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_1fr] gap-4 items-center relative">
          
          {/* SENDER / SOURCE */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 mx-auto flex items-center justify-center mb-2 border border-blue-500/30">
              <User className="w-6 h-6" />
            </div>
            <div className="font-bold text-xs sm:text-sm text-white">مصدر الحزمة (إنترنت)</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {activePacket ? activePacket.sourceIp : "IP: 197.34.12.89"}
            </div>
            {activePacket && (
              <div className="mt-2 text-[11px] font-bold text-slate-300">
                {activePacket.label}
              </div>
            )}
          </div>

          {/* FIREWALL GATE (Animated Barrier) */}
          <div className="flex flex-col items-center justify-center py-4 px-2">
            <div className="text-[10px] font-mono text-slate-400 mb-2">بوابة جدار الحماية (Firewall)</div>
            
            {/* The Gate */}
            <div className={`w-28 h-28 rounded-3xl border-2 flex flex-col items-center justify-center transition-all duration-500 relative ${
              packetState === "decided"
                ? currentVerdict === "ALLOW"
                  ? "bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-xl shadow-emerald-950/40"
                  : "bg-red-950/60 border-red-500 text-red-400 shadow-xl shadow-red-950/40 animate-shake"
                : "bg-slate-900 border-blue-500/50 text-blue-400"
            }`}>
              {packetState === "decided" ? (
                currentVerdict === "ALLOW" ? (
                  <>
                    <ShieldCheck className="w-10 h-10 mb-1" />
                    <span className="text-[10px] font-bold font-mono">ALLOW ✅</span>
                  </>
                ) : (
                  <>
                    <ShieldX className="w-10 h-10 mb-1" />
                    <span className="text-[10px] font-bold font-mono">DROP 🛑</span>
                  </>
                )
              ) : (
                <>
                  <Shield className="w-10 h-10 mb-1" />
                  <span className="text-[10px] font-bold font-mono">فحص الحزم</span>
                </>
              )}

              {/* In-flight traveling packet animation */}
              {packetState === "in_flight" && (
                <div className="absolute inset-0 flex items-center justify-center bg-blue-950/90 rounded-3xl animate-pulse">
                  <span className="text-xs font-mono font-bold text-blue-300">جاري الفحص...</span>
                </div>
              )}
            </div>

            {/* Verdict Explanation */}
            <div className="mt-3 text-center">
              {packetState === "decided" && activePacket ? (
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  currentVerdict === "ALLOW"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                    : "bg-red-500/20 text-red-300 border-red-500/30"
                }`}>
                  {currentVerdict === "ALLOW"
                    ? `مسموح بمرور الحزمة عبر منفذ ${activePacket.destPort}`
                    : `تم حجب الحزمة وإسقاطها لمنفذ ${activePacket.destPort}`}
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">اختر حزمة أدناه لاختبار قرار الجدار</span>
              )}
            </div>
          </div>

          {/* DESTINATION / SERVER */}
          <div className="p-4 bg-slate-900/70 border border-slate-800 rounded-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 text-purple-400 mx-auto flex items-center justify-center mb-2 border border-purple-500/30">
              <Server className="w-6 h-6" />
            </div>
            <div className="font-bold text-xs sm:text-sm text-white">الخادم المستهدف (LAN)</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">الخدمات الداخلية</div>
            
            {packetState === "decided" && (
              <div className="mt-2 text-[11px] font-bold">
                {currentVerdict === "ALLOW" ? (
                  <span className="text-emerald-400">استلم الطلب بنجاح 📥</span>
                ) : (
                  <span className="text-slate-500">لم تصل الحزمة للخادم 🛡️</span>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Rules Configuration & Packet Launcher Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Rules Table */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-200">قواعد جدار الحماية (انقر للتبديل):</span>
            <span className="text-[10px] text-slate-400">ALLOW / DROP</span>
          </div>

          <div className="space-y-2">
            {rules.map((r) => (
              <div
                key={r.id}
                onClick={() => toggleRule(r.id)}
                className="p-2.5 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between transition-all cursor-pointer select-none"
              >
                <div className="flex items-center gap-2.5">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-xs font-bold rounded">
                    Port {r.port}
                  </span>
                  <span className="text-xs text-slate-300">{r.description}</span>
                </div>
                <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border ${
                  r.action === "ALLOW"
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                    : "bg-red-500/20 text-red-400 border-red-500/40"
                }`}>
                  {r.action}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Packet Generator Buttons */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-xs font-bold text-slate-200 mb-3">
              إرسال حزم اختبار للشبكة:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                onClick={() => sendPacket(443, "تصفح ويب آمن (HTTPS)", false)}
                disabled={packetState === "in_flight"}
                className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-right text-xs font-bold text-emerald-400 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>طلب HTTPS 🌐</span>
                <span className="text-[10px] font-mono text-slate-400">443</span>
              </button>

              <button
                onClick={() => sendPacket(80, "تصفح عادي (HTTP)", false)}
                disabled={packetState === "in_flight"}
                className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-right text-xs font-bold text-blue-400 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>طلب HTTP 📄</span>
                <span className="text-[10px] font-mono text-slate-400">80</span>
              </button>

              <button
                onClick={() => sendPacket(22, "محاولة اختراق SSH للمشرف", true)}
                disabled={packetState === "in_flight"}
                className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-right text-xs font-bold text-amber-400 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>هجوم SSH 🔑</span>
                <span className="text-[10px] font-mono text-slate-400">22</span>
              </button>

              <button
                onClick={() => sendPacket(3306, "استعلام مباشر لقاعدة البيانات", true)}
                disabled={packetState === "in_flight"}
                className="p-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-right text-xs font-bold text-red-400 transition-all cursor-pointer flex items-center justify-between"
              >
                <span>هجوم MySQL 🗄️</span>
                <span className="text-[10px] font-mono text-slate-400">3306</span>
              </button>
            </div>
          </div>

          {/* Live Stats */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>سجل الفحص:</span>
            <div className="flex gap-3">
              <span className="text-emerald-400 font-bold">مسموح: {stats.allowed}</span>
              <span className="text-red-400 font-bold">محجوب: {stats.dropped}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
