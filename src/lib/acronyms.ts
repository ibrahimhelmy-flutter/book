/**
 * Acronym lookup used by the text renderers (EyeComfortText). The active part's acronyms are
 * registered by PartProvider before its children render, so lookups need no data import.
 */
import type { AcronymTerm } from "@/types";

let byShort = new Map<string, AcronymTerm>();
let registeredFrom: AcronymTerm[] | null = null;

export function registerAcronyms(list: AcronymTerm[]): void {
  if (registeredFrom === list) return;
  registeredFrom = list;
  byShort = new Map(list.map((a) => [a.short.toUpperCase(), a]));
}

export function getAcronym(term: string): AcronymTerm | undefined {
  return byShort.get(term.trim().toUpperCase());
}
