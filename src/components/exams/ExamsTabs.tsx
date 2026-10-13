"use client";

import React from "react";
import { Award, Sparkles, Timer, type LucideIcon } from "lucide-react";
import type { ExamsTab } from "./exams-logic";

interface TabDef {
  id: ExamsTab;
  title: string;
  subtitle: string;
  badge: string;
  Icon: LucideIcon;
  /** Active gradient, idle icon tint, idle badge tint, active subtitle tint. */
  active: string;
  iconIdle: string;
  badgeIdle: string;
  subtitleActive: string;
}

const INDIGO_ACTIVE =
  "bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400/40";

/** Mode switcher: official booklet / direct practice bank / ready-made timed booklets. */
export function ExamsTabs({
  activeTab,
  onChange,
  showOfficial,
  officialTotal,
  practiceTotal,
}: {
  activeTab: ExamsTab;
  onChange: (tab: ExamsTab) => void;
  showOfficial: boolean;
  officialTotal: number;
  practiceTotal: number;
}) {
  const tabs: TabDef[] = [
    ...(showOfficial
      ? [
          {
            id: "official" as const,
            title: "التقييمات الرسمية للوزارة 🏛️",
            subtitle: "كتاب التقييمات والأداءات الرسمية",
            badge: `${officialTotal} سؤالاً`,
            Icon: Award,
            active: INDIGO_ACTIVE,
            iconIdle: "bg-indigo-500/10 text-indigo-400",
            badgeIdle: "text-indigo-400 border border-indigo-500/20",
            subtitleActive: "text-indigo-100",
          },
        ]
      : []),
    {
      id: "practice",
      title: "بنك التدريب المباشر 🎯",
      subtitle: "تدريب فوري مع التغذية الراجعة",
      badge: `${practiceTotal} سؤالاً`,
      Icon: Sparkles,
      active: INDIGO_ACTIVE,
      iconIdle: "bg-emerald-500/10 text-emerald-400",
      badgeIdle: "text-emerald-400 border border-emerald-500/20",
      subtitleActive: "text-indigo-100",
    },
    {
      id: "presets",
      title: "نماذج البوكليت المعتمدة ⏱️",
      subtitle: "امتحانات موقوتة مطابقة للورقة الامتحانية",
      badge: "جاهزة",
      Icon: Timer,
      active:
        "bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white shadow-lg shadow-amber-600/30 ring-2 ring-amber-400/40",
      iconIdle: "bg-amber-500/10 text-amber-400",
      badgeIdle: "text-amber-400 border border-amber-500/20",
      subtitleActive: "text-amber-100",
    },
  ];

  return (
    <div
      role="tablist"
      className={`grid grid-cols-1 ${tabs.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"} gap-3 p-1.5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl`}
    >
      {tabs.map(({ id, title, subtitle, badge, Icon, active, iconIdle, badgeIdle, subtitleActive }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={`p-3.5 sm:p-4 rounded-2xl font-bold text-xs sm:text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${
              isActive ? active : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-xl ${isActive ? "bg-white/20 text-white" : iconIdle}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="font-black text-sm">{title}</div>
                <div className={`text-[11px] font-normal ${isActive ? subtitleActive : "text-slate-400"}`}>{subtitle}</div>
              </div>
            </div>
            <span
              className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full shrink-0 ${
                isActive ? "bg-white/25 text-white" : `bg-slate-800 ${badgeIdle}`
              }`}
            >
              {badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}
