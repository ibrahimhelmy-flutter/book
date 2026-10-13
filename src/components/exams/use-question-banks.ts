import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchJson } from "@/lib/fetch-json";
import { dataUrl } from "@/content/paths";
import type { EnrichedSimpleQuestion } from "@/lib/practice";
import type { OfficialAssessmentQuestion, OfficialLessonAssessments } from "@/types/assessments";

export type BankStatus = "idle" | "loading" | "ready" | "error";

export interface BankState<T> {
  status: BankStatus;
  questions: T[];
  error: Error | null;
  retry: () => void;
}

const NO_FILES: never[] = [];

const practiceUrl = (partKey: string, lessonKey: string) => dataUrl(partKey, `practice/${lessonKey}.json`);

/**
 * Loads per-lesson JSON files (null = idle, nothing fetched). Files already loaded are kept, so
 * narrowing or widening the scope never refetches or flashes a loading state for them; only the
 * missing files are requested (fetchJson memoises per URL for the session).
 */
function useLessonFiles<T>(urls: string[] | null): { status: BankStatus; files: T[]; error: Error | null; retry: () => void } {
  const [loaded, setLoaded] = useState<Record<string, T>>({});
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  const urlsKey = urls ? urls.join("|") : null;
  const missingKey = urls ? urls.filter((u) => !(u in loaded)).join("|") : "";

  useEffect(() => {
    if (!missingKey) return;
    let alive = true;
    const list = missingKey.split("|");
    setError(null);
    Promise.all(list.map((u) => fetchJson<T>(u))).then(
      (data) => {
        if (!alive) return;
        setLoaded((prev) => {
          const next = { ...prev };
          list.forEach((u, i) => {
            next[u] = data[i];
          });
          return next;
        });
      },
      (err: Error) => {
        if (alive) setError(err);
      }
    );
    return () => {
      alive = false;
    };
  }, [missingKey, attempt]);

  const files = useMemo(
    () => (urlsKey ? urlsKey.split("|").filter((u) => u in loaded).map((u) => loaded[u]) : []),
    [urlsKey, loaded]
  );
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const status: BankStatus = urlsKey === null ? "idle" : !missingKey ? "ready" : error ? "error" : "loading";
  return { status, files: status === "ready" ? files : NO_FILES, error: status === "error" ? error : null, retry };
}

/** Practice questions (practice/<lessonKey>.json) for the given lesson sets; null = not needed yet. */
export function usePracticeBank(partKey: string, lessonKeys: string[] | null): BankState<EnrichedSimpleQuestion> {
  const keysKey = lessonKeys ? lessonKeys.join("|") : null;
  const urls = useMemo(
    () => (keysKey === null ? null : keysKey ? keysKey.split("|").map((k) => practiceUrl(partKey, k)) : []),
    [partKey, keysKey]
  );
  const { status, files, error, retry } = useLessonFiles<EnrichedSimpleQuestion[]>(urls);
  const questions = useMemo(() => files.flat(), [files]);
  return { status, questions, error, retry };
}

/** Official booklet questions (<companionSlug>/<lessonId>.json); null lessonIds or slug = idle. */
export function useOfficialBank(
  partKey: string,
  companionSlug: string | null,
  lessonIds: string[] | null
): BankState<OfficialAssessmentQuestion> {
  const idsKey = companionSlug && lessonIds ? lessonIds.join("|") : null;
  const urls = useMemo(
    () =>
      idsKey === null || !companionSlug
        ? null
        : idsKey
          ? idsKey.split("|").map((id) => dataUrl(partKey, `${companionSlug}/${id}.json`))
          : [],
    [partKey, companionSlug, idsKey]
  );
  const { status, files, error, retry } = useLessonFiles<OfficialLessonAssessments>(urls);
  const questions = useMemo(() => files.flatMap((f) => f.questions), [files]);
  return { status, questions, error, retry };
}

/** One-shot load of several practice lesson sets (used by the ready-made presets). */
export async function loadPracticeQuestions(partKey: string, lessonKeys: string[]): Promise<EnrichedSimpleQuestion[]> {
  const files = await Promise.all(lessonKeys.map((k) => fetchJson<EnrichedSimpleQuestion[]>(practiceUrl(partKey, k))));
  return files.flat();
}
