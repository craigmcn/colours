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

test("restores the palette from URL params and keeps the URL in sync", async ({
  page,
}) => {
  await page.goto("/palette?base=ff0000&dark=111111&name=brand");

  await expect(page.getByText("--brand-500: #ff0000;")).toBeVisible();
  await expect(page.getByText("--brand-1000: #111111;")).toBeVisible();

  await page.getByLabel("Base").fill("#3366cc");
  await expect(page).toHaveURL(/[?&]base=3366cc/);

  await page.reload();
  await expect(page.getByText("--brand-500: #3366cc;")).toBeVisible();
});
