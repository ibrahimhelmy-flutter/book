import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { CURRENT_BOOK } from "@/data/books";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#020617",
};

export const metadata: Metadata = {
  title: `${CURRENT_BOOK.title} | ${CURRENT_BOOK.grade} (${CURRENT_BOOK.term})`,
  description: CURRENT_BOOK.description,
  keywords: ["الذكاء الاصطناعي", "الأمن السيبراني", "تطبيقات الويب", "تصميم الويب", "الثانوية العامة", "مصر", CURRENT_BOOK.title, CURRENT_BOOK.grade],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className="dark">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased flex flex-col selection:bg-indigo-600 selection:text-white">
        <Navbar />
        <main className="flex-1 flex flex-col w-full min-w-0">{children}</main>
      </body>
    </html>
  );
}
