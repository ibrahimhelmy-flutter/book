import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findBook, gradeHref, staticParams } from "@/content";
import { BookCard } from "@/components/catalog/BookCard";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";

interface Props {
  params: Promise<{ gradeId: string; bookSlug: string }>;
}

export function generateStaticParams() {
  return staticParams.books();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gradeId, bookSlug } = await params;
  const found = findBook(gradeId, bookSlug);
  return found ? { title: `${found.book.title} — ${found.grade.title}`, description: found.book.description } : {};
}

export default async function BookPage({ params }: Props) {
  const { gradeId, bookSlug } = await params;
  const found = findBook(gradeId, bookSlug);
  if (!found) notFound();
  const { grade, book } = found;

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">
      <Breadcrumbs items={[{ label: "الكتب الدراسية", href: "/" }, { label: grade.title, href: gradeHref(grade.id) }, { label: book.title }]} />
      {book.accreditation && book.accreditation.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {book.accreditation.map((badge) => (
            <span key={badge} className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
              {badge}
            </span>
          ))}
        </div>
      )}
      <BookCard gradeId={grade.id} book={book} />
    </div>
  );
}
