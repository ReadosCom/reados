import { defineConfig, devices } from "@playwright/test";
import { getAppOrigin } from "./hosts";

export default defineConfig({
  testDir: "../src",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  workers: process.env.PLAYWRIGHT_WORKERS ? Number.parseInt(process.env.PLAYWRIGHT_WORKERS, 10) : process.env.CI ? 3 : 4,
  outputDir: "./output/test-results",
  reporter: [["list"], ["html", { open: "never", outputFolder: "./output/playwright-report" }]],
  use: {
    baseURL: getAppOrigin(),
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
});
