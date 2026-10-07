"use client";

import React from "react";
import { Download, DownloadCloud, Smartphone, CheckCircle, WifiOff, Laptop, Sparkles, ShieldCheck } from "lucide-react";
import { usePWA } from "@/context/PWAContext";

export function HomePWACallout() {
  const { isInstalled, promptInstall, setIsOfflinePackModalOpen, isOfflinePackReady } = usePWA();

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/60 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Text and Badges */}
        <div className="space-y-3 text-right max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              <span>تطبيق PWA أصلي</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <WifiOff className="w-3.5 h-3.5" />
              <span>يعمل 100% بدون إنترنت</span>
            </span>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-bold font-mono">
              ~7.2 MB فقط
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white leading-snug">
            حمّل المنصة كتطبيق على جهازك وذاكر بدون إنترنت في أي مكان
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            ثبّت المنصة مباشرة كبرنامج مستقل على هاتفك (Android / iPhone) أو حاسوبك (Windows / Mac) بنقرة واحدة، لتصفح كافة الدروس والرسوم التوضيحية وحل بنك الامتحانات دون الحاجة لمتصفح أو اتصال بالإنترنت.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              مجاني بالكامل وبدون حساب
            </span>
            <span className="flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-indigo-400" />
              متوافق مع الهواتف والكمبيوتر
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              تحديثات تلقائية ذكية
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
          {!isInstalled ? (
            <button
              type="button"
              onClick={() => promptInstall()}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>تثبيت التطبيق على جهازك 📲</span>
            </button>
          ) : (
            <div className="py-2.5 px-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>التطبيق مثبت ويعمل كبرنامج مستقل ✓</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsOfflinePackModalOpen(true)}
            className={`py-3 px-6 rounded-2xl border text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95 ${
              isOfflinePackReady
                ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30"
                : "bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200"
            }`}
          >
            <DownloadCloud className="w-4 h-4 text-emerald-400" />
            <span>
              {isOfflinePackReady
                ? "المنهج محفوظ محلياً بالكامل ✓"
                : "تنزيل حزمة عدم الاتصال (Offline Pack) ⚡"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
