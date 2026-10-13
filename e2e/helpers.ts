import { expect, type Page } from "@playwright/test";

export const TERM1 = "secondary-2/programming-ai/term-1";
/** Part-relative path (relative to baseURL, i.e. without the /book base path). */
export const part = (sub = "") => `g/${TERM1}/${sub}`;

/** Fails the test on uncaught page errors (hydration crashes, ChunkLoadError, ...). */
export function trackPageErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  return {
    errors,
    assertNone: () => expect(errors, errors.join("\n")).toEqual([]),
  };
}

/** Records every request URL. */
export function trackRequests(page: Page) {
  const urls: string[] = [];
  page.on("request", (r) => urls.push(r.url()));
  return urls;
}

export const isBankRequest = (url: string) => /\/data\/.+\/(deep|assessments|practice)\//.test(url);
