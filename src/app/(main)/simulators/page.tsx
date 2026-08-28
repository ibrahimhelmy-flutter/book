"use client";

import React, { useState } from "react";
import { SimulatorRenderer } from "@/components/simulators/SimulatorRenderer";
import { SIMULATORS_DATA } from "@/data/simulators";
import { Sparkles, Cpu, Brain, Lock, Shield, ShieldAlert, Globe, Layout, BarChart3, LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Cpu: Cpu,
  Brain: Brain,
  Lock: Lock,
  Shield: Shield,
  ShieldAlert: ShieldAlert,
  Globe: Globe,
  Layout: Layout,
  BarChart3: BarChart3,
};

export default function SimulatorsPage() {
  const [activeSim, setActiveSim] = useState<string>(SIMULATORS_DATA[0]?.id || "moores-law-sim");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-2xl mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-2">
          <Sparkles className="w-4 h-4" />
          <span>المعمل التفاعلي الرقمي</span>
        </div>
        <h1 className="text-3xl font-black mb-2">معمل المحاكيات والتجارب الحية</h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          مجموعة من {SIMULATORS_DATA.length} محاكيات تفاعلية مصممة هندسياً لترسيخ المفاهيم المعقدة في تكنولوجيا المعلومات والأمن السيبراني وتطبيقات الويب.
        </p>
      </div>

      {/* Simulator Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {SIMULATORS_DATA.map((sim) => {
          const Icon = (sim.iconName && ICON_MAP[sim.iconName]) ? ICON_MAP[sim.iconName] : Cpu;
          const isSelected = activeSim === sim.id;

          return (
            <button
              key={sim.id}
              onClick={() => setActiveSim(sim.id)}
              className={`p-4 rounded-2xl border text-right transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg"
                  : "bg-slate-950/70 hover:bg-slate-900/60 border-slate-800 text-slate-400"
              }`}
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${sim.color || "border-indigo-500 text-indigo-400"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{sim.category}</span>
                </div>
                <h4 className="font-bold text-xs sm:text-sm text-white mb-1">{sim.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">{sim.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Simulator Viewer */}
      <div className="animate-fadeIn">
        <SimulatorRenderer simulatorId={activeSim} />
      </div>
    </div>
  );
}
