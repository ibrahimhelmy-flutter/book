import { test, expect } from "@playwright/test";
import { isBankRequest, part, TERM1, trackPageErrors, trackRequests } from "./helpers";

const LESSON = part("chapters/chapter-1/how-ai-works/");

test.describe("lesson page", () => {
  test("renders the lesson without loading any question bank", async ({ page }) => {
    const errs = trackPageErrors(page);
    const requests = trackRequests(page);
    await page.goto(LESSON);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("كيف يعمل الذكاء الاصطناعي");
    await page.waitForLoadState("networkidle");
    expect(requests.filter(isBankRequest)).toEqual([]);
    errs.assertNone();
  });

  test("questions tabs fetch only this lesson's banks", async ({ page }) => {
    const requests = trackRequests(page);
    await page.goto(LESSON);
    await page.getByRole("button", { name: /التقييمات الرسمية \(\d+\)/ }).first().click();
    await expect(page.getByRole("link", { name: /افتح في كتيب التقييمات/ })).toBeVisible();
    await page.getByRole("tab", { name: /فهم/ }).click();
    await page.waitForLoadState("networkidle");
    const banks = requests.filter(isBankRequest).map((u) => decodeURIComponent(new URL(u).pathname).split("/data/")[1]);
    expect([...new Set(banks)].sort()).toEqual([`${TERM1}/assessments/lesson-1-2.json`, `${TERM1}/deep/1-2.json`]);
  });

  test("next lesson navigation", async ({ page }) => {
    await page.goto(LESSON);
    await page.getByRole("link", { name: /الدرس التالي/ }).click();
    await expect(page).toHaveURL(/chapter-1\/ai-daily-life-industry\/$/);
  });

  test("storyline page exists for the lesson", async ({ page }) => {
    const errs = trackPageErrors(page);
    await page.goto(`${LESSON}storyline/`);
    await expect(page.locator(`main a[href$="${LESSON}"]`).filter({ visible: true }).first()).toBeVisible();
    errs.assertNone();
  });
});
