import { test, expect } from "@playwright/test";
import { isBankRequest, part } from "./helpers";

const MAX_JS_BYTES = 300 * 1024;

for (const path of ["./", part(), part("chapters/chapter-1/how-ai-works/"), part("exams/")]) {
  test(`no JS response over 300 KB on /${path}`, async ({ page }) => {
    const big: string[] = [];
    page.on("response", async (res) => {
      if (!res.url().endsWith(".js")) return;
      const body = await res.body().catch(() => null);
      if (body && body.length > MAX_JS_BYTES) big.push(`${res.url()} (${Math.round(body.length / 1024)} KB)`);
    });
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(big).toEqual([]);
  });
}

test("catalog home loads no part data", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("./");
  await page.waitForLoadState("networkidle");
  expect(requests.filter(isBankRequest)).toEqual([]);
});
