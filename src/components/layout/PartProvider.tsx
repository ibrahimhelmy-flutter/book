"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { AcronymTerm } from "@/types";
import type { PartKey, PartManifest } from "@/types/catalog";
import { registerAcronyms } from "@/lib/acronyms";
import { dataUrl } from "@/content/paths";
import { fetchJson } from "@/lib/fetch-json";

const PartContext = createContext<PartManifest | null>(null);

interface ActivePartState {
  manifest: PartManifest | null;
  setManifest: (m: PartManifest) => void;
}
const ActivePartContext = createContext<ActivePartState>({ manifest: null, setManifest: () => {} });

const LAST_PART_KEY = "last_part_key";

/**
 * Root-level holder of the most recently visited part, so UI that lives outside the part layout
 * (Navbar search / index / offline pack) can act on it. On catalog pages it restores the part saved in
 * localStorage (or the first available part for a new visitor) so those buttons are always present.
 */
export function ActivePartProvider({
  availablePartKeys,
  children,
}: {
  availablePartKeys: PartKey[];
  children: React.ReactNode;
}) {
  const [manifest, setManifest] = useState<PartManifest | null>(null);
  const fallbackKeys = availablePartKeys.join("|");

  useEffect(() => {
    const keys = fallbackKeys ? fallbackKeys.split("|") : [];
    const last = getLastPartKey();
    const key = last && keys.includes(last) ? last : keys[0];
    if (!key) return;
    let alive = true;
    fetchJson<PartManifest>(dataUrl(key, "manifest.json")).then(
      // A part page may have set its own manifest meanwhile; never replace it
      (m) => alive && setManifest((cur) => cur ?? m),
      () => {}
    );
    return () => {
      alive = false;
    };
  }, [fallbackKeys]);

  return <ActivePartContext.Provider value={{ manifest, setManifest }}>{children}</ActivePartContext.Provider>;
}

/** Provides one part's light manifest (TOC, stats, companions) to everything under the part layout. */
export function PartProvider({
  manifest,
  acronyms,
  children,
}: {
  manifest: PartManifest;
  acronyms: AcronymTerm[];
  children: React.ReactNode;
}) {
  registerAcronyms(acronyms);
  const { setManifest } = useContext(ActivePartContext);

  useEffect(() => {
    setManifest(manifest);
    try {
      localStorage.setItem(LAST_PART_KEY, manifest.key);
    } catch {
      /* storage unavailable */
    }
  }, [manifest, setManifest]);

  return <PartContext.Provider value={manifest}>{children}</PartContext.Provider>;
}

export function usePart(): PartManifest {
  const ctx = useContext(PartContext);
  if (!ctx) throw new Error("usePart() must be used inside a part route (PartProvider)");
  return ctx;
}

export function usePartOptional(): PartManifest | null {
  return useContext(PartContext);
}

/** The part being viewed, or the last part visited (null until it is restored on a catalog page). */
export function useActivePart(): PartManifest | null {
  const inPart = useContext(PartContext);
  const { manifest } = useContext(ActivePartContext);
  return inPart ?? manifest;
}

export function getLastPartKey(): string | null {
  try {
    return localStorage.getItem(LAST_PART_KEY);
  } catch {
    return null;
  }
}
