import { test, expect } from "@playwright/test";

test("main thread success", async ({ page }) => {
  await page.goto("/examples/MainThread/matplotlib.html");
  await expect(page.getByTestId("out")).not.toBeEmpty();
  expect(page).toHaveScreenshot("matplotlib.png");
});

test("worker success", async ({ page }) => {
  await page.goto("/examples/Worker/matplotlib.html");
  await expect(page.getByTestId("out")).not.toBeEmpty();
  expect(page).toHaveScreenshot("matplotlib.png");
});
