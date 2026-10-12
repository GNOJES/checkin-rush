import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: 'tests',
  use: {
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    baseURL: 'http://127.0.0.1:5173',
    viewport: { width: 390, height: 844 },
  },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:5173', reuseExistingServer: true },
  reporter: 'list',
});
