"use client";

import type { EnglishSection } from "@/types/english";
import type { LessonFontSize } from "./LessonHeader";

const TEXT_SIZE: Record<LessonFontSize, string> = {
  normal: "text-[0.95rem] sm:text-base leading-relaxed",
  large: "text-base sm:text-lg leading-relaxed",
  xlarge: "text-lg sm:text-xl leading-relaxed",
  "2xlarge": "text-xl sm:text-2xl leading-relaxed",
  "3xlarge": "text-2xl sm:text-3xl leading-relaxed",
  "4xlarge": "text-3xl sm:text-4xl leading-relaxed",
  "5xlarge": "text-4xl sm:text-5xl leading-relaxed",
};

/** The official English text (language-schools edition) shown under an Arabic section. */
export function EnglishSectionText({ section, fontSize }: { section: EnglishSection; fontSize: LessonFontSize }) {
  return (
    <div
      dir="ltr"
      lang="en"
      className="mt-2 rounded-xl border border-sky-500/25 bg-sky-950/20 p-4 sm:p-5 space-y-3 text-left"
    >
      <div className="font-ui flex flex-wrap items-center justify-between gap-2 border-b border-sky-500/15 pb-2">
        <h4 className="font-bold text-sky-200 text-base sm:text-lg">{section.title}</h4>
        <span className="text-[11px] font-semibold text-sky-300/80 px-2 py-0.5 rounded-full border border-sky-500/25 bg-sky-500/10">
          English · Official textbook
        </span>
      </div>
      <div className={`space-y-3 text-slate-200 ${TEXT_SIZE[fontSize]}`}>
        {section.blocks.map((block, i) => {
          if (block.type === "caption") {
            return (
              <p key={i} className="text-sm italic text-slate-400">
                {block.text}
              </p>
            );
          }
          if (block.type === "table") {
            const [head, ...rows] = block.rows;
            return (
              <div key={i} className="overflow-x-auto rounded-lg border border-slate-700/70">
                <table className="w-full text-sm border-collapse break-words">
                  <thead className="bg-slate-800/80">
                    <tr>
                      {head.map((cell, c) => (
                        <th key={c} className="px-3 py-2 text-left font-bold text-slate-100 border-b border-slate-700/70">
                          {cell}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, r) => (
                      <tr key={r} className="border-t border-slate-800">
                        {row.map((cell, c) => (
                          <td key={c} className={`px-3 py-2 align-top ${c === 0 ? "font-semibold text-slate-100" : "text-slate-300"}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          return <p key={i}>{block.text}</p>;
        })}
      </div>
    </div>
  );
}
