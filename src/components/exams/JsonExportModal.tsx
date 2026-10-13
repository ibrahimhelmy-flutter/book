"use client";

import React, { useMemo } from "react";
import { Check, Code, Copy } from "lucide-react";

const PREVIEW_LIMIT = 15;

/** JSON preview of the current filtered questions (first 15) with a copy-all button. */
export function JsonExportModal({
  title,
  data,
  isCopied,
  onCopy,
  onClose,
}: {
  title: string;
  data: readonly unknown[];
  isCopied: boolean;
  onCopy: () => void;
  onClose: () => void;
}) {
  const preview = useMemo(() => JSON.stringify(data.slice(0, PREVIEW_LIMIT), null, 2), [data]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="json-export-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-5 h-5 text-indigo-400" />
            <h3 id="json-export-title" className="text-base font-bold text-white">
              {title}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCopy}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تم النسخ</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الكل</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>

        <div
          className="p-4 overflow-y-auto font-mono text-xs text-slate-300 bg-slate-950/90 leading-relaxed custom-scrollbar flex-1"
          dir="ltr"
        >
          <pre className="whitespace-pre-wrap">{preview}</pre>
          {data.length > PREVIEW_LIMIT && (
            <div className="p-2 text-center text-slate-500 italic mt-2 border-t border-slate-800" dir="rtl">
              ... تم عرض أول {PREVIEW_LIMIT} سؤالاً من إجمالي {data.length} سؤالاً (استخدم زر &quot;نسخ الكل&quot; لنسخ المصفوفة كاملة).
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
