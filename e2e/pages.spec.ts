import { test, expect } from "@playwright/test";
import { part, trackPageErrors, trackRequests } from "./helpers";

test("exams page shows counts and loads only the official banks on its default tab", async ({ page }) => {
  const errs = trackPageErrors(page);
  const requests = trackRequests(page);
  await page.goto(part("exams/"));
  await expect(page.getByText(/558/).first()).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(requests.some((u) => /\/data\/.+\/assessments\/lesson-\d+-\d+\.json/.test(u))).toBeTruthy();
  expect(requests.filter((u) => /\/data\/.+\/practice\//.test(u))).toEqual([]);
  errs.assertNone();
});

test("glossary search normalises Arabic (الامن matches الأمن)", async ({ page }) => {
  const errs = trackPageErrors(page);
  await page.goto(part("glossary/"));
  await page.getByRole("textbox").first().fill("الامن");
  await expect(page.getByText(/الأمن/).filter({ visible: true }).first()).toBeVisible();
  errs.assertNone();
});

test("simulators page renders", async ({ page }) => {
  const errs = trackPageErrors(page);
  await page.goto(part("simulators/"));
  await expect(page.getByRole("heading", { name: "معمل المحاكيات والتجارب الحية" })).toBeVisible();
  errs.assertNone();
});

test("search modal fetches the part search index only when opened", async ({ page }) => {
  const requests = trackRequests(page);
  await page.goto(part());
  await page.waitForLoadState("networkidle");
  expect(requests.filter((u) => u.includes("search-lessons.json"))).toEqual([]);
  await page.getByTitle("بحث (Ctrl+K)").click();
  await page.getByRole("textbox").fill("ذكاء");
  await expect(page.getByText(/الدروس المطابقة/)).toBeVisible();
  expect(requests.some((u) => u.includes("search-lessons.json"))).toBeTruthy();
});
