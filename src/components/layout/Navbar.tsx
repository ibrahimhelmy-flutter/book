"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Sparkles, BookA, Award, LayoutDashboard, Search, Menu, X } from "lucide-react";
import { SearchModal } from "../common/SearchModal";

export function Navbar() {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md group-hover:bg-indigo-500 transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <span>البرمجة والذكاء الاصطناعي</span>
                  <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                    2 ثانوي
                  </span>
                </div>
              </div>
            </Link>

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

              {/* Profile / Dashboard Quick Link */}
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <span>حسابي 🎓</span>
              </Link>

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

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
