import { test, expect } from "@playwright/test";

test("generates a Bootstrap-style theme palette from a brand colour", async ({
  page,
}) => {
  await page.goto("/theme");

  await page.getByLabel("Prefix").fill("brand");
  await page.getByLabel("Brand colour").fill("#ff6600");

  await expect(page.getByText(/--brand-primary: #ff6600/)).toBeVisible();
  await expect(page.getByText(/--brand-success:/)).toBeVisible();
  await expect(page.getByText(/--brand-danger:/)).toBeVisible();
  await expect(page.getByText(/--brand-warning:/)).toBeVisible();
  await expect(page.getByText(/--brand-info:/)).toBeVisible();
});

test("shows 8 theme swatches by default", async ({ page }) => {
  await page.goto("/theme");

  await expect(page.getByRole("group")).toHaveCount(8);
});
