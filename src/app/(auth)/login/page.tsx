"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft, ShieldCheck, User, School, BookOpen } from "lucide-react";
import { getStoredProfile, saveProfile } from "@/lib/storage";
import { CURRENT_BOOK } from "@/data/books";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("طالب المرحلة الثانوية");
  const [school, setSchool] = useState("مدرسة المتفوقين للعلوم والتكنولوجيا");
  const [role, setRole] = useState<"student" | "teacher">("student");

  useEffect(() => {
    const existing = getStoredProfile();
    setName(existing.name || "طالب المرحلة الثانوية");
    setSchool(existing.school || "مدرسة المتفوقين للعلوم والتكنولوجيا");
    setRole(existing.role || "student");
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({
      id: `user_${Date.now()}`,
      name: name.trim() || (role === "student" ? "طالب المرحلة الثانوية" : "أستاذ المادة"),
      email: role === "student" ? "student@moe.edu.eg" : "teacher@moe.edu.eg",
      role: role,
      grade: CURRENT_BOOK.grade,
      school: school.trim() || "المدرسة الثانوية",
      avatar: role === "student" ? "🎓" : "👨‍🏫",
    });
    router.push("/dashboard");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30 mb-2">
            <Sparkles className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black">إعداد الملف الدراسي الشخصي</h1>
          <p className="text-xs text-slate-400">
            منصة {CURRENT_BOOK.title} ({CURRENT_BOOK.grade})
          </p>
        </div>

        {/* Local Storage Privacy Notice */}
        <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl text-xs text-indigo-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            المنصة مرجع تعليمي حر ومفتوح لجميع الطلاب بدون أي كلمات مرور أو خوادم خلفية. يُحفظ تقدمك الدراسي محلياً على جهازك بأمان تام.
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

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">الاسم المستعار أو الكامل:</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="اسمك الكريم"
                className="w-full pr-10 pl-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">اسم المدرسة أو المعهد:</label>
            <div className="relative">
              <School className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="اسم مدرستك الثانوية"
                className="w-full pr-10 pl-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>حفظ الملف والانتقال للوحة الإنجاز</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/80">
          <Link href="/" className="text-indigo-400 hover:underline inline-flex items-center gap-1 font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>تصفح المنهاج مباشرة دون تسجيل</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
