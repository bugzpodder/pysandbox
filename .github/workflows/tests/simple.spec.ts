import { test, expect } from "@playwright/test";

test("main thread success", async ({ page }) => {
  await page.goto("/examples/MainThread/simple.html");
  await expect(page.getByTestId("out")).toHaveText(/success/);
});

test("worker success", async ({ page }) => {
  await page.goto("/examples/Worker/simple.html");
  await expect(page.getByTestId("out")).toHaveText(/success/);
});
