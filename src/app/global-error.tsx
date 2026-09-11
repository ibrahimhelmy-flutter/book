"use client";

import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white">خطأ نظام غير متوقع</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              تعذر تحميل الإطار الأساسي للتطبيق. يُرجى إعادة المحاولة لتحديث الصفحة.
            </p>
          </div>

          {error?.digest && (
            <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-500">
              {error.digest}
            </div>
          )}

          <button
            type="button"
            onClick={() => reset()}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>تحديث الصفحة بالكامل</span>
          </button>
        </div>
      </body>
    </html>
  );
}
