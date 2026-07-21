import { test, expect } from "@playwright/test";

test("calculates the result colour from foreground, background, and opacity", async ({
  page,
}) => {
  await page.goto("/opacity");

  await expect(page.getByRole("textbox", { name: "Result" })).toHaveValue(
    "#bfd6e6",
  );
});

test("recalculates when the opacity slider changes", async ({ page }) => {
  await page.goto("/opacity");

  await page.getByRole("slider", { name: "Opacity" }).fill("100");

  await expect(page.getByRole("textbox", { name: "Result" })).toHaveValue(
    "#005b99",
  );
});

test("solving for opacity disables the opacity slider", async ({ page }) => {
  await page.goto("/opacity");

  await page.locator('label[for="solve-for-opacity"]').click();

  await expect(page.getByRole("slider", { name: "Opacity" })).toBeDisabled();
});
