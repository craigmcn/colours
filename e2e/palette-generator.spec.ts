import { test, expect } from "@playwright/test";

test("generates named CSS custom properties from the base colour", async ({
  page,
}) => {
  await page.goto("/palette");

  await page.getByLabel("Name").fill("sunset");
  await page.getByLabel("Base").fill("#ff6600");

  await expect(page.getByText(/--sunset-0:/)).toBeVisible();
  await expect(page.getByText(/--sunset-500:/)).toBeVisible();
});

test("shows 12 palette swatches by default", async ({ page }) => {
  await page.goto("/palette");

  await expect(page.getByRole("group")).toHaveCount(12);
});
