import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 30 * 1000,
  },
  use: {
    baseURL: "http://localhost:8000/",
    trace: "on-first-retry",
  },
  webServer: {
    command: "yarn serve",
    reuseExistingServer: !process.env.CI,
    url: "http://localhost:8000/",
  },
  workers: process.env.CI ? 1 : undefined,
});
