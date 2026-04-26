import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '../src',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  outputDir: './output/test-results',
  reporter: [['list'], ['html', { open: 'never', outputFolder: './output/playwright-report' }]],
  use: {
    baseURL: 'http://demo.reados.localhost',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
  ],
});
