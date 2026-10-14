/**
 * Metadata and JSON-LD builders shared by app/ routes. Paths are route paths ("/g/…/"); Next resolves
 * them against metadataBase (SITE_URL), and JSON-LD gets absolute URLs through absoluteUrl().
 */
import type { Metadata } from "next";
import type { PartManifest } from "@/types/catalog";
import { bookHref, gradeHref, partHref } from "@/content/paths";
import { SITE_AUTHOR, SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_NAME_EN, SITE_URL, absoluteUrl } from "./site";

const SHARE_IMAGE = { url: "/icon-512.png", width: 512, height: 512, alt: SITE_NAME };

/**
 * Title, description, canonical URL, Open Graph and Twitter tags for one page. Next replaces a layout's
 * openGraph/twitter objects instead of merging them, so every page sets the shared fields again here.
 */
export function pageMetadata({
  title,
  description,
  path,
  keywords,
  type = "website",
}: {
  title?: string;
  description?: string;
  path: string;
  keywords?: string[];
  type?: "website" | "article";
}): Metadata {
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(keywords?.length ? { keywords: keywords.filter(Boolean) } : {}),
    alternates: { canonical: path },
    openGraph: {
      type,
      locale: SITE_LOCALE,
      siteName: SITE_NAME,
      url: path,
      title: title ?? SITE_NAME,
      description: description ?? SITE_DESCRIPTION,
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary",
      title: title ?? SITE_NAME,
      description: description ?? SITE_DESCRIPTION,
      images: [SHARE_IMAGE.url],
    },
  };
}

export interface Crumb {
  name: string;
  path: string;
}

/** Breadcrumb trail down to a part: catalog → grade → book → part. */
export function partTrail(part: PartManifest): Crumb[] {
  const { gradeId, bookSlug } = part.ref;
  return [
    { name: "الكتب الدراسية", path: "/" },
    { name: part.gradeTitle, path: gradeHref(gradeId) },
    { name: part.bookTitle, path: bookHref(gradeId, bookSlug) },
    { name: part.partShortTitle, path: partHref(part.key) },
  ];
}

export function breadcrumbJsonLd(trail: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

const AUTHOR_JSON_LD = {
  "@type": "Person",
  name: SITE_AUTHOR.name,
  alternateName: SITE_AUTHOR.nameEn,
  jobTitle: SITE_AUTHOR.jobTitle,
};

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    alternateName: SITE_NAME_EN,
    url: `${SITE_URL}/`,
    description: SITE_DESCRIPTION,
    inLanguage: "ar",
    publisher: AUTHOR_JSON_LD,
  };
}

/** A textbook lesson page: what it teaches, at which grade, and which Ministry book it follows. */
export function lessonJsonLd({
  part,
  path,
  title,
  englishTitle,
  description,
  objectives,
  keywords,
}: {
  part: PartManifest;
  path: string;
  title: string;
  englishTitle?: string;
  description?: string;
  objectives: string[];
  keywords: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: title,
    ...(englishTitle ? { alternateName: englishTitle } : {}),
    ...(description ? { description } : {}),
    url: absoluteUrl(path),
    inLanguage: "ar",
    learningResourceType: "Lesson",
    educationalLevel: part.gradeTitle,
    ...(objectives.length ? { teaches: objectives } : {}),
    ...(keywords.length ? { keywords: keywords.filter(Boolean).join("، ") } : {}),
    isBasedOn: { "@type": "Book", name: part.bookTitle, inLanguage: "ar" },
    isAccessibleForFree: true,
    publisher: AUTHOR_JSON_LD,
  };
}
