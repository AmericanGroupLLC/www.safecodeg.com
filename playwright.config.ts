import { defineConfig, devices } from '@playwright/test';

// One fixed port per suite, set by package.json's test:* scripts.
//
// Deliberately NOT a unique per-process port. Unique ports let two concurrent
// runs both start — and then `emptyOutDir: true` has them wipe each other's
// build mid-run, turning a clear "port already used" error into a dozen
// mysterious test failures. Measured: two concurrent `test:smoke` runs on
// distinct ports produced 24 failures apiece. Failing fast on the port is the
// honest signal, and the fix is to not run two gates at once (or to clean up
// an orphaned server), not to let them race.
const PORT = Number(process.env.PW_PORT ?? 3100);

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
    baseURL: `http://localhost:${PORT}`,
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
  // Builds the production bundle and serves it with the real Express server
  // (not the Vite dev server) so the suite is self-contained: no network
  // dependency, no manually started process, and no dev-only HMR/overlay
  // noise that would pollute the pageerror/console assertions the specs make.
  // The server binds PORT (default 3000) via server/_core/index.ts.
  webServer: {
    command: 'npm run build && npm run start',
    url: `http://localhost:${PORT}`,
    // Never reuse: each suite owns its own server on its own port. Reuse plus
    // a shared port is what let one suite's teardown kill the server another
    // suite was still driving (ERR_CONNECTION_REFUSED mid-run).
    reuseExistingServer: false,
    timeout: 120_000,
    env: { PORT: String(PORT) },
  },
});
