import { test, expect } from "@playwright/test";

test("shows one swatch per step, plus the endpoints", async ({ page }) => {
  await page.goto("/blender");

  await expect(page.getByRole("group")).toHaveCount(6);

  await page.getByLabel("Steps").fill("2");
  await expect(page.getByRole("group")).toHaveCount(3);
});

test("blending white into a start colour ends at white", async ({ page }) => {
  await page.goto("/blender");

  await page.getByLabel("Start").fill("#ff0000");
  await page.getByLabel("End").fill("#ffffff");

  const swatches = page.getByRole("group");
  await expect(swatches.first()).toHaveAttribute("aria-label", "#ff0000");
  await expect(swatches.last()).toHaveAttribute("aria-label", "#ffffff");
});
