"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { AcronymTerm } from "@/types";
import type { PartManifest } from "@/types/catalog";
import { registerAcronyms } from "@/lib/acronyms";

const PartContext = createContext<PartManifest | null>(null);

interface ActivePartState {
  manifest: PartManifest | null;
  setManifest: (m: PartManifest) => void;
}
const ActivePartContext = createContext<ActivePartState>({ manifest: null, setManifest: () => {} });

const LAST_PART_KEY = "last_part_key";

/**
 * Root-level holder of the most recently visited part, so UI that lives outside the part layout
 * (Navbar search / index / offline pack) can act on it.
 */
export function ActivePartProvider({ children }: { children: React.ReactNode }) {
  const [manifest, setManifest] = useState<PartManifest | null>(null);
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

/** The part being viewed, or the last part visited in this session (null on a fresh catalog page). */
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
