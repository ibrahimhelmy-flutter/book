"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log unexpected runtime client exceptions safely
    console.error("Application Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white">حدث خطأ غير متوقع</h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            واجه المتصفح مشكلة أثناء معالجة المحتوى. يمكنك إعادة المحاولة أو العودة إلى الصفحة الرئيسية.
          </p>
        </div>

        {error.digest && (
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-500">
            رمز الخطأ: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>

          <Link
            href="/"
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>الصفحة الرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
