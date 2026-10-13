import { test, expect } from "@playwright/test";
import { part, trackPageErrors } from "./helpers";

test.describe("companion book (كتيب التقييمات)", () => {
  test("TOC lists all 14 booklet lessons", async ({ page }) => {
    await page.goto(part("assessments/"));
    await expect(page.getByRole("heading", { level: 1, name: "كتيب التقييمات" })).toBeVisible();
    await expect(page.locator('a[href*="/assessments/chapter-"]').filter({ hasText: "اختيار" })).toHaveCount(14);
  });

  test("booklet lesson shows the questions and links back to the textbook lesson", async ({ page }) => {
    const errs = trackPageErrors(page);
    await page.goto(part("assessments/chapter-1/how-ai-works/"));
    await expect(page.getByRole("heading", { level: 1 })).toContainText("كيف يعمل الذكاء الاصطناعي");
    await page.getByRole("link", { name: "شرح الدرس في الكتاب المدرسي" }).click();
    await expect(page).toHaveURL(new RegExp(`${part("chapters/chapter-1/how-ai-works/")}$`));
    errs.assertNone();
  });
});
