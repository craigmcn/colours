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

test("shows 12 theme swatches by default", async ({ page }) => {
  await page.goto("/theme");

  await expect(page.getByRole("group")).toHaveCount(12);
});

test("includes off-white/off-black a11y neutrals, not pure #fff/#000", async ({
  page,
}) => {
  await page.goto("/theme");

  await expect(page.getByText(/--theme-white: #(?!ffffff)/)).toBeVisible();
  await expect(page.getByText(/--theme-black: #(?!000000)/)).toBeVisible();
  await expect(page.getByText(/--theme-gray-light:/)).toBeVisible();
  await expect(page.getByText(/--theme-gray-dark:/)).toBeVisible();
});
