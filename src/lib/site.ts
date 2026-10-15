/**
 * Site identity, in one place: the name shown in the navbar and titles, and the absolute URL used by
 * canonical links, Open Graph, the sitemap and robots.txt. Moving to a new domain only means setting
 * NEXT_PUBLIC_SITE_URL at build time (e.g. "https://learn.ibrahimhelmy.com").
 */
export const SITE_NAME = "أنا الطالب";
export const SITE_NAME_EN = "Ana El-Taleb";
export const SITE_TAGLINE = "منصة مذاكرة تفاعلية لكتب الوزارة";
export const SITE_DESCRIPTION =
  "منصة مذاكرة مستقلة لكتب وزارة التربية والتعليم المصرية: شرح الدروس كما في الكتاب، وكتيبات التقييم الرسمية، وبنوك الأسئلة، والمحاكيات — مرتبة حسب الصف والكتاب والترم، وتعمل بدون إنترنت.";
export const SITE_LOCALE = "ar_EG";

export const SITE_AUTHOR = {
  name: "إبراهيم حلمي",
  nameEn: "Ibrahim Helmy",
  jobTitle: "مهندس برمجيات",
};

/**
 * Google Search Console "HTML tag" verification code (only the content="…" value), set at build time
 * from the GOOGLE_SITE_VERIFICATION repository variable. Empty → no tag is emitted.
 */
export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() ?? "";

/** Absolute site root without a trailing slash; includes the basePath when the site lives under one. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://ibrahimhelmy-flutter.github.io/book").replace(/\/+$/, "");

/** Absolute URL of a route path, e.g. absoluteUrl("/g/secondary-2/") → "https://…/book/g/secondary-2/". */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
