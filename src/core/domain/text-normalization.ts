/**
 * Text Normalization Engine for Canonical Textbook Fidelity
 * 
 * Strict orthographic policy:
 * 1. Unicode NFC Normalization
 * 2. Strict whitespace normalization (preserving word boundaries, collapsing repeated spaces)
 * 3. Arabic letter integrity preservation:
 *    - PRESERVE hamza distinct forms: أ, إ, آ, ء, ئ, ؤ
 *    - PRESERVE tā' marbūṭa (ة) vs hā' (ه)
 *    - PRESERVE yā' (ي) vs alif maqṣūra (ى)
 * 4. Strip only non-essential diacritics (harakat) and kashida (ـ) for comparison
 */

// Non-semantic Arabic diacritics (fat-ha, damma, kasra, sukoon, shaddah, tanween)
const ARABIC_DIACRITICS_REGEX = /[\u064B-\u0652\u0670]/g;
// Kashida / Tatweel
const KASHIDA_REGEX = /\u0640/g;

export interface NormalizationOptions {
  stripDiacritics?: boolean;
  stripKashida?: boolean;
  normalizeWhitespace?: boolean;
}

export function normalizeText(
  text: string,
  options: NormalizationOptions = {
    stripDiacritics: true,
    stripKashida: true,
    normalizeWhitespace: true,
  }
): string {
  if (!text) return "";

  // 1. Unicode NFC Canonical Composition
  let normalized = text.normalize("NFC");

  // 2. Strip Tatweel / Kashida
  if (options.stripKashida !== false) {
    normalized = normalized.replace(KASHIDA_REGEX, "");
  }

  // 3. Strip optional Harakat / Tashkeel if requested
  if (options.stripDiacritics !== false) {
    normalized = normalized.replace(ARABIC_DIACRITICS_REGEX, "");
  }

  // 4. Whitespace Normalization:
  // - Replace non-breaking spaces (\u00A0) and tabs with regular space
  // - Collapse multiple spaces into single space per line
  // - Standardize newlines
  if (options.normalizeWhitespace !== false) {
    normalized = normalized
      .replace(/\r\n/g, "\n")
      .replace(/[\t\v\f\u00A0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000]/g, " ")
      .split("\n")
      .map((line) => line.replace(/ +/g, " ").trim())
      .filter((line) => line.length > 0)
      .join("\n");
  }

  return normalized.trim();
}

export interface DiffResult {
  isEqual: boolean;
  similarityPercentage: number;
  differences: Array<{
    type: "missing" | "extra" | "modified";
    expected: string;
    actual: string;
  }>;
}

export function compareCanonicalText(expected: string, actual: string): DiffResult {
  const normExpected = normalizeText(expected);
  const normActual = normalizeText(actual);

  if (normExpected === normActual) {
    return {
      isEqual: true,
      similarityPercentage: 100,
      differences: [],
    };
  }

  const expectedWords = normExpected.split(/\s+/);
  const actualWords = normActual.split(/\s+/);

  let matchCount = 0;
  const expectedSet = new Set(expectedWords);
  actualWords.forEach((w) => {
    if (expectedSet.has(w)) matchCount++;
  });

  const similarity = Math.round(
    (2 * matchCount) / (expectedWords.length + actualWords.length) * 100
  );

  return {
    isEqual: false,
    similarityPercentage: Math.min(100, Math.max(0, similarity)),
    differences: [
      {
        type: "modified",
        expected: normExpected,
        actual: normActual,
      },
    ],
  };
}
