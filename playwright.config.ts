import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  expect: {
    timeout: 30 * 1000,
  },
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
