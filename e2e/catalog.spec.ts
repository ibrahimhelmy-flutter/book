import { test, expect } from "@playwright/test";
import { part, trackPageErrors } from "./helpers";

test.describe("catalog: grades → books → parts", () => {
  test("home lists the grade, its book and both available terms", async ({ page }) => {
    const errs = trackPageErrors(page);
    await page.goto("./");
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    const grade = page.locator("section#secondary-2");
    await expect(grade.getByRole("heading", { name: "الصف الثاني الثانوي" })).toBeVisible();
    await expect(grade.getByRole("heading", { name: "البرمجة والذكاء الاصطناعي" })).toBeVisible();
    await expect(grade.getByRole("link", { name: /الترم الأول/ })).toBeVisible();
    await expect(grade.getByRole("link", { name: /الترم الثاني/ })).toBeVisible();
    await expect(grade.getByRole("link", { name: "كتيب التقييمات" })).toBeVisible();
    // Term-2's companion booklet isn't available yet; shown but not a link
    await expect(grade.getByText("قريبًا").first()).toBeVisible();
    errs.assertNone();
  });

  test("navigates home → grade → book → part home", async ({ page }) => {
    await page.goto("./");
    await page.getByRole("link", { name: "كل كتب الصف ←" }).click();
    await expect(page).toHaveURL(/\/g\/secondary-2\/$/);
    await page.getByRole("link", { name: /البرمجة والذكاء الاصطناعي/ }).first().click();
    await expect(page).toHaveURL(/\/g\/secondary-2\/programming-ai\/$/);
    await page.getByRole("link", { name: /الترم الأول/ }).click();
    await expect(page).toHaveURL(new RegExp(`${part()}$`));
    await expect(page.getByRole("heading", { level: 1 })).toContainText("البرمجة والذكاء الاصطناعي");
    await expect(page.getByText("فصول المنهج الدراسي")).toBeVisible();
  });

  test("term-2 part home renders its own 3 chapters / 9 lessons", async ({ page }) => {
    const errs = trackPageErrors(page);
    await page.goto("g/secondary-2/programming-ai/term-2/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("البرمجة والذكاء الاصطناعي");
    await expect(page.getByText("9 درساً")).toBeVisible();
    errs.assertNone();
  });

  test("an unknown part produces no page", async ({ page }) => {
    const res = await page.goto("g/secondary-2/programming-ai/term-99/");
    expect(res?.status()).toBe(404);
  });
});
