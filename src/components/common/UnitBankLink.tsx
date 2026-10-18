"use client";

import React from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";
import { chapterHref } from "@/content/paths";

/** Element id of the chapter page's question bank, and the event that opens it on the same page. */
export const UNIT_BANK_ANCHOR = "unit-bank";
export const UNIT_BANK_OPEN_EVENT = "open-unit-bank";

// Set by a click that navigates to another chapter page, so the bank opens there even if the
// URL hash isn't in place yet when that page mounts.
let pendingChapter: number | null = null;

/** True (once) when the curriculum index asked this chapter's bank to open. */
export function takePendingUnitBank(chapterNumber: number): boolean {
  if (pendingChapter !== chapterNumber) return false;
  pendingChapter = null;
  return true;
}

/**
 * Small icon beside a unit's name in the curriculum index: opens the unit question bank on the
 * chapter page (#unit-bank). Rendered only for units that have a review bank.
 */
export function UnitBankLink({
  partKey,
  chapterId,
  chapterNumber,
  count,
  onNavigate,
  iconOnly = false,
}: {
  partKey: string;
  chapterId: string;
  chapterNumber: number;
  count: number;
  onNavigate?: () => void;
  /** The narrow desktop sidebar shows the icon alone (the full label stays in title/aria-label). */
  iconOnly?: boolean;
}) {
  const label = `بنك أسئلة الوحدة ${chapterNumber} (${count} سؤالًا)`;
  return (
    <Link
      href={`${chapterHref(partKey, chapterId)}#${UNIT_BANK_ANCHOR}`}
      onClick={() => {
        pendingChapter = chapterNumber;
        window.dispatchEvent(new CustomEvent(UNIT_BANK_OPEN_EVENT, { detail: chapterNumber }));
        onNavigate?.();
      }}
      title={label}
      aria-label={label}
      className={`shrink-0 inline-flex items-center gap-1 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 text-slate-400 hover:text-slate-200 transition-colors ${
        iconOnly ? "p-1.5" : "px-2 py-1"
      }`}
    >
      <ClipboardList className="w-3.5 h-3.5" />
      {!iconOnly && <span className="text-[10px] font-bold">بنك الأسئلة</span>}
    </Link>
  );
}
