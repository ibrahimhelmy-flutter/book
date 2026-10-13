"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ChevronDown, GraduationCap } from "lucide-react";
import type { NavCatalog, PartKey } from "@/types/catalog";
import { partHref } from "@/content/paths";

/** Dropdown listing every grade → book → part; coming-soon parts are shown but not linked. */
export function PartSwitcher({ catalog, activeKey }: { catalog: NavCatalog; activeKey: PartKey | null }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const active = activeKey
    ? catalog.grades
        .flatMap((g) => g.books.flatMap((b) => b.parts.map((p) => ({ g, b, p }))))
        .find((x) => x.p.key === activeKey)
    : null;

  return (
    <div className="relative min-w-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 flex items-center gap-1.5 cursor-pointer max-w-full sm:max-w-xs"
      >
        <GraduationCap className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        <span className="truncate font-semibold">
          {active ? `${active.b.title} · ${active.p.shortTitle}` : "اختر الصف والكتاب"}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-72 max-w-[90vw] max-h-[70vh] overflow-y-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 animate-fadeIn"
        >
          {catalog.grades.map((g) => (
            <div key={g.id} className="py-1">
              <div className="px-2 py-1 text-[11px] font-bold text-slate-500">{g.title}</div>
              {g.books.map((b) => (
                <div key={b.slug} className="mb-1">
                  <div className="px-2 py-1 text-xs font-bold text-slate-300">{b.title}</div>
                  {b.parts.map((p) =>
                    p.status === "available" ? (
                      <Link
                        key={p.key}
                        href={partHref(p.key)}
                        role="menuitem"
                        onClick={() => setOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                          p.key === activeKey ? "bg-indigo-600/20 text-indigo-200 font-bold" : "text-slate-300 hover:bg-slate-900"
                        }`}
                      >
                        <span>{p.shortTitle}</span>
                        {p.key === activeKey && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                      </Link>
                    ) : (
                      <div key={p.key} className="flex items-center justify-between px-3 py-2 text-xs text-slate-600" aria-disabled>
                        <span>{p.shortTitle}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">قريبًا</span>
                      </div>
                    )
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
