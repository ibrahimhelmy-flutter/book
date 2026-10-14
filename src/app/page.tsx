import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap, Library } from "lucide-react";
import { getCatalog, gradeHref } from "@/content";
import { BookCard } from "@/components/catalog/BookCard";
import { HomePWACallout } from "@/components/home/HomePWACallout";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ path: "/" });

export default function CatalogHomePage() {
  const { grades } = getCatalog();
  const bookCount = grades.reduce((n, g) => n + g.books.length, 0);

  return (
    <div className="flex-1 bg-slate-950 text-white">
      <JsonLd data={websiteJsonLd()} />
      <section className="relative overflow-hidden pt-12 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/30 via-slate-950 to-slate-950 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-5">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Library className="w-3.5 h-3.5" />
            {grades.length} صفوف • {bookCount} كتب
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            اختر <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">صفك الدراسي</span> وابدأ المذاكرة
          </h1>
          <p className="max-w-2xl mx-auto text-slate-300 text-sm sm:text-base leading-relaxed">
            كل كتاب مقسّم إلى أجزائه (الترم الأول والثاني)، ومعه كتيبات التقييم الرسمية — بنفس طريقة عرض الشرح والأسئلة.
          </p>
          {grades.length > 1 && (
            <nav className="flex flex-wrap justify-center gap-2 pt-2" aria-label="الصفوف الدراسية">
              {grades.map((g) => (
                <a key={g.id} href={`#${g.id}`} className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white">
                  {g.title}
                </a>
              ))}
            </nav>
          )}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <HomePWACallout />
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {grades.map((grade) => (
          <section key={grade.id} id={grade.id} className="space-y-5 scroll-mt-20">
            <header className="flex items-end justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-500">{grade.stage}</span>
                  <h2 className="text-xl sm:text-2xl font-black">{grade.title}</h2>
                </div>
              </div>
              <Link href={gradeHref(grade.id)} className="text-xs font-bold text-indigo-300 hover:text-white">
                كل كتب الصف ←
              </Link>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {grade.books.map((book) => (
                <BookCard key={book.slug} gradeId={grade.id} book={book} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
