import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "البرمجة والذكاء الاصطناعي | الصف الثاني الثانوي (البكالوريا المصرية)",
  description: "المنهج الرقمي التفاعلي المعتمد للبرمجة والذكاء الاصطناعي - الجزء الأول، وفق رؤية مصر 2030 بالتعاون مع البكالوريا الدولية (IB).",
  keywords: ["الذكاء الاصطناعي", "الأمن السيبراني", "تطبيقات الويب", "تصميم الويب", "الثانوية العامة", "مصر"],
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
        <main className="flex-1 flex flex-col">{children}</main>
      </body>
    </html>
  );
}
