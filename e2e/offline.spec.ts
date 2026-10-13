import { test, expect } from "@playwright/test";
import { part } from "./helpers";

/**
 * Downloads the term-1 offline pack through the real service worker, then goes offline and checks
 * that a lesson, its question banks and a companion-book page still open (client navigation + reload).
 */
test("term-1 offline pack works without network", async ({ page, context }) => {
  test.setTimeout(180_000);
  await page.goto(part());
  await page.evaluate(() => navigator.serviceWorker.ready);
  // The SW only controls the page after a reload on first install.
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 20_000 }).toBe(true);

  await page.getByRole("button", { name: "تحميل المنهج بدون إنترنت" }).filter({ visible: true }).first().click();
  await page.getByRole("button", { name: /تحميل الترم الأول كاملاً/ }).click();
  await expect(page.getByRole("button", { name: /إعادة التنزيل والتحقق/ })).toBeVisible({ timeout: 150_000 });

  await context.setOffline(true);

  // Hard navigation to a lesson that was never visited
  await page.goto(part("chapters/chapter-3/web-applications-architecture/")).catch(() => {});
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Question banks come from the pack cache
  await page.getByRole("button", { name: /التقييمات الرسمية \(\d+\)/ }).first().click();
  await expect(page.getByRole("link", { name: /افتح في كتيب التقييمات/ })).toBeVisible();
  await expect(page.getByText("تعذر تحميل الأسئلة")).toHaveCount(0);

  // Client-side navigation to the companion book (RSC payload from cache)
  await page.getByRole("link", { name: /افتح في كتيب التقييمات/ }).click();
  await expect(page).toHaveURL(/\/assessments\/chapter-3\//);
  await expect(page.getByRole("link", { name: "شرح الدرس في الكتاب المدرسي" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("link", { name: "شرح الدرس في الكتاب المدرسي" })).toBeVisible();
  await context.setOffline(false);
});
