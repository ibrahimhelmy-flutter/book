import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests run against the static export in `out/`, served under the same
 * base path GitHub Pages uses. Build first: `npm run build`, then `npm run e2e`.
 * Single worker: the repo lives in OneDrive and parallel browsers add little here.
 */
const PORT = Number(process.env.E2E_PORT || 3101);
const BASE_PATH = process.env.E2E_BASE_PATH ?? "/book";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  timeout: 30_000,
  use: {
    baseURL: `http://127.0.0.1:${PORT}${BASE_PATH}/`,
    locale: "ar-EG",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: "node scripts/test-static-server.mjs",
    env: { PORT: String(PORT), BASE_PATH },
    url: `http://127.0.0.1:${PORT}${BASE_PATH}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 20_000,
  },
});
