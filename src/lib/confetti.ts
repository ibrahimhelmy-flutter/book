"use client";

export function fireConfetti(options?: {
  particleCount?: number;
  spread?: number;
  origin?: { x?: number; y?: number };
}) {
  if (typeof window === "undefined") return;

  import("canvas-confetti")
    .then((confettiModule) => {
      const confetti = confettiModule.default || confettiModule;
      if (typeof confetti === "function") {
        confetti(options);
      }
    })
    .catch(() => {
      // Ignore confetti loading failure gracefully
    });
}
