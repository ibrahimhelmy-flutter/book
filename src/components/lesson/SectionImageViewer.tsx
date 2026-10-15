"use client";

import React, { useState, useEffect } from "react";
import { ZoomIn, X, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { getAssetPath } from "@/lib/utils";
import { classifyImage, imageToneClass, type ImageTone } from "@/lib/image-tone";

interface SectionImageViewerProps {
  image: {
    src: string;
    caption: string;
    alt?: string;
  };
}

/** Retries a failed image once with/without the /book base path, then from the term-1 folder. */
function retryImageSrc(target: HTMLImageElement, src: string) {
  const attempts = parseInt(target.dataset.attempts || "0", 10);
  const rawSrc = src ? (src.startsWith("/") ? src : `/${src}`) : "";
  if (!rawSrc) return;
  if (attempts === 0) {
    target.dataset.attempts = "1";
    if (target.src.includes("/book/") && !rawSrc.startsWith("/book/")) {
      target.src = rawSrc;
    } else if (!target.src.includes("/book/")) {
      target.src = `/book${rawSrc}`;
    }
  } else if (attempts === 1) {
    target.dataset.attempts = "2";
    const filename = rawSrc.split("/").pop();
    if (filename) target.src = `../../images/extracted/${filename}`;
  }
}

export function SectionImageViewer({ image }: SectionImageViewerProps) {
  const [tone, setTone] = useState<ImageTone | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const imgRef = React.useRef<HTMLImageElement>(null);

  // A cached image can finish loading before React attaches onLoad
  useEffect(() => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth > 0) setTone(classifyImage(img));
  }, [image.src]);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  if (isCollapsed) {
    return (
      <div className="font-ui my-3 flex items-center justify-between gap-3 p-2.5 px-3.5 rounded-xl border border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-2 min-w-0 text-slate-400">
          <ImageIcon className="w-4 h-4 text-indigo-400 shrink-0" aria-hidden="true" />
          <span className="truncate text-[calc(var(--lesson-body-size,1rem)*0.8)]">
            {image.caption || image.alt || "صورة توضيحية"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="px-2.5 py-1 rounded-lg bg-indigo-950/50 hover:bg-indigo-900/70 text-indigo-300 hover:text-white border border-indigo-800/50 text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
          title="إظهار الصورة في الصفحة"
        >
          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
          <span>إظهار الصورة</span>
        </button>
      </div>
    );
  }

  return (
    <>
      {/* An inverted diagram's page turns #1a1a1a, so the frame matches it to hide the image edge */}
      <figure
        className={`relative my-4 sm:my-5 rounded-2xl overflow-hidden border border-slate-800 ${
          tone === "diagram" ? "bg-[#1a1a1a]" : "bg-slate-950"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsCollapsed(true)}
          className="font-ui absolute top-2 left-2 z-10 px-2 py-1 rounded-lg bg-slate-900/85 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/70 text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors backdrop-blur-sm"
          title="طي الصورة إلى شريط مدمج"
          aria-label="طي الصورة"
        >
          <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
          <span>طي</span>
        </button>
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="w-full flex flex-col items-center gap-2 p-2 sm:p-3 cursor-zoom-in"
          aria-label={`تكبير الصورة: ${image.caption || image.alt || ""}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={getAssetPath(image.src)}
            alt={image.alt || image.caption}
            className={`w-auto max-w-full max-h-[60vh] object-contain transition-opacity duration-300 ${
              tone === "picture" ? "rounded-xl" : ""
            } ${imageToneClass(tone)}`}
            loading="lazy"
            decoding="async"
            onLoad={(e) => setTone(classifyImage(e.currentTarget))}
            onError={(e) => retryImageSrc(e.currentTarget, image.src)}
          />
          <span className="flex items-start justify-center gap-2 px-1 pb-1 text-center text-slate-400 leading-relaxed text-[calc(var(--lesson-body-size,1rem)*0.85)]">
            <ZoomIn className="w-4 h-4 mt-[0.3em] shrink-0 text-slate-500" aria-hidden="true" />
            {image.caption && <span>{image.caption}</span>}
          </span>
        </button>
      </figure>

      {/* Lightbox shows the original image, exactly as printed in the book */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-6 animate-fadeIn"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="إغلاق (Esc)"
            aria-label="إغلاق"
          >
            <X className="w-6 h-6" />
          </button>

          <div
            className="max-w-5xl max-h-[88vh] flex flex-col items-center justify-center space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={getAssetPath(image.src)}
              alt={image.alt || image.caption}
              className="max-h-[75vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain"
              onError={(e) => retryImageSrc(e.currentTarget, image.src)}
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
