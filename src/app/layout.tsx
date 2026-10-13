import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ActivePartProvider } from "@/components/layout/PartProvider";
import { PWARegister } from "@/components/pwa/PWARegister";
import { PWAProvider } from "@/context/PWAContext";
import { getNavCatalog } from "@/content";

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

const isProd = process.env.NODE_ENV === "production";
const isVercel = process.env.VERCEL === "1";
const isNetlify = process.env.NETLIFY === "true";
const isGitHubPages = !isVercel && !isNetlify && (process.env.GITHUB_ACTIONS === "true" || isProd);
const basePath = process.env.NEXT_PUBLIC_BASE_PATH !== undefined
  ? process.env.NEXT_PUBLIC_BASE_PATH
  : (isGitHubPages ? "/book" : "");

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ai-curriculum.edu.eg";
const SITE_NAME = "المنهج التفاعلي";
const SITE_DESCRIPTION =
  "منصة تفاعلية لكتب وزارة التربية والتعليم المصرية: شرح الدروس كما في الكتاب، وكتيبات التقييم الرسمية، وبنوك الأسئلة، والمحاكيات — مرتبة حسب الصف والكتاب والترم، وتعمل بدون إنترنت.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: ["المناهج المصرية", "كتب الوزارة", "الثانوية العامة", "مصر", "شرح الدروس", "بنك الأسئلة"],
  authors: [{ name: "وزارة التربية والتعليم والتعليم الفني - جمهورية مصر العربية" }],
  icons: {
    icon: [
      { url: `${basePath}/icon.svg`, type: "image/svg+xml" },
      { url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${basePath}/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: `${basePath}/icon-192.png`, sizes: "192x192", type: "image/png" },
    ],
  },
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: SITE_NAME,
  },
  openGraph: {
    type: "website",
    locale: "ar_EG",
    url: siteUrl,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
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
        <ActivePartProvider>
        <PWAProvider>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:right-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-indigo-600 focus:text-white focus:rounded-lg focus:shadow-xl focus:outline-none"
          >
            تخطي إلى المحتوى الرئيسي
          </a>
          <Navbar catalog={getNavCatalog()} />
          <main id="main-content" className="flex-1 flex flex-col w-full min-w-0">
            {children}
          </main>
          <PWARegister />
        </PWAProvider>
        </ActivePartProvider>
      </body>
    </html>
  );
}
