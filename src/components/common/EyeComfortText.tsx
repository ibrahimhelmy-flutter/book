"use client";

import React from "react";
import { getAcronym } from "@/data/acronyms";
import { AcronymTooltip } from "./AcronymTooltip";

interface EyeComfortTextProps {
  content: string;
  theme?: "dark" | "light";
  className?: string;
  fontSize?: "normal" | "large" | "xlarge";
}

/**
 * Checks text segments and wraps known acronyms/shortcuts in AcronymTooltip
 */
function renderTextWithAcronyms(text: string, theme: "dark" | "light" = "dark") {
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
 * - English technical terms in parentheses: (Term)
 * - Auto-detected acronyms/shortcuts
 */
function renderInlineTokens(text: string, theme: "dark" | "light" = "dark") {
  const regex = /(\*\*[\s\S]+?\*\*|`[^`]+`|\([A-Za-z0-9\s/._+&#%-]{2,}\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    // 1. Bold Important Words
    if (part.startsWith("**") && part.endsWith("**")) {
      const inner = part.slice(2, -2);
      if (theme === "light") {
        return (
          <strong
            key={index}
            className="font-black text-slate-950 bg-blue-50 border border-blue-300/80 px-1.5 py-0.5 rounded-md mx-0.5 inline-block shadow-xs"
          >
            {renderTextWithAcronyms(inner, theme)}
          </strong>
        );
      }
      return (
        <strong
          key={index}
          className="font-bold text-amber-100 bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded-md mx-0.5 inline-block shadow-sm hover:bg-amber-500/25 transition-colors"
        >
          {renderTextWithAcronyms(inner, theme)}
        </strong>
      );
    }

    // 2. Inline Code
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
          className="font-mono text-[0.88em] text-rose-300 bg-rose-950/50 border border-rose-500/30 px-1.5 py-0.5 rounded-md mx-0.5"
        >
          {inner}
        </code>
      );
    }

    // 3. English Technical Terms in Parentheses
    if (part.startsWith("(") && part.endsWith(")") && part.length > 2) {
      const inner = part.slice(1, -1);
      const acr = getAcronym(inner);
      if (acr) {
        return (
          <span key={index} className="inline-flex items-center mx-0.5 align-baseline">
            <span className="text-slate-500 font-mono text-[0.85em] select-none">(</span>
            <AcronymTooltip acronym={acr} displayText={inner} theme={theme} />
            <span className="text-slate-500 font-mono text-[0.85em] select-none">)</span>
          </span>
        );
      }

      if (/^[A-Za-z0-9\s/._+&#%-]+$/.test(inner)) {
        if (theme === "light") {
          return (
            <span
              key={index}
              className="font-mono text-[0.88em] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded-md mx-1 inline-block dir-ltr"
            >
              {renderTextWithAcronyms(inner, theme)}
            </span>
          );
        }
        return (
          <span
            key={index}
            className="font-mono text-[0.88em] font-semibold text-sky-300 bg-sky-950/60 border border-sky-500/30 px-1.5 py-0.5 rounded-md mx-1 inline-block dir-ltr"
          >
            {renderTextWithAcronyms(inner, theme)}
          </span>
        );
      }
    }

    // Regular Text with Acronym detection
    return (
      <React.Fragment key={index}>
        {renderTextWithAcronyms(part, theme)}
      </React.Fragment>
    );
  });
}

export function EyeComfortText({
  content,
  theme = "dark",
  className = "",
  fontSize = "normal",
}: EyeComfortTextProps) {
  if (!content) return null;

  const fontClass =
    fontSize === "large"
      ? "text-base sm:text-lg md:text-xl leading-loose"
      : fontSize === "xlarge"
      ? "text-lg sm:text-xl md:text-2xl leading-loose font-medium"
      : "text-sm sm:text-base leading-relaxed";

  // Split by code blocks
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const sections: Array<{ type: "code" | "text"; lang?: string; value: string }> = [];

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
    <div className={`space-y-3 ${fontClass} ${className}`}>
      {sections.map((section, secIdx) => {
        if (section.type === "code") {
          return (
            <div
              key={secIdx}
              className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-left dir-ltr shadow-lg"
            >
              {section.lang && (
                <div className="bg-slate-900 px-3 py-1 text-[11px] font-mono text-slate-400 border-b border-slate-800 uppercase">
                  {section.lang}
                </div>
              )}
              <pre
                className={`p-3.5 font-mono text-emerald-300 overflow-x-auto leading-relaxed transition-all duration-200 ${
                  fontSize === "xlarge"
                    ? "text-sm sm:text-base"
                    : fontSize === "large"
                    ? "text-xs sm:text-sm"
                    : "text-xs"
                }`}
              >
                <code>{section.value.trim()}</code>
              </pre>
            </div>
          );
        }

        // Process text paragraphs & lists
        const lines = section.value.split("\n");

        return (
          <div key={secIdx} className="space-y-2.5">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Check for Math Formula: $$...$$
              if (trimmed.startsWith("$$") && trimmed.endsWith("$$")) {
                const formula = trimmed.slice(2, -2).trim();
                return (
                  <div
                    key={lineIdx}
                    className={`my-3 p-3 bg-slate-950/90 border border-indigo-500/30 rounded-xl text-center font-mono text-indigo-300 shadow-inner dir-ltr ${
                      fontSize === "xlarge" ? "text-base" : fontSize === "large" ? "text-sm" : "text-xs sm:text-sm"
                    }`}
                  >
                    {formula}
                  </div>
                );
              }

              // Check for Numbered List
              const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
              if (numberedMatch) {
                const num = numberedMatch[1];
                const rest = numberedMatch[2];
                return (
                  <div key={lineIdx} className="flex items-start gap-2.5 pr-1 leading-relaxed">
                    <span
                      className={`rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold font-mono shrink-0 border border-indigo-500/30 mt-0.5 ${
                        fontSize === "xlarge" ? "w-6 h-6 text-xs" : "w-5 h-5 text-[11px]"
                      }`}
                    >
                      {num}
                    </span>
                    <div className={`flex-1 text-slate-200 transition-all duration-200 ${fontClass}`}>
                      {renderInlineTokens(rest, theme)}
                    </div>
                  </div>
                );
              }

              // Check for Bullet List
              const isSubBullet = line.startsWith("  ") || line.startsWith("\t");
              const bulletMatch = trimmed.match(/^[•\-*]\s+(.*)$/);
              if (bulletMatch) {
                const rest = bulletMatch[1];
                return (
                  <div
                    key={lineIdx}
                    className={`flex items-start gap-2.5 leading-relaxed ${
                      isSubBullet ? "pr-6" : "pr-2"
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-2.5 shadow-sm shadow-indigo-500/50" />
                    <div className={`flex-1 text-slate-200 transition-all duration-200 ${fontClass}`}>
                      {renderInlineTokens(rest, theme)}
                    </div>
                  </div>
                );
              }

              // Standard Paragraph
              return (
                <p
                  key={lineIdx}
                  className={`${fontClass} text-slate-200 font-normal transition-all duration-200`}
                >
                  {renderInlineTokens(trimmed, theme)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function formatInlineText(text: string, theme: "dark" | "light" = "light") {
  return renderInlineTokens(text, theme);
}
