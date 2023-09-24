import { test, expect } from "@playwright/test";

test("main thread success", async ({ page }) => {
  await page.goto("/examples/MainThread/autoimport.html");
  await expect(page.getByTestId("out").locator("css=img")).toHaveCount(1);
  await expect(page).toHaveScreenshot("seaborn.png");
});

test("worker success", async ({ page }) => {
  await page.goto("/examples/Worker/autoimport.html");
  await expect(page.getByTestId("out").locator("css=img")).toHaveCount(1);
  await expect(page).toHaveScreenshot("seaborn.png");
});
