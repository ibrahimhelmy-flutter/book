"use client";

import React from "react";
import { getAcronym } from "@/data/acronyms";
import { AcronymTooltip } from "./AcronymTooltip";
import type { LessonFontSize } from "../lesson/LessonHeader";

interface EyeComfortTextProps {
  content: string;
  theme?: "dark" | "light";
  className?: string;
  fontSize?: LessonFontSize;
  keyConcepts?: Array<{ termAr: string; termEn?: string }>;
}

const CIRCLED_NUM_MAP: Record<string, number> = {
  "①": 1,
  "②": 2,
  "③": 3,
  "④": 4,
  "⑤": 5,
  "⑥": 6,
  "⑦": 7,
  "⑧": 8,
  "⑨": 9,
  "⑩": 10,
};

/**
 * Checks text segments and wraps known acronyms/shortcuts in AcronymTooltip
 */
function renderTextWithAcronyms(
  text: string,
  theme: "dark" | "light" = "dark",
) {
  if (!text) return null;

  // Split by potential acronym words: 2+ characters of letters/numbers/slashes/hyphens
  const tokenRegex = /([A-Za-z0-9/_-]{2,})/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, i) => {
    if (!part) return null;

    const acr = getAcronym(part);

    if (acr) {
      return (
        <AcronymTooltip
          key={i}
          acronym={acr}
          displayText={part}
          theme={theme}
        />
      );
    }

    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

/**
 * Parses inline tokens:
 * - Bold text: **term**
 * - Inline code: `code`
 * - Defined term with ellipsis: (Term)...
 * - English & Arabic technical terms in parentheses: (Term)
 * - Auto-detected key concepts from lesson
 * - Auto-detected acronyms/shortcuts
 *
 * Supports two distinct shading levels:
 * - isDefinition = false: Normal subtle highlighting
 * - isDefinition = true: Ultra-subtle highlighting
 */
function renderInlineTokens(
  text: string,
  theme: "dark" | "light" = "dark",
  keyTerms: string[] = [],
  isDefinition: boolean = false,
) {
  if (!text) return null;

  // Split by high-priority inline tokens
  const mainRegex =
    /(\([A-Za-z0-9\u0600-\u06FF\s/._+&#%-]{2,}\)\.\.\.|\*\*[\s\S]+?\*\*|`[^`]+`|\([A-Za-z0-9\u0600-\u06FF\s/._+&#%-]{2,}\))/g;

  const parts = text.split(mainRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // ============================================================
    // 1. Defined term with ellipsis: (Term)...
    // ============================================================
    if (part.startsWith("(") && part.endsWith(")...")) {
      const innerTerm = part.slice(1, -4);

      if (theme === "light") {
        return (
          <span
            key={index}
            className="inline-flex items-center gap-1 mx-0.5 align-baseline"
          >
            <strong className="font-bold text-teal-950 bg-teal-50/80 border border-teal-200/80 px-2 py-0.5 rounded-lg">
              {renderTextWithAcronyms(innerTerm, theme)}
            </strong>

            <span className="text-teal-600/80 font-bold select-none">
              …
            </span>
          </span>
        );
      }

      return (
        <span
          key={index}
          className="inline-flex items-center gap-1 mx-0.5 align-baseline"
        >
          <strong className="font-bold text-teal-100 bg-teal-400/[0.035] border-b border-teal-400/20 px-1.5 py-0.5 rounded-md">
            {renderTextWithAcronyms(innerTerm, theme)}
          </strong>

          <span className="text-teal-400/75 font-bold select-none">…</span>
        </span>
      );
    }

    // ============================================================
    // 2. Bold Important Words: **term**
    // ============================================================
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);

      if (theme === "light") {
        return (
          <strong
            key={index}
            className={`font-black text-slate-950 px-1.5 py-0.5 rounded-md mx-0.5 inline-block ${isDefinition
                ? "bg-teal-50/35 border border-teal-100/60"
                : "bg-teal-50/65 border border-teal-200/70"
              }`}
          >
            {renderTextWithAcronyms(inner, theme)}
          </strong>
        );
      }

      return (
        <strong
          key={index}
          className={`font-bold text-teal-100 px-1 py-0.5 rounded-md mx-0.5 inline ${isDefinition
              ? "bg-teal-400/[0.035] border-b border-teal-400/20"
              : "bg-teal-400/[0.06] border border-teal-400/[0.12]"
            }`}
        >
          {renderTextWithAcronyms(inner, theme)}
        </strong>
      );
    }

    // ============================================================
    // 3. Inline Code: `code`
    // ============================================================
    if (part.startsWith("`") && part.endsWith("`")) {
      const inner = part.slice(1, -1);

      if (theme === "light") {
        return (
          <code
            key={index}
            className="font-mono text-[0.88em] text-pink-700 bg-pink-50 border border-pink-200 px-1.5 py-0.5 rounded-md mx-0.5"
          >
            {inner}
          </code>
        );
      }

      return (
        <code
          key={index}
          className="font-mono text-[0.88em] text-rose-300/95 bg-rose-400/[0.06] border border-rose-400/[0.14] px-1.5 py-0.5 rounded-md mx-0.5"
        >
          {inner}
        </code>
      );
    }

    // ============================================================
    // 4. Terms in Parentheses: (Term)
    // ============================================================
    if (part.startsWith("(") && part.endsWith(")") && part.length > 2) {
      const inner = part.slice(1, -1);
      const acr = getAcronym(inner);

      if (acr) {
        return (
          <span
            key={index}
            className="inline-flex items-center mx-0.5 align-baseline"
          >
            <span
              className={
                theme === "light"
                  ? "text-slate-500 font-mono text-[0.85em] select-none"
                  : "text-slate-500/80 font-mono text-[0.85em] select-none"
              }
            >
              (
            </span>

            <AcronymTooltip
              acronym={acr}
              displayText={inner}
              theme={theme}
            />

            <span
              className={
                theme === "light"
                  ? "text-slate-500 font-mono text-[0.85em] select-none"
                  : "text-slate-500/80 font-mono text-[0.85em] select-none"
              }
            >
              )
            </span>
          </span>
        );
      }

      // Check if pure English/ASCII technical acronym/term
      if (/^[A-Za-z0-9\s/._+&#%-]+$/.test(inner)) {
        if (theme === "light") {
          return (
            <span
              key={index}
              className="font-mono text-[0.88em] font-semibold text-indigo-800 bg-indigo-50/70 border border-indigo-200/70 px-1.5 py-0.5 rounded-md mx-1 inline-block dir-ltr"
            >
              {renderTextWithAcronyms(inner, theme)}
            </span>
          );
        }

        return (
          <span
            key={index}
            className="font-mono text-[0.88em] font-semibold text-sky-300/95 bg-sky-400/[0.06] border border-sky-400/[0.14] px-1.5 py-0.5 rounded-md mx-1 inline-block dir-ltr"
          >
            {renderTextWithAcronyms(inner, theme)}
          </span>
        );
      }

      // Arabic Term in Parentheses
      if (theme === "light") {
        return (
          <span
            key={index}
            className={`font-semibold px-1.5 py-0.5 rounded-md mx-0.5 inline-block ${isDefinition
                ? "text-slate-800 bg-teal-50/30 border border-teal-100/50"
                : "text-teal-950 bg-teal-50/60 border border-teal-200/60"
              }`}
          >
            {inner}
          </span>
        );
      }

      return (
        <span
          key={index}
          className={`font-semibold px-1 py-0.5 rounded-md mx-0.5 inline ${isDefinition
              ? "text-teal-200/90 bg-teal-400/[0.025] border-b border-teal-400/[0.12]"
              : "text-teal-200 bg-teal-400/[0.05] border border-teal-400/[0.12]"
            }`}
        >
          {inner}
        </span>
      );
    }

    // ============================================================
    // 5. Regular text segment: key concepts highlighting
    // ============================================================
    if (keyTerms.length > 0) {
      const sorted = [...keyTerms].sort((a, b) => b.length - a.length);

      const escaped = sorted.map((t) =>
        t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      );

      const termRegex = new RegExp(
        "([وفبل]?(?:" + escaped.join("|") + "))",
        "g",
      );

      const subParts = part.split(termRegex);

      return (
        <React.Fragment key={index}>
          {subParts.map((sp, spIdx) => {
            if (!sp) return null;

            const matched = sorted.find(
              (kt) =>
                sp === kt ||
                sp === "و" + kt ||
                sp === "ف" + kt ||
                sp === "ب" + kt ||
                sp === "ل" + kt,
            );

            if (matched) {
              if (theme === "light") {
                return (
                  <strong
                    key={spIdx}
                    className={`font-bold px-1.5 py-0.5 rounded-md mx-0.5 inline-block ${isDefinition
                        ? "text-teal-950 bg-teal-50/40 border border-teal-100/70"
                        : "text-teal-950 bg-teal-50/70 border border-teal-200/80"
                      }`}
                  >
                    {renderTextWithAcronyms(sp, theme)}
                  </strong>
                );
              }

              return (
                <strong
                  key={spIdx}
                  className={`font-bold px-1 py-0.5 rounded-md mx-0.5 inline ${isDefinition
                      ? "text-teal-100/90 bg-teal-400/[0.035] border-b border-teal-400/15"
                      : "text-teal-100 bg-teal-400/[0.06] border border-teal-400/[0.12]"
                    }`}
                >
                  {renderTextWithAcronyms(sp, theme)}
                </strong>
              );
            }

            return (
              <React.Fragment key={spIdx}>
                {renderTextWithAcronyms(sp, theme)}
              </React.Fragment>
            );
          })}
        </React.Fragment>
      );
    }

    // ============================================================
    // 6. Regular Text with Acronym detection
    // ============================================================
    return (
      <React.Fragment key={index}>
        {renderTextWithAcronyms(part, theme)}
      </React.Fragment>
    );
  });
}

/**
 * Splits a paragraph into natural sentences at single full stops
 * while ignoring ellipsis ...
 */
function splitIntoNaturalSentences(content: string): string[] {
  if (!content) return [];

  const rawSentences = content
    .split(/(?<!\.)\.(?!\.)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (rawSentences.length <= 1) return [content];

  return rawSentences.map((s, idx) => {
    if (idx < rawSentences.length - 1 && !s.endsWith(".")) {
      return s + ".";
    }

    return s;
  });
}

export function EyeComfortText({
  content,
  theme = "dark",
  className = "",
  fontSize = "normal",
  keyConcepts = [],
}: EyeComfortTextProps) {
  // Extract clean terms from keyConcepts for smart subtle highlighting
  const allTerms = React.useMemo(() => {
    const set = new Set<string>();

    keyConcepts.forEach((kc) => {
      if (kc.termAr && kc.termAr.trim().length > 1) {
        set.add(kc.termAr.trim());
      }

      if (kc.termEn && kc.termEn.trim().length > 1) {
        set.add(kc.termEn.trim());
      }
    });

    return Array.from(set);
  }, [keyConcepts]);

  if (!content) return null;

  const fontClass =
    fontSize === "5xlarge"
      ? "text-3xl sm:text-4xl md:text-5xl leading-loose font-extrabold"
      : fontSize === "4xlarge"
        ? "text-2xl sm:text-3xl md:text-4xl leading-loose font-bold"
        : fontSize === "3xlarge"
          ? "text-xl sm:text-2xl md:text-3xl leading-loose font-semibold"
          : fontSize === "2xlarge"
            ? "text-lg sm:text-xl md:text-2xl leading-loose font-medium"
            : fontSize === "xlarge"
              ? "text-base sm:text-lg md:text-xl leading-loose font-medium"
              : fontSize === "large"
                ? "text-base sm:text-lg md:text-xl leading-loose"
                : "text-sm sm:text-base leading-relaxed";

  // ============================================================
  // Split by code blocks
  // ============================================================
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;

  const sections: Array<{
    type: "code" | "text";
    lang?: string;
    value: string;
  }> = [];

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      sections.push({
        type: "text",
        value: content.substring(lastIndex, match.index),
      });
    }

    sections.push({
      type: "code",
      lang: match[1] || "text",
      value: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    sections.push({
      type: "text",
      value: content.substring(lastIndex),
    });
  }

  return (
    <div className={`space-y-4 ${fontClass} ${className}`}>
      {sections.map((section, secIdx) => {
        // ============================================================
        // CODE BLOCK
        // ============================================================
        if (section.type === "code") {
          return (
            <div
              key={secIdx}
              className={
                theme === "light"
                  ? "my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 text-left dir-ltr shadow-sm"
                  : "my-4 rounded-xl overflow-hidden border border-slate-700/60 bg-slate-950/80 text-left dir-ltr shadow-sm"
              }
            >
              {section.lang && (
                <div
                  className={
                    theme === "light"
                      ? "bg-slate-900 px-3 py-1.5 text-[11px] font-mono text-slate-400 border-b border-slate-800 uppercase"
                      : "bg-slate-900/80 px-3 py-1.5 text-[11px] font-mono text-slate-400 border-b border-slate-800/70 uppercase"
                  }
                >
                  {section.lang}
                </div>
              )}

              <pre
                className={`p-3.5 font-mono overflow-x-auto leading-relaxed ${theme === "light"
                    ? "text-emerald-300"
                    : "text-emerald-300/95"
                  } ${fontSize === "5xlarge" || fontSize === "4xlarge"
                    ? "text-base sm:text-lg"
                    : fontSize === "3xlarge" || fontSize === "2xlarge"
                      ? "text-sm sm:text-base"
                      : fontSize === "xlarge"
                        ? "text-xs sm:text-sm"
                        : "text-xs"
                  }`}
              >
                <code>{section.value.trim()}</code>
              </pre>
            </div>
          );
        }

        // ============================================================
        // TEXT SECTIONS
        // ============================================================
        const lines = section.value.split("\n");

        return (
          <div key={secIdx} className="space-y-3">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();

              if (!trimmed) return null;

              // ======================================================
              // 1. Math Formula Block: $$...$$
              // ======================================================
              if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
                const formula = trimmed.slice(2, -2).trim();

                return (
                  <div
                    key={lineIdx}
                    className={`my-3 py-3 px-4 rounded-xl text-center font-mono dir-ltr ${theme === "light"
                        ? "bg-slate-50 border border-teal-200 text-teal-700 shadow-inner"
                        : "bg-teal-400/[0.035] border border-teal-400/[0.16] text-teal-300/95"
                      } ${fontSize === "5xlarge" || fontSize === "4xlarge"
                        ? "text-2xl sm:text-3xl"
                        : fontSize === "3xlarge" || fontSize === "2xlarge"
                          ? "text-xl sm:text-2xl"
                          : fontSize === "xlarge"
                            ? "text-base sm:text-lg"
                            : fontSize === "large"
                              ? "text-sm sm:text-base"
                              : "text-xs sm:text-sm"
                      }`}
                  >
                    {formula}
                  </div>
                );
              }

              // ======================================================
              // 2. Math/Logic Equation in Text
              // ======================================================
              const isEquation =
                trimmed.includes("=") &&
                (trimmed.includes("×") ||
                  trimmed.includes("+") ||
                  trimmed.includes("-"));

              if (isEquation) {
                return (
                  <div
                    key={lineIdx}
                    className={
                      theme === "light"
                        ? "my-3.5 py-3 px-4 rounded-xl bg-teal-50 border border-teal-200 text-center text-base sm:text-lg font-bold text-teal-800 font-mono tracking-wide shadow-inner dir-rtl"
                        : "my-3.5 py-3 px-4 rounded-xl bg-teal-400/[0.035] border border-teal-400/[0.16] text-center text-base sm:text-lg font-bold text-teal-200/95 font-mono tracking-wide dir-rtl"
                    }
                  >
                    {trimmed}
                  </div>
                );
              }

              // ======================================================
              // 3. Numbered Point: (1), (2), (3)...
              // ======================================================
              const pointMatch = trimmed.match(/^\((\d+)\)\s*(.*)$/);

              if (pointMatch) {
                const num = pointMatch[1];
                const contentText = pointMatch[2];
                const sentences = splitIntoNaturalSentences(contentText);

                return (
                  <div
                    key={lineIdx}
                    className={
                      theme === "light"
                        ? "flex items-start gap-3.5 py-2.5 sm:py-3 my-1.5"
                        : "flex items-start gap-3.5 py-2.5 sm:py-3 my-1.5"
                    }
                  >
                    <span
                      className={
                        theme === "light"
                          ? "w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 mt-0.5 select-none"
                          : "w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-400/[0.08] text-teal-300/90 border border-teal-400/[0.16] flex items-center justify-center font-mono font-bold text-xs sm:text-sm shrink-0 mt-0.5 select-none"
                      }
                    >
                      {num}
                    </span>

                    <div
                      className={
                        theme === "light"
                          ? "flex-1 space-y-2 text-slate-700 leading-relaxed"
                          : "flex-1 space-y-2 text-slate-200/95 leading-relaxed"
                      }
                    >
                      {sentences.map((sent, sIdx) => {
                        const isDefSentence =
                          sent.includes(")...") ||
                          sent.includes("... ") ||
                          /^(?:الخطر|المخاطرة|الحادث الأمني|جدار الحماية|التشفير|المصادقة):\s*/.test(
                            sent.trim(),
                          );

                        // Embedded example
                        if (sent.startsWith("مثال:")) {
                          const exampleBody = sent.replace(/^مثال:\s*/, "");

                          return (
                            <div
                              key={sIdx}
                              className={
                                theme === "light"
                                  ? "my-2 py-2.5 px-3 rounded-lg bg-amber-50 border-s-2 border-amber-300 text-slate-700 flex items-start gap-2.5"
                                  : "my-2 py-2.5 px-3 rounded-lg bg-amber-400/[0.035] border-s-2 border-amber-400/25 text-slate-200/95 flex items-start gap-2.5"
                              }
                            >
                              <span
                                className={
                                  theme === "light"
                                    ? "px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shrink-0 mt-0.5"
                                    : "px-1.5 py-0.5 rounded-md bg-amber-400/[0.08] text-amber-300/95 border border-amber-400/[0.14] text-xs font-bold shrink-0 mt-0.5"
                                }
                              >
                                مثال
                              </span>

                              <div className="flex-1 leading-relaxed">
                                {renderInlineTokens(
                                  exampleBody,
                                  theme,
                                  allTerms,
                                  false,
                                )}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <p key={sIdx} className="leading-relaxed">
                            {renderInlineTokens(
                              sent,
                              theme,
                              allTerms,
                              isDefSentence,
                            )}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // ======================================================
              // 4. Circled Step List: ①, ②, ③...
              // ======================================================
              const stepMatch = trimmed.match(
                /^([①②③④⑤⑥⑦⑧⑨⑩])\s*(.*)$/,
              );

              if (stepMatch) {
                const stepSymbol = stepMatch[1];
                const stepNum = CIRCLED_NUM_MAP[stepSymbol] || stepSymbol;
                const stepText = stepMatch[2];
                const isStepDef =
                  stepText.includes("...") || stepText.includes(":");

                return (
                  <div
                    key={lineIdx}
                    className={
                      theme === "light"
                        ? "flex items-start gap-3 py-2 my-1"
                        : "flex items-start gap-3 py-2 my-1"
                    }
                  >
                    <span
                      className={
                        theme === "light"
                          ? "w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold font-mono text-[11px] shrink-0 mt-0.5 select-none"
                          : "w-6 h-6 rounded-full bg-indigo-400/[0.08] text-indigo-300 border border-indigo-400/[0.16] flex items-center justify-center font-bold font-mono text-[11px] shrink-0 mt-0.5 select-none"
                      }
                    >
                      {stepNum}
                    </span>

                    <div
                      className={
                        theme === "light"
                          ? "flex-1 leading-relaxed text-slate-700"
                          : "flex-1 leading-relaxed text-slate-200/95"
                      }
                    >
                      {renderInlineTokens(
                        stepText,
                        theme,
                        allTerms,
                        isStepDef,
                      )}
                    </div>
                  </div>
                );
              }

              // ======================================================
              // 5. Standalone Example Line: starts with مثال:
              // ======================================================
              if (trimmed.startsWith("مثال:")) {
                const exampleText = trimmed.replace(/^مثال:\s*/, "");

                return (
                  <div
                    key={lineIdx}
                    className={
                      theme === "light"
                        ? "my-3 py-2.5 px-3 rounded-lg bg-amber-50 border-s-2 border-amber-300 text-slate-700 flex items-start gap-3"
                        : "my-3 py-2.5 px-3 rounded-lg bg-amber-400/[0.035] border-s-2 border-amber-400/25 text-slate-200/95 flex items-start gap-3"
                    }
                  >
                    <span
                      className={
                        theme === "light"
                          ? "px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold shrink-0 mt-0.5"
                          : "px-1.5 py-0.5 rounded-md bg-amber-400/[0.08] text-amber-300/95 border border-amber-400/[0.14] text-xs font-bold shrink-0 mt-0.5"
                      }
                    >
                      مثال
                    </span>

                    <div className="flex-1 leading-relaxed">
                      {renderInlineTokens(
                        exampleText,
                        theme,
                        allTerms,
                        false,
                      )}
                    </div>
                  </div>
                );
              }

              // ======================================================
              // 6. Numbered List: 1. ...
              // ======================================================
              const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);

              if (numberedMatch) {
                const num = numberedMatch[1];
                const rest = numberedMatch[2];

                return (
                  <div
                    key={lineIdx}
                    className="flex items-start gap-3 pr-1 leading-relaxed"
                  >
                    <span
                      className={`rounded-full flex items-center justify-center font-bold font-mono shrink-0 border mt-0.5 ${theme === "light"
                          ? "bg-teal-50 text-teal-700 border-teal-200"
                          : "bg-teal-400/[0.08] text-teal-300 border-teal-400/[0.16]"
                        } ${fontSize === "5xlarge" || fontSize === "4xlarge"
                          ? "w-9 h-9 text-base"
                          : fontSize === "3xlarge" ||
                            fontSize === "2xlarge"
                            ? "w-7 h-7 text-sm"
                            : fontSize === "xlarge"
                              ? "w-6 h-6 text-xs"
                              : "w-5 h-5 text-[11px]"
                        }`}
                    >
                      {num}
                    </span>

                    <div
                      className={`flex-1 transition-colors duration-200 ${theme === "light"
                          ? "text-slate-700"
                          : "text-slate-200/95"
                        } ${fontClass}`}
                    >
                      {renderInlineTokens(rest, theme, allTerms, false)}
                    </div>
                  </div>
                );
              }

              // ======================================================
              // 7. Bullet List: •, -, *
              // ======================================================
              const isSubBullet =
                line.startsWith("  ") || line.startsWith("\t");

              const bulletMatch = trimmed.match(/^[•\-*]\s+(.*)$/);

              if (bulletMatch) {
                const rest = bulletMatch[1];

                return (
                  <div
                    key={lineIdx}
                    className={`flex items-start gap-2.5 leading-relaxed ${isSubBullet ? "pr-6" : "pr-2"
                      }`}
                  >
                    <span
                      className={`rounded-full shrink-0 mt-2 ${theme === "light"
                          ? "bg-teal-600"
                          : "bg-teal-400/80"
                        } ${fontSize === "5xlarge" || fontSize === "4xlarge"
                          ? "w-3.5 h-3.5 mt-4"
                          : fontSize === "3xlarge" ||
                            fontSize === "2xlarge"
                            ? "w-2.5 h-2.5 mt-3.5"
                            : "w-1.5 h-1.5"
                        }`}
                    />

                    <div
                      className={`flex-1 transition-colors duration-200 ${theme === "light"
                          ? "text-slate-700"
                          : "text-slate-200/95"
                        } ${fontClass}`}
                    >
                      {renderInlineTokens(rest, theme, allTerms, false)}
                    </div>
                  </div>
                );
              }

              // ======================================================
              // 8. Standard Paragraph
              // ======================================================
              const isGeneralDef =
                trimmed.includes(")...") ||
                trimmed.includes("...") ||
                /^(?:الخطر|المخاطرة):\s*/.test(trimmed);

              return (
                <p
                  key={lineIdx}
                  className={`${fontClass} ${theme === "light"
                      ? "text-slate-700"
                      : "text-slate-200/95"
                    } font-normal leading-relaxed transition-colors duration-200`}
                >
                  {renderInlineTokens(
                    trimmed,
                    theme,
                    allTerms,
                    isGeneralDef,
                  )}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function formatInlineText(
  text: string,
  theme: "dark" | "light" = "light",
  keyTerms: string[] = [],
  isDefinition: boolean = false,
) {
  return renderInlineTokens(text, theme, keyTerms, isDefinition);
}