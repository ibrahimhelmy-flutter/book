"use client";

import { useEffect, useState } from "react";

/**
 * Tiny cached JSON loader for generated data files (public/data/**). Responses are memoised per URL
 * for the session; the service worker caches them for offline use.
 */
const cache = new Map<string, Promise<unknown>>();

export function fetchJson<T>(url: string): Promise<T> {
  let p = cache.get(url) as Promise<T> | undefined;
  if (!p) {
    p = fetch(url).then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res.json() as Promise<T>;
    });
    p.catch(() => cache.delete(url));
    cache.set(url, p);
  }
  return p;
}

export type JsonState<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "ready"; data: T; error: null }
  | { status: "error"; data: null; error: Error };

/** Fetches one or more JSON URLs (null/[] = idle) and returns their combined state. */
export function useJson<T>(url: string | null): JsonState<T> {
  const [state, setState] = useState<JsonState<T>>({ status: "loading", data: null, error: null });
  useEffect(() => {
    if (!url) return;
    let alive = true;
    setState({ status: "loading", data: null, error: null });
    fetchJson<T>(url).then(
      (data) => alive && setState({ status: "ready", data, error: null }),
      (error: Error) => alive && setState({ status: "error", data: null, error })
    );
    return () => {
      alive = false;
    };
  }, [url]);
  return state;
}

export function useJsonMany<T>(urls: string[]): JsonState<T[]> {
  const key = urls.join("|");
  const [state, setState] = useState<JsonState<T[]>>({ status: "loading", data: null, error: null });
  useEffect(() => {
    let alive = true;
    const list = key ? key.split("|") : [];
    setState({ status: "loading", data: null, error: null });
    Promise.all(list.map((u) => fetchJson<T>(u))).then(
      (data) => alive && setState({ status: "ready", data, error: null }),
      (error: Error) => alive && setState({ status: "error", data: null, error })
    );
    return () => {
      alive = false;
    };
  }, [key]);
  return state;
}
