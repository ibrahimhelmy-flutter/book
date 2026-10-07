"use client";

import React, { useState, useEffect } from "react";
import { ZoomIn, Maximize2, Minimize2, X, Image as ImageIcon, Eye, EyeOff } from "lucide-react";
import { getAssetPath } from "@/lib/utils";

import { LessonFontSize } from "./LessonHeader";

interface SectionImageViewerProps {
  image: {
    src: string;
    caption: string;
    alt?: string;
  };
  fontSize?: LessonFontSize;
}

export function SectionImageViewer({ image, fontSize = "normal" }: SectionImageViewerProps) {
  // Default to compact size (تصغير افتراضي) to keep reading flow clean
  const [isCompact, setIsCompact] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  if (isCollapsed) {
    return (
      <div className="my-3 flex items-center justify-between p-2.5 px-3.5 rounded-xl border border-slate-800/80 bg-slate-950/70 hover:bg-slate-900/80 transition-all text-xs shadow-xs">
        <div className="flex items-center gap-2 min-w-0 text-slate-400">
          <ImageIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="font-medium text-slate-300 text-xs truncate">
            صورة توضيحية: {image.caption || "مخطط توضيحي"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="px-2.5 py-1 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/70 text-indigo-300 hover:text-white border border-indigo-800/50 text-[11px] font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
          title="إظهار الصورة في الصفحة"
        >
          <Eye className="w-3 h-3 text-indigo-400" />
          <span>إظهار الصورة</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <div
        className={`my-4 sm:my-5 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 p-2 sm:p-3 transition-all duration-300 shadow-md ${
          isCompact ? "max-w-md sm:max-w-lg mx-auto" : "w-full"
        }`}
      >
        {/* Top Control Bar: Size Toggle, Collapse & Zoom */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80 px-1 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 min-w-0">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-bold text-slate-300 text-[11px] truncate">
              {isCompact ? "صورة توضيحية (عرض مصغّر)" : "صورة توضيحية (عرض موسّع)"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Toggle Compact / Expanded Button */}
            <button
              type="button"
              onClick={() => setIsCompact((prev) => !prev)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-[11px] font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
              title={isCompact ? "تكبير الصورة في الصفحة" : "تصغير الصورة لتوفير مساحة القراءة"}
            >
              {isCompact ? (
                <>
                  <Maximize2 className="w-3 h-3 text-indigo-400" />
                  <span>تكبير العرض</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3 h-3 text-amber-400" />
                  <span>تصغير العرض</span>
                </>
              )}
            </button>

            {/* Collapse (طي) Button */}
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              title="طي الصورة إلى شريط مدمج"
              aria-label="طي الصورة"
            >
              <EyeOff className="w-3 h-3 text-slate-400" />
              <span className="hidden sm:inline">طي</span>
            </button>

            {/* Open Fullscreen Lightbox Button */}
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors cursor-pointer shadow-xs"
              title="معاينة مكبرة كاملة بملء الشاشة"
              aria-label="معاينة مكبرة كاملة بملء الشاشة"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Interactive Image Container */}
        <div
          onClick={() => setIsLightboxOpen(true)}
          className={`relative rounded-xl overflow-hidden bg-slate-900/90 flex items-center justify-center cursor-zoom-in group transition-all duration-300 ${
            isCompact ? "max-h-48 sm:max-h-56" : "max-h-96 sm:max-h-[440px]"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={getAssetPath(image.src)}
            alt={image.alt || image.caption}
            className={`w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-[1.02] ${
              isCompact ? "max-h-48 sm:max-h-56" : "max-h-96 sm:max-h-[440px]"
            }`}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const target = e.currentTarget;
              const attempts = parseInt(target.dataset.attempts || "0", 10);
              const rawSrc = image?.src
                ? image.src.startsWith("/")
                  ? image.src
                  : `/${image.src}`
                : "";
              if (attempts === 0 && rawSrc) {
                target.dataset.attempts = "1";
                if (target.src.includes("/book/") && !rawSrc.startsWith("/book/")) {
                  target.src = rawSrc;
                } else if (!target.src.includes("/book/")) {
                  target.src = `/book${rawSrc}`;
                }
              } else if (attempts === 1 && rawSrc) {
                target.dataset.attempts = "2";
                const filename = rawSrc.split("/").pop();
                if (filename) {
                  target.src = `../../images/extracted/${filename}`;
                }
              }
            }}
          />

          {/* Hover Hint */}
          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 text-white font-bold text-xs pointer-events-none">
            <ZoomIn className="w-4 h-4 text-indigo-300" />
            <span className="text-[11px] bg-black/60 px-2 py-0.5 rounded-md backdrop-blur-xs">
              انقر للمعاينة الكاملة المكبرة
            </span>
          </div>
        </div>

        {/* Caption */}
        {image.caption && (
          <p
            className={`text-center mt-2 font-medium transition-all duration-200 ${
              fontSize === "5xlarge"
                ? "text-2xl sm:text-3xl text-slate-100 font-bold"
                : fontSize === "4xlarge"
                ? "text-xl sm:text-2xl text-slate-100 font-semibold"
                : fontSize === "3xlarge"
                ? "text-lg sm:text-xl text-slate-100 font-semibold"
                : fontSize === "2xlarge"
                ? "text-base sm:text-lg text-slate-200 font-medium"
                : fontSize === "xlarge"
                ? "text-base text-slate-200"
                : fontSize === "large"
                ? "text-sm text-slate-300"
                : "text-xs text-slate-400"
            }`}
          >
            📷 {image.caption}
          </p>
        )}
      </div>

      {/* Fullscreen High-Res Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="إغلاق (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal content */}
          <div
            className="max-w-5xl max-h-[88vh] flex flex-col items-center justify-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAssetPath(image.src)}
              alt={image.caption}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/10"
            />
            {image.caption && (
              <p className="text-white text-xs sm:text-sm font-bold text-center px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-700 shadow-md">
                {image.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
