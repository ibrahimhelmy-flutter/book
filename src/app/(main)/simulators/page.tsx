"use client";

import React, { useState } from "react";
import { SimulatorRenderer } from "@/components/simulators/SimulatorRenderer";
import { Sparkles, Cpu, Brain, Lock, Shield, ShieldAlert, Globe, Layout, BarChart3 } from "lucide-react";

export default function SimulatorsPage() {
  const [activeSim, setActiveSim] = useState<string>("moores-law-sim");

  const simulatorsList = [
    {
      id: "moores-law-sim",
      title: "1. محاكي قانون مور والنفق الكمومي",
      category: "الفصل 1 (الدرس 1-1)",
      icon: Cpu,
      color: "border-blue-500 text-blue-400",
      description: "تحليل وتتبع عدد الترانزستورات من Intel 4004 إلى Apple M1 Ultra واكتشاف معضلة النفق الكمومي."
    },
    {
      id: "ai-hierarchy-sim",
      title: "2. هرمية الذكاء الاصطناعي ومختبر الهلوسة",
      category: "الفصل 1 (الدرس 1-2)",
      icon: Brain,
      color: "border-purple-500 text-purple-400",
      description: "استكشاف تداخل AI ⊃ ML ⊃ DL ⊃ GenAI وتجربة رصد هلوسة النماذج اللغوية والتحقق البشري."
    },
    {
      id: "tls-handshake-sim",
      title: "3. محاكي مصافحة TLS وتشفير HTTPS",
      category: "الفصل 2 (الدرس 2-1)",
      icon: Lock,
      color: "border-emerald-500 text-emerald-400",
      description: "تتبع مراحل الاتصال الآمن بالمفتاح العام واشتقاق مفاتيح الجلسة وحماية البيانات من المتنصت."
    },
    {
      id: "network-defense-sim",
      title: "4. مختبر الدفاع في العمق والـ DMZ و Zero Trust",
      category: "الفصل 2 (الدرس 2-2)",
      icon: Shield,
      color: "border-teal-500 text-teal-400",
      description: "بناء وتعديل دفاعات الشبكة واختبار صمود خوادم المؤسسة وقواعد البيانات ضد هجمات الويب والتصيد."
    },
    {
      id: "incident-response-sim",
      title: "5. قائد الاستجابة للحوادث ومصفوفة المخاطر",
      category: "الفصل 2 (الدرس 2-3)",
      icon: ShieldAlert,
      color: "border-red-500 text-red-400",
      description: "إدارة سيناريو هجوم الفدية عبر 6 خطوات (الاحتواء أولاً) وحساب درجة الخطر (التأثير × الاحتمالية)."
    },
    {
      id: "web-request-flow-sim",
      title: "6. مفتش طلبات الويب الثلاثية وصيغة JSON",
      category: "الفصل 3 (الدرس 3-1 و 3-2)",
      icon: Globe,
      color: "border-amber-500 text-amber-400",
      description: "تتبع طلب GET/POST عبر العميل والخادم وقاعدة البيانات وفحص كائنات JSON ورموز 200/404/500."
    },
    {
      id: "crap-design-studio-sim",
      title: "7. استوديو مبادئ التصميم البصري (CRAP)",
      category: "الفصل 4 (الدرس 4-2)",
      icon: Layout,
      color: "border-pink-500 text-pink-400",
      description: "تطبيق التباين، التكرار، المحاذاة، والتقارب لمشاهدة تحول الواجهات السيئة إلى تصميمات معيارية."
    },
    {
      id: "ab-test-lab-sim",
      title: "8. مختبر اختبارات A/B وحلقة PDCA",
      category: "الفصل 4 (الدرس 4-4)",
      icon: BarChart3,
      color: "border-indigo-500 text-indigo-400",
      description: "إجراء تجربة علمية تعزل متغيراً واحداً ومحاكاة 2,000 زائر لحساب CVR ومعدل الارتداد واعتماد القرار."
    }
  ];

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
          مجموعة من 8 محاكيات تفاعلية مصممة هندسياً لترسيخ المفاهيم المعقدة في تكنولوجيا المعلومات والأمن السيبراني وتطبيقات الويب.
        </p>
      </div>

      {/* Simulator Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {simulatorsList.map((sim) => {
          const Icon = sim.icon;
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
                  <div className={`p-2 rounded-xl bg-slate-900 border border-slate-800 ${sim.color}`}>
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
