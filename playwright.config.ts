import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    screenshot: 'only-on-failure',
    //timeout: 60000, // Set global timeout for all tests
  },
  fullyParallel: true,
  workers: 2, // Number of parallel workers (adjust based on your environment)
  retries: 2, // Retry failed tests up to 2 times
  timeout: 60000, // Ensure global timeout is applied here as well for the entire suite
});
