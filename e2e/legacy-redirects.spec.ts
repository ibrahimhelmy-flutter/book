import { test, expect } from "@playwright/test";
import { part } from "./helpers";

/** Pre-catalog URLs (old links, bookmarks, cached PWAs) must land on the term-1 equivalent. */
const cases: [string, string][] = [
  ["chapters/chapter-1/how-ai-works/", part("chapters/chapter-1/how-ai-works/")],
  ["chapters/chapter-2/", part("chapters/chapter-2/")],
  ["chapters/chapter-1/how-ai-works/storyline/", part("chapters/chapter-1/how-ai-works/storyline/")],
  ["exams/", part("exams/")],
  ["practice/", part("exams/")],
  ["glossary/", part("glossary/")],
  ["simulators/", part("simulators/")],
];

for (const [from, to] of cases) {
  test(`/${from} → /${to}`, async ({ page }) => {
    await page.goto(from);
    await expect(page).toHaveURL(new RegExp(`/${to}$`));
  });
}
