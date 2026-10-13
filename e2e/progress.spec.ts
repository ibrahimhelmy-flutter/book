import { test, expect } from "@playwright/test";
import { TERM1 } from "./helpers";

test("v1 progress is migrated into term-1 and shown on the dashboard", async ({ page }) => {
  await page.addInitScript(() => {
    if (localStorage.getItem("e2e_seeded")) return;
    localStorage.setItem("e2e_seeded", "1");
    localStorage.setItem(
      "egyptian_curriculum_progress_v1",
      JSON.stringify({
        completedLessons: ["lesson-1-1", "lesson-1-2"],
        bookmarks: ["lesson-2-1"],
        quizScores: {},
        notes: {},
        streakDays: 3,
        lastActiveDate: "2026-10-01",
        points: 120,
        badges: ["مستكشف المعرفة الأول"],
      })
    );
  });

  await page.goto("dashboard/");
  await expect(page.getByText("2 من أصل 23 درساً مكتملة")).toBeVisible();
  await expect(page.getByText("120 نقطة")).toBeVisible();
  await expect(page.locator(`a[href*="/g/${TERM1}/chapters/chapter-2/"]`).first()).toBeVisible();

  const v2 = await page.evaluate(() => JSON.parse(localStorage.getItem("egyptian_curriculum_progress_v2") || "{}"));
  expect(v2.parts[TERM1].completedLessons).toEqual(["lesson-1-1", "lesson-1-2"]);
  expect(v2.global.points).toBe(120);
});
