import type { Metadata } from "next";

// Local profile setup screens: nothing here for search engines to index.
export const metadata: Metadata = { title: "الملف الدراسي", robots: { index: false, follow: true } };

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
