import React from "react";
import type { Metadata } from "next";
import { ClipboardCheck } from "lucide-react";
import { companionHref, partHref, requireCompanion, staticParams, type PartRouteParams } from "@/content";
import { breadcrumbJsonLd, pageMetadata, partTrail } from "@/lib/seo";
import { Breadcrumbs } from "@/components/catalog/Breadcrumbs";
import { CompanionToc } from "@/components/companion/CompanionToc";
import { JsonLd } from "@/components/seo/JsonLd";

interface Props {
  params: Promise<PartRouteParams & { companionSlug: string }>;
}

export function generateStaticParams() {
  return staticParams.companions();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { part, companion } = requireCompanion(await params);
  return pageMetadata({
    title: `${companion.title} | ${part.bookTitle} — ${part.partShortTitle}`,
    description: `${companion.lessons.length} درسًا • ${companion.totalQuestions} سؤالًا رسميًا مع الإجابات النموذجية وأرقام الصفحات في الكتيب والكتاب المدرسي.`,
    path: companionHref(part.key, companion.slug),
  });
}

export default async function CompanionHomePage({ params }: Props) {
  const { part, companion } = requireCompanion(await params);

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8 space-y-6">
      <JsonLd data={breadcrumbJsonLd([...partTrail(part), { name: companion.title, path: companionHref(part.key, companion.slug) }])} />
      <Breadcrumbs items={[{ label: `${part.bookTitle} — ${part.partShortTitle}`, href: partHref(part.key) }, { label: companion.title }]} />
      <header className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
          <ClipboardCheck className="w-4 h-4" />
          <span>كتاب مرافق — {part.partTitle}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">{companion.title}</h1>
        <p className="text-sm text-slate-300">
          {companion.lessons.length} درسًا • {companion.totalQuestions} سؤالًا رسميًا مع الإجابات النموذجية وأرقام الصفحات في الكتيب والكتاب المدرسي.
        </p>
      </header>
      <CompanionToc partKey={part.key} companion={companion} chapters={part.chapters} />
    </div>
  );
}
