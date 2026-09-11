import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { CURRENT_BOOK } from "@/data/books";
import { PWARegister } from "@/components/pwa/PWARegister";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#020617",
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-curriculum.edu.eg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${CURRENT_BOOK.title} | ${CURRENT_BOOK.grade} (${CURRENT_BOOK.term})`,
    template: `%s | ${CURRENT_BOOK.title}`,
  },
  description: CURRENT_BOOK.description,
  keywords: ["الذكاء الاصطناعي", "الأمن السيبراني", "تطبيقات الويب", "تصميم الويب", "الثانوية العامة", "مصر", CURRENT_BOOK.title, CURRENT_BOOK.grade],
  authors: [{ name: "وزارة التربية والتعليم والتعليم الفني - جمهورية مصر العربية" }],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: siteUrl,
    title: `${CURRENT_BOOK.title} | ${CURRENT_BOOK.grade}`,
    description: CURRENT_BOOK.description,
    siteName: CURRENT_BOOK.title,
  },
  twitter: {
    card: "summary_large_image",
    title: `${CURRENT_BOOK.title} | ${CURRENT_BOOK.grade}`,
    description: CURRENT_BOOK.description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`dark ${cairo.variable}`} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${cairo.className} min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col selection:bg-indigo-600 selection:text-white`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none"
        >
          تخطي إلى المحتوى الرئيسي
        </a>
        <Navbar />
        <main id="main-content" className="flex-1 flex flex-col w-full min-w-0">
          {children}
        </main>
        <PWARegister />
      </body>
    </html>
  );
}
