"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GlossaryTerm } from "@/types";
import { buildCopyText, type ChapterMeta, type LessonMeta } from "./glossary-meta";

/** Text-to-speech with a single "currently playing" id; speaking the playing id again stops it. */
export function useSpeech() {
  const [playingId, setPlayingIdState] = useState<string | null>(null);
  const playingRef = useRef<string | null>(null);

  const setPlayingId = useCallback((id: string | null) => {
    playingRef.current = id;
    setPlayingIdState(id);
  }, []);

  const speak = useCallback(
    (id: string, text: string, lang = "ar-SA") => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      if (playingRef.current === id) {
        setPlayingId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.9;
      const done = () => {
        if (playingRef.current === id) setPlayingId(null);
      };
      utterance.onend = done;
      utterance.onerror = done;
      window.speechSynthesis.speak(utterance);
      setPlayingId(id);
    },
    [setPlayingId]
  );

  useEffect(
    () => () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
    },
    []
  );

  return { playingId, speak };
}

/** Copies a term (with chapter/lesson context) to the clipboard and flags it as copied for 2s. */
export function useCopyTerm(chapterMap: Record<string, ChapterMeta>, lessonMap: Record<string, LessonMeta>) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copyTerm = useCallback(
    (term: GlossaryTerm) => {
      const text = buildCopyText(term, chapterMap[term.chapterId]?.title || "", lessonMap[term.lessonNumber]?.title || "");
      navigator.clipboard?.writeText(text).catch(() => {});
      setCopiedId(term.id);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopiedId((curr) => (curr === term.id ? null : curr));
      }, 2000);
    },
    [chapterMap, lessonMap]
  );

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    []
  );

  return { copiedId, copyTerm };
}
