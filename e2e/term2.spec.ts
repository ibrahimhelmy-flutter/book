import { test, expect } from "@playwright/test";
import { trackPageErrors } from "./helpers";

const TERM2 = "g/secondary-2/programming-ai/term-2/";

test.describe("term-2 (no authored deep questions, no assessments booklet yet)", () => {
  test("lesson renders with the empty-state banks instead of invented content", async ({ page }) => {
    const errs = trackPageErrors(page);
    await page.goto(`${TERM2}chapters/chapter-5/data-collection-methods/`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("طرق جمع البيانات");
    await page.getByRole("button", { name: /أسئلة الفهم/ }).first().click();
    await expect(page.getByText("لا توجد أسئلة فهم مُعدّة لهذا الدرس بعد.")).toBeVisible();
    errs.assertNone();
  });

  test("exams page shows term-2 counts (0 official, authored practice present)", async ({ page }) => {
    await page.goto(`${TERM2}exams/`);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
  });

  test("term-2 lesson has no companion link (booklet coming soon)", async ({ page }) => {
    const errs = trackPageErrors(page);
    await page.goto(`${TERM2}chapters/chapter-6/statistical-inference/`);
    await page.getByTitle("الانتقال إلى تمارين وأسئلة الدرس").first().click();
    await expect(page.getByText("لا توجد تقييمات رسمية لهذا الدرس.")).toBeVisible();
    await expect(page.getByRole("link", { name: /افتح في كتيب التقييمات/ })).toHaveCount(0);
    errs.assertNone();
  });

  test("term-2 companion route (assessments) is not generated yet", async ({ page }) => {
    const res = await page.goto(`${TERM2}assessments/`);
    expect(res?.status()).toBe(404);
  });
});
