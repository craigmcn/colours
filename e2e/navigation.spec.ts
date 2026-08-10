import { test, expect } from "@playwright/test";

test("navigates between all four tools via the nav bar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Links" })).toBeVisible();

  await page.getByRole("link", { name: "Opacity" }).click();
  await expect(
    page.getByRole("heading", { name: "Calculate opacity" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Palette" }).click();
  await expect(
    page.getByRole("heading", { name: "Palette generator" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Blender" }).click();
  await expect(
    page.getByRole("heading", { name: "Colour blender" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Theme" }).click();
  await expect(
    page.getByRole("heading", { name: "Theme colours" }),
  ).toBeVisible();

  await page.getByRole("link", { name: "Contrast" }).click();
  await expect(page.getByRole("heading", { name: "Links" })).toBeVisible();
});

test("renders each tool directly by URL", async ({ page }) => {
  await page.goto("/opacity");
  await expect(
    page.getByRole("heading", { name: "Calculate opacity" }),
  ).toBeVisible();

  await page.goto("/palette");
  await expect(
    page.getByRole("heading", { name: "Palette generator" }),
  ).toBeVisible();

  await page.goto("/blender");
  await expect(
    page.getByRole("heading", { name: "Colour blender" }),
  ).toBeVisible();

  await page.goto("/theme");
  await expect(
    page.getByRole("heading", { name: "Theme colours" }),
  ).toBeVisible();
});
