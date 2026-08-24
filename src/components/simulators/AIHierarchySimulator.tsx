"use client";

import React, { useState } from "react";
import { Sparkles, Brain, Layers, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";

type LevelType = "ai" | "ml" | "dl" | "genai";

export function AIHierarchySimulator() {
  const [selectedLevel, setSelectedLevel] = useState<LevelType>("genai");
  const [hallucinationChecked, setHallucinationChecked] = useState<boolean>(false);

  const levelDetails = {
    ai: {
      title: "الذكاء الاصطناعي (AI)",
      subtitle: "المظلة العامة الشاملة",
      color: "border-blue-500 bg-blue-950/40 text-blue-400",
      description: "أي نظام حاسوبي يحاكي القدرات العقلية البشرية (مثل اتخاذ القرارات، التعرف على الكلام، وحل المشكلات) سواء بقواعد خبيرة برمجية أو بالتعلم الإحصائي.",
      examples: ["محركات الشطرنج الكلاسيكية", "المساعدات الصوتية", "الأنظمة الخبيرة الطبية"],
      layerDepth: 1
    },
    ml: {
      title: "التعلم الآلي (Machine Learning)",
      subtitle: "فرع يتعلم الأنماط من البيانات",
      color: "border-emerald-500 bg-emerald-950/40 text-emerald-400",
      description: "خوارزميات تستخرج القواعد والعلاقات الإحصائية تلقائياً من بيانات سابقة لإجراء تنبؤات أو تصنيفات دون كتابة كود مخصص لكل قاعدة.",
      examples: ["فلترة البريد المزعج (Spam)", "أنظمة توصيات المنتجات", "التنبؤ بأسعار المنازل"],
      layerDepth: 2
    },
    dl: {
      title: "التعلم العميق (Deep Learning)",
      subtitle: "شبكات عصبية اصطناعية متعددة الطبقات",
      color: "border-amber-500 bg-amber-950/40 text-amber-400",
      description: "أسلوب متقدم يعتمد على شبكات عصبية ذات طبقات خفية متعددة (Hidden Layers) لاستخراج ميزات معقدة من البيانات غير المهيكلة كالفيديو والصوت.",
      examples: ["التعرف على وجوه المارة", "تشخيص صور الأشعة السينية", "القيادة الذاتية الفورية"],
      layerDepth: 3
    },
    genai: {
      title: "الذكاء الاصطناعي التوليدي (Generative AI)",
      subtitle: "توليد محتوى جديد من النماذج العميقة",
      color: "border-purple-500 bg-purple-950/40 text-purple-400",
      description: "أنظمة حديثة مبنية في الغالب على نماذج التعلم العميق والنماذج اللغوية الضخمة (LLMs) تقوم بتوليد نصوص وصور وأصوات جديدة ومبتكرة.",
      examples: ["نماذج ChatGPT و Gemini", "توليد الصور عبر Midjourney", "توليد الأكواد البرمجية"],
      layerDepth: 4
    }
  };

  const current = levelDetails[selectedLevel];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">مستكشف هرمية الذكاء الاصطناعي والشبكات العصبية</h3>
            <p className="text-sm text-slate-400">فهم تداخل AI ⊃ ML ⊃ DL ⊃ GenAI ومخاطر الهلوسة</p>
          </div>
        </div>
        <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs font-semibold rounded-full border border-purple-500/20">
          تفاعلي 🧠
        </span>
      </div>

      {/* Hierarchy Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-6">
        {(["ai", "ml", "dl", "genai"] as LevelType[]).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSelectedLevel(lvl)}
            className={`p-3 rounded-xl border text-right transition-all cursor-pointer ${
              selectedLevel === lvl
                ? "bg-slate-800 border-purple-500 ring-2 ring-purple-500/30 font-bold"
                : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            <div className="text-xs text-slate-500 font-mono">المستوى {levelDetails[lvl].layerDepth}</div>
            <div className="text-sm font-semibold mt-0.5 text-white">{levelDetails[lvl].title.split(" ")[0]}</div>
          </button>
        ))}
      </div>

      {/* Active Level Card */}
      <div className={`p-5 rounded-2xl border ${current.color} mb-6 transition-all`}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="text-lg font-bold text-white">{current.title}</h4>
            <p className="text-xs text-slate-300">{current.subtitle}</p>
          </div>
          <span className="p-1.5 bg-slate-900/60 rounded-lg text-white">
            <Layers className="w-4 h-4" />
          </span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed mb-4">{current.description}</p>
        <div>
          <span className="text-xs font-semibold text-slate-300 block mb-1.5">أمثلة وتطبيقات واقعية:</span>
          <div className="flex flex-wrap gap-2">
            {current.examples.map((ex, i) => (
              <span key={i} className="px-2.5 py-1 bg-slate-900/80 rounded-lg text-xs font-medium border border-slate-700/50 text-slate-200">
                • {ex}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Hallucination Lab Interactive Demo */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm mb-3">
          <AlertTriangle className="w-4 h-4" />
          <span>مختبر محاكاة ظاهرة الهلوسة (AI Hallucination Lab)</span>
        </div>

        <div className="bg-slate-900 p-3.5 rounded-lg border border-slate-800 text-sm space-y-2 mb-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>سؤال المستخدم للذكاء الاصطناعي:</span>
          </div>
          <p className="font-semibold text-slate-100">
            "ما هي تفاصيل كتاب 'مستقبل الحوسبة المصرية' الصادر عام 1999 للدكتور أحمد زويل؟"
          </p>
        </div>

        {/* AI Output preview */}
        <div className="bg-purple-950/20 border border-purple-800/40 p-4 rounded-lg text-sm mb-4">
          <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-4 h-4" />
            <span>استجابة الذكاء الاصطناعي التوليدي:</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            "كتاب 'مستقبل الحوسبة المصرية' هو مرجع شهير نشره د. أحمد زويل عام 1999، يتناول فيه 10 فصول حول تطوير رقائق السيليكون في الشرق الأوسط وحصل به على جائزة الدولة التقديرية..."
          </p>
        </div>

        {/* Verification Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            onClick={() => setHallucinationChecked(!hallucinationChecked)}
            className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {hallucinationChecked ? "إخفاء التحقيق" : "فحص وتوثيق الحقيقة (Fact-Check) 🔍"}
          </button>
          <span className="text-xs text-slate-400">المصدر: المراجع الأكاديمية والتوثيق الرسمي</span>
        </div>

        {hallucinationChecked && (
          <div className="mt-4 p-3.5 bg-red-950/40 border border-red-500/40 rounded-xl text-xs space-y-1.5 text-red-200">
            <div className="flex items-center gap-1.5 font-bold text-red-400">
              <CheckCircle className="w-4 h-4" />
              <span>نتيجة الفحص البشري: هلوسة مؤكدة (Hallucination Detected!)</span>
            </div>
            <p>
              د. أحمد زويل حصل على جائزة نوبل في الكيمياء عام 1999 عن أبحاث الفيمتو ثانية، ولم يؤلف كتاباً بهذا الاسم إطلاقاً. لقد قام النموذج بتوليد إجابة لغوية منمقة ومقنعة احصائياً لكنها مختلقة بالكامل.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
