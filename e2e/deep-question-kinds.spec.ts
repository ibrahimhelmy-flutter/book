import { test, expect } from "@playwright/test";
import { part, trackPageErrors } from "./helpers";

// Lesson 2-1 is the pilot bank that mixes mcq, true_false, fill_blank and essay questions.
const LESSON = part("chapters/chapter-2/encryption-authentication-technologies/");

test("chapter 2 page opens its mixed question bank, filtered by lesson", async ({ page }) => {
  const errs = trackPageErrors(page);
  await page.goto(part("chapters/chapter-2/"));
  const bankRequest = page.waitForRequest((r) => /\/deep\/2-review\.json$/.test(r.url()));
  await page.getByRole("button", { name: /بنك أسئلة الوحدة \(200 سؤالًا\)/ }).click();
  await bankRequest;
  await expect(page.getByRole("button", { name: /^كل الأنواع \(200\)/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^مقالي \(30\)/ })).toBeVisible();
  await page.getByRole("button", { name: /أسئلة شاملة تربط دروس الوحدة \(30\)/ }).click();
  await expect(page.getByText(/سؤال 1 من 30/).first()).toBeVisible();
  errs.assertNone();
});

test("the lessons index icon opens the unit bank on the chapter page", async ({ page }) => {
  await page.goto(part("chapters/chapter-2/encryption-authentication-technologies/"));
  await page.getByRole("button", { name: "القائمة" }).click();
  await page.getByRole("button", { name: /فهرس المنهج والدروس/ }).click();
  await page.getByRole("link", { name: /بنك أسئلة الوحدة 2 \(200 سؤالًا\)/ }).click();
  await expect(page).toHaveURL(/chapters\/chapter-2\/#unit-bank$/);
  await expect(page.getByRole("button", { name: /^كل الأنواع \(200\)/ })).toBeVisible();
});

test.describe("desktop sidebar unit bank icon", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("opens the unit bank from a lesson page, and again from the chapter page", async ({ page }) => {
    const errs = trackPageErrors(page);
    await page.goto(LESSON);
    const icon = page.locator("aside").getByRole("link", { name: /بنك أسئلة الوحدة 2 \(200 سؤالًا\)/ });
    await icon.click();
    await expect(page).toHaveURL(/chapters\/chapter-2\/#unit-bank$/);
    const allKinds = page.getByRole("button", { name: /^كل الأنواع \(200\)/ });
    await expect(allKinds).toBeVisible();
    await expect(allKinds).toBeInViewport();

    // Scrolled away on the same page: the icon brings the (already loaded) bank back into view.
    await page.evaluate(() => window.scrollTo(0, 0));
    await icon.click();
    await expect(allKinds).toBeInViewport();
    errs.assertNone();
  });
});

test.describe("comprehension question kinds", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LESSON);
    await page.getByRole("button", { name: /التقييمات الرسمية \(\d+\)/ }).first().click();
    await page.getByRole("tab", { name: /فهم/ }).click();
  });

  test("true/false shows the correction of a false statement", async ({ page }) => {
    const errs = trackPageErrors(page);
    await page.getByRole("button", { name: /^صواب أم خطأ/ }).click();
    // The third true/false item of the bank is a false statement.
    await page.getByTitle("سؤال 3", { exact: true }).click();
    await page.getByRole("button", { name: /^صواب( \d)?$/ }).click();
    await expect(page.getByText("إجابة غير صحيحة")).toBeVisible();
    await expect(page.getByText("تصحيح العبارة:")).toBeVisible();
    errs.assertNone();
  });

  test("fill-blank accepts a normalized answer", async ({ page }) => {
    await page.getByRole("button", { name: /^أكمل/ }).click();
    await page.getByRole("textbox", { name: "الفراغ 1" }).fill("tls");
    await page.getByRole("button", { name: "تحقق من إجابتي" }).click();
    await expect(page.getByText("إجابة صحيحة! أحسنت")).toBeVisible();
  });

  test("fill-blank «show answer» reveals it without marking it wrong", async ({ page }) => {
    await page.getByRole("button", { name: /^أكمل/ }).click();
    await page.getByRole("button", { name: "إظهار الإجابة" }).click();
    await expect(page.getByText("تم عرض الإجابة")).toBeVisible();
    await expect(page.getByText("إجابة غير صحيحة")).toHaveCount(0);
  });

  test("essay reveals the model answer and a self-check list", async ({ page }) => {
    await page.getByRole("button", { name: /^مقالي/ }).click();
    await page.getByRole("button", { name: /اعرض الإجابة النموذجية/ }).click();
    await expect(page.getByText("الإجابة النموذجية:")).toBeVisible();
    const points = page.getByRole("list", { name: "النقاط الأساسية" }).getByRole("button");
    const total = await points.count();
    for (let i = 0; i < total; i++) await points.nth(i).click();
    await expect(page.getByText("إجابة صحيحة! أحسنت")).toBeVisible();
  });
});
