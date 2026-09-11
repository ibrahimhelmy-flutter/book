"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { BookOpen, Sparkles, BookA, Award, LayoutDashboard, Search, Menu, X, DownloadCloud } from "lucide-react";
import { CURRENT_BOOK } from "@/data/books";
import { BookSelector } from "../common/BookSelector";

const SearchModal = dynamic(
  () => import("../common/SearchModal").then((mod) => mod.SearchModal),
  { ssr: false }
);

const LessonsIndexDrawer = dynamic(
  () => import("../common/LessonsIndexDrawer").then((mod) => mod.LessonsIndexDrawer),
  { ssr: false }
);

const OfflinePackModal = dynamic(
  () => import("../pwa/OfflinePackModal").then((mod) => mod.OfflinePackModal),
  { ssr: false }
);

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isOfflinePackOpen, setIsOfflinePackOpen] = useState(false);

  // Automatically scroll to the very top on every screen navigation
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "الرئيسية", icon: BookOpen },
    { href: "/simulators", label: "المحاكيات التفاعلية", icon: Sparkles },
    { href: "/glossary", label: "المصطلحات", icon: BookA },
    { href: "/exams", label: "الامتحانات", icon: Award },
    { href: "/dashboard", label: "لوحة الإنجاز", icon: LayoutDashboard },
  ];

  return (
    <>
      {/* Simple, Non-fixed Clean Header */}
      <header className="w-full bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Clean Brand Title */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md group-hover:bg-indigo-500 transition-colors">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <span>{CURRENT_BOOK.title}</span>
                  </div>
                </div>
              </Link>
              
              <BookSelector variant="compact" />
            </div>

            {/* Clear, Minimal Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "text-slate-300 hover:text-white hover:bg-slate-900"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              {/* Search button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-2 text-xs"
                title="بحث (Ctrl+K)"
              >
                <Search className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline text-slate-400">بحث...</span>
              </button>

              {/* Lessons Index Drawer Launcher */}
              <button
                type="button"
                onClick={() => setIsIndexOpen(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
                title="فتح فهرس الدروس والمنهج"
                aria-label="فهرس الدروس"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">فهرس الدروس</span>
              </button>

              {/* Offline Pack Download Launcher (Desktop) */}
              <button
                type="button"
                onClick={() => setIsOfflinePackOpen(true)}
                className="hidden sm:flex px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-bold transition-all cursor-pointer items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95"
                title="تحميل المنهج كاملاً للعمل بدون إنترنت (~7.2 MB)"
                aria-label="تحميل المنهج بدون إنترنت"
              >
                <DownloadCloud className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">بدون إنترنت</span>
              </button>

              {/* Offline Pack Download Launcher (Mobile compact) */}
              <button
                type="button"
                onClick={() => setIsOfflinePackOpen(true)}
                className="sm:hidden p-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 transition-colors cursor-pointer"
                title="تحميل المنهج بدون إنترنت"
                aria-label="تحميل المنهج بدون إنترنت"
              >
                <DownloadCloud className="w-4 h-4" />
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 p-3 space-y-1">
            {/* Direct Quick Index in Mobile Menu */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsIndexOpen(true);
              }}
              className="w-full p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors text-indigo-300 bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/30 text-right cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>فهرس المنهج والدروس 📚</span>
            </button>

            {/* Offline Pack Action in Mobile Menu */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsOfflinePackOpen(true);
              }}
              className="w-full p-2.5 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors text-emerald-300 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-right cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4 text-emerald-400" />
              <span>تحميل المنهج بدون إنترنت (Offline Pack) ⚡</span>
            </button>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors block ${
                    isActive ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Lessons Index Drawer */}
      <LessonsIndexDrawer isOpen={isIndexOpen} onClose={() => setIsIndexOpen(false)} />

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Offline Pack Modal */}
      <OfflinePackModal isOpen={isOfflinePackOpen} onClose={() => setIsOfflinePackOpen(false)} />
    </>
  );
}
