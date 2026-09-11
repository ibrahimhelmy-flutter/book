"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, ShieldCheck, User, School, BookOpen } from "lucide-react";
import { getStoredProfile, saveProfile } from "@/lib/storage";
import { CURRENT_BOOK } from "@/data/books";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [school, setSchool] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");

  useEffect(() => {
    const existing = getStoredProfile();
    setName(existing.name || "");
    setSchool(existing.school || "");
    setRole(existing.role || "student");
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({
      id: `user_${Date.now()}`,
      name: name.trim() || (role === "student" ? "طالب المرحلة الثانوية" : "أستاذ المادة"),
      email: role === "student" ? "student@moe.edu.eg" : "teacher@moe.edu.eg",
      role: role,
      grade: CURRENT_BOOK.grade,
      school: school.trim() || "مدرسة المتفوقين للعلوم والتكنولوجيا",
      avatar: role === "student" ? "🎓" : "👨‍🏫",
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30 mb-2">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black">بدء تجربة التعلم الرقمي</h1>
          <p className="text-xs text-slate-400">
            انضم لمنصة {CURRENT_BOOK.title} التفاعلية ({CURRENT_BOOK.grade})
          </p>
        </div>

        {/* Local Storage Privacy Notice */}
        <div className="p-3.5 bg-purple-950/40 border border-purple-500/30 rounded-2xl text-xs text-purple-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            المنهاج متاح مجاناً للجميع بدون حسابات أو كلمات مرور. يمكنك تخصيص اسمك ومدرستك لتخصيص لوحة تقدمك المحلية.
          </p>
        </div>

        {/* Role Selector */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              role === "student" ? "bg-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            👨‍🎓 حساب طالب
          </button>
          <button
            type="button"
            onClick={() => setRole("teacher")}
            className={`py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              role === "teacher" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            👨‍🏫 حساب معلم
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">الاسم الكامل أو المستعار:</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أدخل اسمك الكريم"
                className="w-full pr-10 pl-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">اسم المدرسة (اختياري):</label>
            <div className="relative">
              <School className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="اسم مدرستك الثانوية"
                className="w-full pr-10 pl-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>بدء الدراسة والانتقال للوحة الإنجاز</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <Link href="/" className="text-purple-400 hover:underline inline-flex items-center gap-1 font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>تصفح المنهاج مباشرة دون تسجيل</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
