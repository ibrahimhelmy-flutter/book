"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, Mail, User, School, ArrowLeft } from "lucide-react";
import { saveProfile } from "@/lib/storage";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [school, setSchool] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({
      id: `user_${Date.now()}`,
      name: name || "طالب الثانوية العامة",
      email: email || "student@moe.edu.eg",
      role: role,
      grade: "الصف الثاني الثانوي (بكالوريا)",
      school: school || "مدرسة المتفوقين للعلوم والتكنولوجيا",
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
          <h1 className="text-2xl font-black">إنشاء حساب دراسي جديد</h1>
          <p className="text-xs text-slate-400">
            انضم لمنصة منهاج البرمجة والذكاء الاصطناعي التفاعلية
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

        <form onSubmit={handleRegister} className="space-y-3.5">
          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">الاسم الكامل:</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="أحمد محمود السيد"
                className="w-full pr-10 pl-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">المدرسة أو الإدارة التعليمية:</label>
            <div className="relative">
              <School className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                placeholder="مدرسة الأورمان الثانوية العسكرية"
                className="w-full pr-10 pl-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">البريد الإلكتروني:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@moe.edu.eg"
                className="w-full pr-10 pl-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1 font-medium">كلمة المرور:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-10 pl-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl shadow-purple-600/30 transition-all cursor-pointer mt-2"
          >
            إنشاء الحساب وبدء التعلم 🚀
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          <span>لديك حساب بالفعل؟ </span>
          <Link href="/login" className="text-purple-400 hover:underline font-bold">
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
