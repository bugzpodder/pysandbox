import { test, expect } from "@playwright/test";

test("main thread success", async ({ page }) => {
  await page.goto("/examples/MainThread/restricted.html");
  await expect(page.getByTestId("out")).toHaveText(/success/);
});

test("worker success", async ({ page }) => {
  test.skip(Boolean(process.env.CI));
  await page.goto("/examples/Worker/restricted.html");
  await expect(page.getByTestId("out")).toHaveText(/success/);
});
