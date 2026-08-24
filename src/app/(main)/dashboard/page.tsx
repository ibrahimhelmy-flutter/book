"use client";

import React, { useState, useEffect } from "react";
import { UserProgress, UserProfile } from "@/types";
import { getStoredProgress, getStoredProfile, saveProfile, toggleLessonComplete } from "@/lib/storage";
import { CURRICULUM_DATA } from "@/data/curriculum";
import { LayoutDashboard, Award, Bookmark, BookOpen, CheckCircle, Flame, Sparkles, User, School, Clock, Edit2 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>("");
  const [editSchool, setEditSchool] = useState<string>("");

  useEffect(() => {
    const prog = getStoredProgress();
    const prof = getStoredProfile();
    setProgress(prog);
    setProfile(prof);
    setEditName(prof.name);
    setEditSchool(prof.school || "");
  }, []);

  if (!progress || !profile) return null;

  const totalLessons = 14;
  const completedCount = progress.completedLessons.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...profile,
      name: editName,
      school: editSchool,
    };
    saveProfile(updated);
    setProfile(updated);
    setIsEditingProfile(false);
  };

  const handleRoleToggle = () => {
    const newRole = profile.role === "student" ? "teacher" : "student";
    const updated: UserProfile = {
      ...profile,
      role: newRole,
    };
    saveProfile(updated);
    setProfile(updated);
  };

  // Find bookmarked lesson objects
  const bookmarkedLessons = CURRICULUM_DATA.flatMap((ch) =>
    ch.lessons
      .filter((l) => progress.bookmarks.includes(l.id))
      .map((l) => ({ ...l, chapterTitle: ch.title }))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Profile & Role Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-600/30">
              {profile.avatar}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black">{profile.name}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                    profile.role === "teacher"
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                      : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  }`}
                >
                  {profile.role === "teacher" ? "👨‍🏫 وضع المعلم" : "👨‍🎓 وضع الطالب"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <School className="w-3.5 h-3.5" />
                <span>{profile.school || "المدرسة الثانوية"}</span>
                <span>•</span>
                <span>{profile.grade}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5" /> تعديل البيانات
            </button>

            <button
              onClick={handleRoleToggle}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              تبديل لـ {profile.role === "student" ? "المعلم" : "الطالب"}
            </button>
          </div>
        </div>

        {/* Profile Edit Form */}
        {isEditingProfile && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="اسم الطالب أو المعلم"
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
            <input
              type="text"
              value={editSchool}
              onChange={(e) => setEditSchool(e.target.value)}
              placeholder="اسم المدرسة أو الإدارة التعليمية"
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
            >
              حفظ التغييرات
            </button>
          </form>
        )}
      </div>

      {/* Progress & Metrics Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span>نسبة إنجاز المنهج الكامل</span>
            <span className="font-bold font-mono text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-400">
            {completedCount} من أصل {totalLessons} درساً مكتملة
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">نقاط التميز والأوسمة</span>
            <span className="text-2xl font-black text-amber-400 font-mono">{progress.points} نقطة</span>
            <div className="text-[11px] text-slate-500 mt-1">تزداد مع حل التمارين والاختبارات</div>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Award className="w-8 h-8" />
          </div>
        </div>

        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">الالتزام اليومي المستمر</span>
            <span className="text-2xl font-black text-orange-400 font-mono">{progress.streakDays} يوم متتالي</span>
            <div className="text-[11px] text-slate-500 mt-1">حافظ على نشاطك اليومي</div>
          </div>
          <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl border border-orange-500/20">
            <Flame className="w-8 h-8 fill-orange-400" />
          </div>
        </div>
      </div>

      {/* Badges Earned */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>أوسمة الإنجاز الأكاديمي (Badges):</span>
        </h2>
        <div className="flex flex-wrap gap-2.5">
          {progress.badges.map((badge, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-slate-950 border border-purple-500/40 text-purple-200 text-xs font-bold rounded-xl flex items-center gap-1.5"
            >
              <span>{badge}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Bookmarks Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-pink-400" />
          <span>الدروس المحفوظة في الإشارات المرجعية ({bookmarkedLessons.length}):</span>
        </h2>

        {bookmarkedLessons.length === 0 ? (
          <p className="text-xs text-slate-500">لم تقم بحفظ أي دروس في الإشارات المرجعية بعد.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {bookmarkedLessons.map((l) => (
              <Link
                key={l.id}
                href={`/chapters/${l.chapterId}/${l.slug}`}
                className="p-4 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 rounded-xl flex items-center justify-between group transition-all block"
              >
                <div>
                  <span className="text-[10px] font-mono text-pink-400 font-bold block">الدرس {l.number}</span>
                  <span className="text-xs font-bold text-white group-hover:text-pink-300">{l.title}</span>
                </div>
                <BookOpen className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quiz Scores Log */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-400" />
          <span>سجل نتائج الاختبارات والتمارين المصححة:</span>
        </h2>

        {Object.keys(progress.quizScores).length === 0 ? (
          <p className="text-xs text-slate-500">لم تقم بحل أي اختبارات بعد. توجه لأي درس وانقر على تبويب 'تمارين واختبار الدرس'.</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(progress.quizScores).map(([lessonId, record]) => (
              <div key={lessonId} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                <span className="font-mono text-slate-300">اختبار {lessonId}</span>
                <span className="px-2.5 py-0.5 bg-emerald-950 text-emerald-300 rounded font-mono font-bold border border-emerald-500/30">
                  {record.score} / {record.total} ({Math.round((record.score / record.total) * 100)}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
