"use client";

import React, { useState, useRef, useEffect } from "react";
import { AcronymTerm } from "@/types";

interface Props {
  acronym: AcronymTerm;
  displayText?: string;
  theme?: "dark" | "light";
  className?: string;
}

export function AcronymTooltip({
  acronym,
  displayText,
  theme = "dark",
  className = "",
}: Props) {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  // Close on outside click for mobile
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsVisible(false);
      }
    }
    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isVisible]);

  const textToDisplay = displayText || acronym.short;

  return (
    <span
      ref={containerRef}
      className={`relative inline-block group/acronym align-baseline ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <span
        role="button"
        tabIndex={0}
        onClick={() => setIsVisible((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsVisible((prev) => !prev);
          }
        }}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        title={acronym.fullEn}
        aria-label={`${acronym.short}: ${acronym.fullEn}`}
        className={`inline-flex items-center font-mono text-[11px] sm:text-xs font-bold px-1.5 py-0.5 rounded-md cursor-help transition-all duration-150 border dir-ltr select-none ${
          theme === "light"
            ? "text-sky-900 bg-sky-100/90 border-sky-300 hover:bg-sky-200 shadow-2xs hover:border-sky-400"
            : "text-sky-300 bg-sky-950/70 border-sky-500/40 hover:border-sky-400 hover:bg-sky-900/60 shadow-xs hover:shadow-sky-500/20 hover:scale-102"
        }`}
      >
        {textToDisplay}
      </span>

      {/* Floating Tooltip displaying just full English name */}
      <span
        role="tooltip"
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900/98 backdrop-blur-md border border-sky-500/40 rounded-xl shadow-2xl z-50 text-left dir-ltr whitespace-nowrap max-w-[85vw] transition-all duration-150 pointer-events-none block ${
          isVisible
            ? "opacity-100 visible translate-y-0 scale-100"
            : "opacity-0 invisible translate-y-1 scale-95"
        }`}
      >
        {/* Tooltip Arrow */}
        <span className="block absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-solid border-t-slate-900 border-t-6 border-x-transparent border-x-6 border-b-0" />

        {/* English Full Name Only */}
        <span className="text-xs sm:text-sm font-mono font-bold text-sky-200 tracking-wide select-none drop-shadow-sm block">
          {acronym.fullEn}
        </span>
      </span>
    </span>
  );
}
