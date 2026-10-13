import React from "react";
import Link from "next/link";
import { ClientRedirect } from "./ClientRedirect";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Static-export replacement for a server redirect: a meta refresh (works without JS and for crawlers),
 * an immediate client-side replace, and a visible link as a last resort.
 */
export function LegacyRedirect({ to }: { to: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] px-4 text-center gap-4">
      <meta httpEquiv="refresh" content={`0;url=${BASE_PATH}${to}`} />
      <link rel="canonical" href={`${BASE_PATH}${to}`} />
      <ClientRedirect to={to} />
      <p className="text-sm text-slate-400">تم نقل هذه الصفحة إلى عنوان جديد…</p>
      <Link href={to} className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold">
        الانتقال إلى الصفحة
      </Link>
    </div>
  );
}
