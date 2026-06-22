import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: ['**/e2e/**/*.spec.ts', '**/smoke/**/*.spec.ts', '**/regression/**/*.spec.ts', '**/acceptance/**/*.spec.ts'],
  fullyParallel: false,
  retries: 1,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: '../test-results/playwright-results.json' }],
    ['html', { outputFolder: '../test-results/playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'https://3000-i753378jthktwfw3nn2q0-fd1d198d.us1.manus.computer',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
