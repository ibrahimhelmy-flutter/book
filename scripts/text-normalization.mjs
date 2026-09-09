/**
 * Standalone Node.js ESM Text Normalization Engine for Canonical Textbook Fidelity
 */

const ARABIC_DIACRITICS_REGEX = /[\u064B-\u0652\u0670]/g;
const KASHIDA_REGEX = /\u0640/g;

export function normalizeText(text, options = {}) {
  if (!text) return "";

  const stripDiacritics = options.stripDiacritics !== false;
  const stripKashida = options.stripKashida !== false;
  const normalizeWhitespace = options.normalizeWhitespace !== false;

  // 1. Unicode NFC Canonical Composition
  let normalized = text.normalize("NFC");

  // 2. Strip Tatweel / Kashida
  if (stripKashida) {
    normalized = normalized.replace(KASHIDA_REGEX, "");
  }

  // 3. Strip optional Harakat / Tashkeel if requested
  if (stripDiacritics) {
    normalized = normalized.replace(ARABIC_DIACRITICS_REGEX, "");
  }

  // 4. Whitespace Normalization:
  if (normalizeWhitespace) {
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

export function compareCanonicalText(expected, actual) {
  const normExpected = normalizeText(expected);
  const normActual = normalizeText(actual);

  if (normExpected === normActual) {
    return {
      isEqual: true,
      similarityPercentage: 100,
      differences: []
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
        actual: normActual
      }
    ]
  };
}
