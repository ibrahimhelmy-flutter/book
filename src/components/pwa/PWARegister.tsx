"use client";

import React, { useEffect, useState } from "react";
import { getAssetPath } from "@/lib/utils";
import { WifiOff, Sparkles, RefreshCw } from "lucide-react";

export function PWARegister() {
  const [isOffline, setIsOffline] = useState(false);
  const [updateWaitingWorker, setUpdateWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    // 1. Initial online status check
    if (typeof window !== "undefined") {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      // 2. Register Service Worker
      if ("serviceWorker" in navigator) {
        const swPath = getAssetPath("/sw.js");
        const scope = getAssetPath("/");

        navigator.serviceWorker
          .register(swPath, { scope })
          .then((registration) => {
            // Check if there's already a waiting worker
            if (registration.waiting) {
              setUpdateWaitingWorker(registration.waiting);
            }

            // Check for future updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
                    // Polite notification: set waiting worker
                    setUpdateWaitingWorker(registration.waiting || installingWorker);
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.warn("PWA Service Worker registration error:", error);
          });
      }

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }
  }, []);

  const handleApplyUpdate = () => {
    if (updateWaitingWorker) {
      updateWaitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  };

  return (
    <>
      {/* Update Available Polite Banner */}
      {updateWaitingWorker && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-indigo-950/95 backdrop-blur-md border border-indigo-500/50 text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-white block">تحديث جديد متوفر 🚀</span>
              <span className="text-slate-300 text-[11px]">يتوفر إصدار أحدث للمنصة والمنهج.</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleApplyUpdate}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>تحديث الآن</span>
          </button>
        </div>
      )}

      {/* Offline Mode Banner */}
      {isOffline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 bg-slate-900/95 backdrop-blur-md border border-amber-500/40 text-white p-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <WifiOff className="w-5 h-5" />
          </div>
          <div className="text-right flex-1 min-w-0">
            <div className="text-xs font-bold text-amber-300">أنت تتصفح في الوضع بدون إنترنت</div>
            <div className="text-[11px] text-slate-300 truncate">
              يمكنك قراءة الدروس وحل التمارين المحفوظة محلياً.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
