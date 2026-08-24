import React from "react";
import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
        <FileQuestion className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-2">الصفحة غير موجودة</h1>
      <p className="text-slate-400 max-w-md mb-8 text-sm">
        عذراً، الصفحة التي تبحث عنها غير متوفرة أو ربما تم نقلها.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-colors flex items-center gap-2"
      >
        <span>العودة للرئيسية</span>
        <ArrowLeft className="w-4 h-4" />
      </Link>
    </div>
  );
}
