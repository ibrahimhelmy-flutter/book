import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="مسار التنقل" className="text-xs text-slate-400">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronLeft className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
            {item.href ? (
              <Link href={item.href} className="hover:text-white truncate">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-slate-200 font-semibold truncate">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
