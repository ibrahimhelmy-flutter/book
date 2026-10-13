import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { findGrade, staticParams } from "@/content";
import { BookCard } from "@/components/catalog/BookCard";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";

interface Props {
  params: Promise<{ gradeId: string }>;
}

export function generateStaticParams() {
  return staticParams.grades();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const grade = findGrade((await params).gradeId);
  return grade ? { title: `كتب ${grade.title}`, description: grade.books.map((b) => b.title).join("، ") } : {};
}

export default async function GradePage({ params }: Props) {
  const grade = findGrade((await params).gradeId);
  if (!grade) notFound();

  return (
    <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Breadcrumbs items={[{ label: "الكتب الدراسية", href: "/" }, { label: grade.title }]} />
      <header className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
          <GraduationCap className="w-7 h-7" />
        </div>
        <div>
          <span className="text-xs font-bold text-slate-500">{grade.stage}</span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{grade.title}</h1>
        </div>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {grade.books.map((book) => (
          <BookCard key={book.slug} gradeId={grade.id} book={book} />
        ))}
      </div>
    </div>
  );
}
