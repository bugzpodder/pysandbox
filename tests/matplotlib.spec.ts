import { test, expect } from "@playwright/test";

test("main thread success", async ({ page }) => {
  await page.goto("/examples/MainThread/matplotlib.html");
  await expect(page.getByTestId("out").locator("css=img")).toHaveCount(1);
  await expect(page).toHaveScreenshot("matplotlib.png");
});

test("worker success", async ({ page }) => {
  await page.goto("/examples/Worker/matplotlib.html");
  await expect(page.getByTestId("out").locator("css=img")).toHaveCount(1);
  await expect(page).toHaveScreenshot("matplotlib.png");
});

test("restricted matplotlib success", async ({ page }) => {
  await page.goto("/examples/MainThread/matplotlib-restricted.html");
  await expect(page.getByTestId("out").locator("css=img")).toHaveCount(1);
  await expect(page).toHaveScreenshot("matplotlib.png");
});

test("restricted worker success", async ({ page }) => {
  await page.goto("/examples/Worker/matplotlib-restricted.html");
  await expect(page.getByTestId("out").locator("css=img")).toHaveCount(1);
  await expect(page).toHaveScreenshot("matplotlib.png");
});
