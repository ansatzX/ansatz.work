import { defineConfig } from '@playwright/test';
const port = 18081;
export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.js',
  fullyParallel: false, workers: 1, forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, reporter: 'list',
  use: { baseURL: `http://127.0.0.1:${port}` },
  webServer: {
    command: 'npm run build && node app.js',
    env: { HOST: '127.0.0.1', PORT: String(port), TIKZ_STRICT: '1' },
    url: `http://127.0.0.1:${port}`, reuseExistingServer: false, timeout: 120000,
  },
});
