import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toArabicDigits(num: number | string): string {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return String(num).replace(/[0-9]/g, (d) => arabicDigits[parseInt(d, 10)]);
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 180;
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function getAssetPath(path: string): string {
  if (!path) return path;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) return path;

  let basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  // Dynamic client-side resolution:
  // Detect if hosted under a repository subpath (e.g. GitHub Pages /book/) or at domain root (e.g. Vercel / localhost)
  if (typeof window !== "undefined") {
    if (window.location.pathname.startsWith("/book")) {
      basePath = "/book";
    } else {
      basePath = "";
    }
  }

  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // Prevent double-prefixing if path already includes basePath
  if (basePath && cleanPath.startsWith(basePath)) {
    return cleanPath;
  }
  return `${basePath}${cleanPath}`;
}

