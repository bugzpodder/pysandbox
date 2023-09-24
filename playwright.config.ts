import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 30 * 1000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  use: {
    baseURL: "http://localhost:8000/",
  },
  webServer: {
    command: "yarn serve",
    reuseExistingServer: true,
    url: "http://localhost:8000/",
  },
  workers: process.env.CI ? 1 : undefined,
});
