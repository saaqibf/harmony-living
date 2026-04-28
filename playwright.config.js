// @ts-check
const path = require('node:path');
const { defineConfig, devices } = require('@playwright/test');

const repoRoot = path.resolve(__dirname);

module.exports = defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['json', { outputFile: 'e2e-output/results.json' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    video: 'off',
  },
  webServer: {
    command: 'npm run build && PORT=3000 npm run start',
    cwd: repoRoot,
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: { ...process.env, PORT: '3000' },
  },
});
