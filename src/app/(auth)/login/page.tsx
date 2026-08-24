"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Lock, Mail, ArrowLeft, ShieldCheck, User } from "lucide-react";
import { saveProfile } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("student@moe.edu.eg");
  const [password, setPassword] = useState("password123");
  const [role, setRole] = useState<"student" | "teacher">("student");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    saveProfile({
      id: `user_${Date.now()}`,
      name: role === "student" ? "طالب الثانوية العامة" : "أستاذ المادة",
      email: email,
      role: role,
      grade: "الصف الثاني الثانوي (بكالوريا)",
      school: "مدرسة المتفوقين للعلوم والتكنولوجيا",
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
          <h1 className="text-2xl font-black">تسجيل الدخول للمنهاج الرقمي</h1>
          <p className="text-xs text-slate-400">
            مرحباً بك في منصة البرمجة والذكاء الاصطناعي (البكالوريا المصرية)
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

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">البريد الإلكتروني المدرسي الموحد:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@moe.edu.eg"
                className="w-full pr-10 pl-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1.5 font-medium">كلمة المرور:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pr-10 pl-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
          >
            دخول للمنصة 🚀
          </button>
        </form>

        <div className="text-center text-xs text-slate-400">
          <span>ليس لديك حساب بعد؟ </span>
          <Link href="/register" className="text-indigo-400 hover:underline font-bold">
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    </div>
  );
}
