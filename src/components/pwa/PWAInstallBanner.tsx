"use client";

import React, { useState, useEffect } from "react";
import { Download, X, Sparkles, Smartphone, CheckCircle } from "lucide-react";
import { usePWA } from "@/context/PWAContext";
import { getAssetPath } from "@/lib/utils";

const BANNER_STORAGE_KEY = "pwa_install_banner_dismissed_at";
const DISMISS_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

export function PWAInstallBanner() {
  const { isInstalled, promptInstall, canPromptDirectly } = usePWA();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Do not show if already in standalone app mode
    if (isInstalled) {
      setIsVisible(false);
      return;
    }

    // Check if dismissed recently
    try {
      const dismissedAt = localStorage.getItem(BANNER_STORAGE_KEY);
      if (dismissedAt) {
        const timeSinceDismiss = Date.now() - parseInt(dismissedAt, 10);
        if (timeSinceDismiss < DISMISS_COOLDOWN_MS) {
          return;
        }
      }
    } catch {}

    // Delay appearance slightly for smooth experience
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, [isInstalled]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      localStorage.setItem(BANNER_STORAGE_KEY, Date.now().toString());
    } catch {}
  };

  const handleInstallClick = async () => {
    await promptInstall();
    handleDismiss();
  };

  if (!isVisible || isInstalled) return null;

  return (
    <div
      role="banner"
      aria-label="تثبيت المنصة كتطبيق"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-40 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/40 text-white p-4 rounded-2xl shadow-2xl shadow-indigo-950/50 animate-fadeIn space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 p-1.5">
            <img
              src={getAssetPath("/icon.svg")}
              alt="أيقونة المنصة"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white text-xs block">
                تثبيت المنصة كتطبيق على جهازك
              </span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold rounded-md">
                PWA
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-snug mt-0.5">
              استمتع بتشغيل المنهج كنافذة تطبيق مستقلة وتصفحه كاملاً بدون إنترنت.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          title="إغلاق لاحقاً"
          aria-label="إغلاق التنبيه"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleInstallClick}
          className="flex-1 py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>تثبيت التطبيق الآن ⚡</span>
        </button>
        <button
          type="button"
          onClick={handleDismiss}
          className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
        >
          لاحقاً
        </button>
      </div>
    </div>
  );
}
