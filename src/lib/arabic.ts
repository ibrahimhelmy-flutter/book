/**
 * Utility functions for Arabic text processing, normalization, and search matching.
 */

/**
 * Normalizes Arabic text by:
 * - Stripping tashkeel (diacritics: fatha, damma, kasra, tanween, sukun, shadda)
 * - Stripping tatweel / kashida (ـ)
 * - Normalizing alifs (إ, أ, آ -> ا)
 * - Normalizing taa marbuta to haa (ة -> ه)
 * - Normalizing alif maqsura to yaa (ى -> ي)
 * - Converting English characters to lowercase
 * - Trimming and collapsing consecutive whitespace
 */
export function normalizeArabicText(text: string): string {
  if (!text) return "";

  return text
    // Remove diacritics (tashkeel)
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // Remove tatweel (kashida)
    .replace(/\u0640/g, "")
    // Normalize alifs
    .replace(/[إأآٱ]/g, "ا")
    // Normalize taa marbuta
    .replace(/ة/g, "ه")
    // Normalize alif maqsura to yaa
    .replace(/ى/g, "ي")
    // Lowercase english characters
    .toLowerCase()
    // Collapse extra whitespaces
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if a target string contains the query string, normalizing both Arabic and English text.
 */
export function matchesSearch(target: string | undefined | null, query: string): boolean {
  if (!target) return false;
  if (!query || query.trim() === "") return true;
  const normTarget = normalizeArabicText(target);
  const normQuery = normalizeArabicText(query);
  if (!normQuery) return true;
  return normTarget.includes(normQuery);
}
