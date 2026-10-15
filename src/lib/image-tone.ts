/**
 * Decides how a textbook image should be shown on the dark theme.
 *
 * "diagram" = a grayscale drawing on a white background; it is shown colour-inverted
 * (white page → dark, black lines → light). Everything else is a "picture" and is only
 * dimmed, so colour illustrations keep their colours. The lightbox always shows the original.
 */
export type ImageTone = "diagram" | "picture";

const SAMPLE = 64;
const CHROMA_THRESHOLD = 40; // max(r,g,b) - min(r,g,b) above this counts as a coloured pixel
const MAX_COLOURED_SHARE = 0.03;
const MIN_BORDER_BRIGHTNESS = 225;

const cache = new Map<string, ImageTone>();

export function classifyImage(img: HTMLImageElement): ImageTone {
  const key = img.currentSrc || img.src;
  const cached = cache.get(key);
  if (cached) return cached;

  let tone: ImageTone = "picture";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE;
    canvas.height = SAMPLE;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (ctx) {
      // Transparent areas count as white paper.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, SAMPLE, SAMPLE);
      ctx.drawImage(img, 0, 0, SAMPLE, SAMPLE);
      const { data } = ctx.getImageData(0, 0, SAMPLE, SAMPLE);

      let coloured = 0;
      let borderSum = 0;
      let borderCount = 0;
      for (let y = 0; y < SAMPLE; y++) {
        for (let x = 0; x < SAMPLE; x++) {
          const i = (y * SAMPLE + x) * 4;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (Math.max(r, g, b) - Math.min(r, g, b) > CHROMA_THRESHOLD) coloured++;
          if (x === 0 || y === 0 || x === SAMPLE - 1 || y === SAMPLE - 1) {
            borderSum += (r + g + b) / 3;
            borderCount++;
          }
        }
      }

      const colouredShare = coloured / (SAMPLE * SAMPLE);
      const borderBrightness = borderSum / borderCount;
      if (colouredShare < MAX_COLOURED_SHARE && borderBrightness >= MIN_BORDER_BRIGHTNESS) tone = "diagram";
    }
  } catch {
    tone = "picture";
  }

  cache.set(key, tone);
  return tone;
}

/** CSS class (defined in globals.css) for a classified image; null while it is still loading. */
export function imageToneClass(tone: ImageTone | null): string {
  if (tone === "diagram") return "img-tone-diagram";
  if (tone === "picture") return "img-tone-picture";
  return "opacity-0";
}
