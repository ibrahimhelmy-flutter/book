"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Share,
  PlusSquare,
  Monitor,
  Smartphone,
  CheckCircle2,
  X,
  Sparkles,
  WifiOff,
  Laptop,
  ChevronLeft,
} from "lucide-react";
import { usePWA } from "@/context/PWAContext";
import { getAssetPath } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function PWAInstallModal({ isOpen, onClose }: Props) {
  const {
    platform,
    isInstalled,
    canPromptDirectly,
    promptInstall,
    setIsOfflinePackModalOpen,
  } = usePWA();

  const [activeTab, setActiveTab] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    if (platform === "ios") setActiveTab("ios");
    else if (platform === "android") setActiveTab("android");
    else setActiveTab("desktop");
  }, [platform]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center p-2 shrink-0">
              <img
                src={getAssetPath("/icon.svg")}
                alt="أيقونة التطبيق"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  تثبيت المنصة كتطبيق (PWA)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                  بدون إنترنت ⚡
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                شغّل المنهج كتطبيق مستقل على هاتفك أو حاسوبك
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Installed Success Banner if already installed */}
        {isInstalled && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-2xl flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <div className="font-bold text-emerald-300">التطبيق مثبت بالفعل على جهازك! 🎉</div>
              <div className="text-slate-300 text-[11px] mt-0.5">
                أنت الآن تشغّل المنصة في نافذة التطبيق المستقلة.
              </div>
            </div>
          </div>
        )}

        {/* Quick One-Click Direct Install (if browser supports beforeinstallprompt) */}
        {canPromptDirectly && !isInstalled && (
          <div className="p-4 bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-indigo-300">
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                متصفحك يدعم التثبيت الفوري بنقرة واحدة
              </span>
            </div>
            <button
              type="button"
              onClick={async () => {
                await promptInstall();
              }}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>تثبيت التطبيق الآن على الجهاز (بنقرة واحدة)</span>
            </button>
          </div>
        )}

        {/* Platform Selection Tabs */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>طريقة التثبيت حسب جهازك:</span>
            {platform !== "other" && (
              <span className="text-[10px] text-indigo-400 font-mono bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-500/30">
                جهازك المكتشف: {platform === "ios" ? "آيفون/آيباد" : platform === "android" ? "أندرويد" : "حاسوب (كمبيوتر)"}
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("desktop")}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "desktop"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              <span>كمبيوتر</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("android")}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "android"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>أندرويد</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ios")}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === "ios"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-900"
              }`}
            >
              <span className="text-sm leading-none">🍎</span>
              <span>آيفون / آيباد</span>
            </button>
          </div>

          {/* Tab 1: Desktop (Chrome / Edge / Windows / Mac) */}
          {activeTab === "desktop" && (
            <div className="space-y-3 p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl animate-fadeIn">
              <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Monitor className="w-4 h-4" />
                <span>طريقة التثبيت على الكمبيوتر (Windows / Mac / Linux):</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-white block">من شريط العنوان بالمتصفح (Chrome أو Edge):</span>
                    <span className="text-slate-400 text-[11px]">
                      انقر على أيقونة التثبيت <span className="text-indigo-400 font-mono font-bold">⊕</span> أو شاشة الكمبيوتر الصغيرة الموجودة في أقصى يمين شريط العنوان.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-white block">أو عبر قائمة المتصفح (⋮):</span>
                    <span className="text-slate-400 text-[11px]">
                      افتح قائمة المتصفح الثلاثية ➔ اختر <span className="text-white font-bold">تثبيت المنصة كتطبيق</span> (Install App).
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-white block">التشغيل الفوري:</span>
                    <span className="text-slate-400 text-[11px]">
                      سيفتح التطبيق في نافذة مستقلة مع إنشاء اختصار مباشر على سطح المكتب وقائمة ابدأ.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Android */}
          {activeTab === "android" && (
            <div className="space-y-3 p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl animate-fadeIn">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" />
                <span>طريقة التثبيت على هواتف أندرويد (Chrome / Edge / Samsung):</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-white block">افتح قائمة المتصفح:</span>
                    <span className="text-slate-400 text-[11px]">
                      انقر على النقاط الثلاث <span className="font-mono text-white font-bold">(⋮)</span> في الزاوية العلوية لمتصفح Chrome.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-white block">اختر "تثبيت التطبيق":</span>
                    <span className="text-slate-400 text-[11px]">
                      اختر <span className="text-emerald-400 font-bold">"تثبيت التطبيق" (Install App)</span> أو "إضافة إلى الشاشة الرئيسية".
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-emerald-600/30 text-emerald-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-white block">تأكيد التثبيت:</span>
                    <span className="text-slate-400 text-[11px]">
                      اضغط "تثبيت" وسيظهر التطبيق بين تطبيقات هاتفك كبرنامج رسمي يعمل دون إنترنت.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: iOS (iPhone / iPad Safari) */}
          {activeTab === "ios" && (
            <div className="space-y-3 p-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl animate-fadeIn">
              <div className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                <Share className="w-4 h-4 text-indigo-400" />
                <span>طريقة التثبيت على أجهزة Apple (Safari على iPhone / iPad):</span>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300">
                <div className="flex items-start gap-3 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <span className="font-bold text-white block">اضغط على زر المشاركة:</span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      اضغط زر <Share className="w-3.5 h-3.5 text-indigo-400 inline" /> في أسفل شاشة Safari.
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <span className="font-bold text-white block">اختر "إضافة إلى الشاشة الرئيسية":</span>
                    <span className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      مرر القائمة لأسفل واختر <PlusSquare className="w-3.5 h-3.5 text-indigo-400 inline" /> <span className="text-white font-bold">"إضافة إلى الصفحة الرئيسية"</span> (Add to Home Screen).
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 bg-slate-900/60 rounded-xl border border-slate-800">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-300 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <span className="font-bold text-white block">تأكيد الإضافة:</span>
                    <span className="text-slate-400 text-[11px]">
                      اضغط على <span className="text-indigo-400 font-bold">"إضافة" (Add)</span> في الزاوية العلوية للشاشة.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Value Proposition Grid */}
        <div className="grid grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white block text-[11px]">يعمل بدون إنترنت</span>
              <span className="text-slate-400 text-[10px]">تصفح وحل تمارين دون شبكة</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="font-bold text-white block text-[11px]">واجهة تطبيق أصلي</span>
              <span className="text-slate-400 text-[10px]">شاشة كاملة بدون شريط متصفح</span>
            </div>
          </div>
        </div>

        {/* Offline Pack Integration Link */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-400 text-[11px]">
            لتحميل كافة الدروس والرسوم الـ 48 للعمل بدون اتصال:
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              setIsOfflinePackModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0"
          >
            <span>حزمة عدم الاتصال</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
