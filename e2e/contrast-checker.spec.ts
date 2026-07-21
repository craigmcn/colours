import { test, expect } from "@playwright/test";

test("updates contrast ratios when a swatch colour changes", async ({
  page,
}) => {
  await page.goto("/");

  const section = page
    .getByText("Link to Body text")
    .locator("xpath=ancestor::section[1]");
  await expect(section.getByText("1.85")).toBeVisible();

  await page.getByLabel("Links").fill("#ffff00");

  await expect(section.getByText("1.85")).not.toBeVisible();
});

test("WCAG AA button sets accessible link and text colours", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("button", { name: "WCAG AA", exact: true }).click();

  const section = page
    .getByText("Body text to Background")
    .locator("xpath=ancestor::section[1]");
  await expect(section.getByText("Pass").first()).toBeVisible();
});
