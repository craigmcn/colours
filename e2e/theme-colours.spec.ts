import { test, expect } from "@playwright/test";

test("generates a Bootstrap-style theme palette from a brand colour", async ({
  page,
}) => {
  await page.goto("/theme");

  await page.getByLabel("Prefix").fill("brand");
  await page.getByLabel("Brand colour").fill("#ff6600");

  await expect(page.getByText(/--brand-primary: #ff6600/)).toBeVisible();
  await expect(page.getByText(/--brand-accent:/)).toBeVisible();
  await expect(page.getByText(/--brand-success:/)).toBeVisible();
  await expect(page.getByText(/--brand-danger:/)).toBeVisible();
  await expect(page.getByText(/--brand-warning:/)).toBeVisible();
  await expect(page.getByText(/--brand-info:/)).toBeVisible();
});

test("shows 13 theme swatches by default", async ({ page }) => {
  await page.goto("/theme");

  // Scoped to the swatches card — the Mode fieldset is also an implicit
  // ARIA group, so an unscoped getByRole("group") would over-count by one.
  await expect(page.locator(".card").first().getByRole("group")).toHaveCount(
    13,
  );
});

test("accent sits opposite primary on the colour wheel, and secondary is clearly distinct from primary", async ({
  page,
}) => {
  await page.goto("/theme");

  // #677fa3 — the reported regression case: naive clamping left secondary
  // (#7d838c) only ~1.07:1 against primary, far too close.
  await page.getByLabel("Brand colour").fill("#677fa3");

  await expect(page.getByText("--theme-primary: #677fa3;")).toBeVisible();
  await expect(page.getByText("--theme-secondary: #7d838c;")).not.toBeVisible();
  await expect(page.getByText(/--theme-accent: #[0-9a-f]{6};/)).toBeVisible();
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

test("switching to Dark mode re-derives the palette and swaps light/dark surfaces", async ({
  page,
}) => {
  await page.goto("/theme");

  const lightSection = page.locator("pre");
  const lightSurface = (await lightSection
    .locator("text=/--theme-light: #[0-9a-f]{6}/")
    .textContent())!.match(/#[0-9a-f]{6}/)![0];
  const darkSurface = (await lightSection
    .locator("text=/--theme-dark: #[0-9a-f]{6}/")
    .textContent())!.match(/#[0-9a-f]{6}/)![0];
  const lightWhite = (await lightSection
    .locator("text=/--theme-white: #[0-9a-f]{6}/")
    .textContent())!.match(/#[0-9a-f]{6}/)![0];
  const lightBlack = (await lightSection
    .locator("text=/--theme-black: #[0-9a-f]{6}/")
    .textContent())!.match(/#[0-9a-f]{6}/)![0];

  await page.locator('label[for="theme-mode-dark"]').click();

  await expect(
    page.getByRole("heading", { name: /custom properties — dark/i }),
  ).toBeVisible();
  await expect(page.getByText(`--theme-light: ${darkSurface}`)).toBeVisible();
  await expect(page.getByText(`--theme-dark: ${lightSurface}`)).toBeVisible();
  await expect(page.getByText(`--theme-white: ${lightBlack}`)).toBeVisible();
  await expect(page.getByText(`--theme-black: ${lightWhite}`)).toBeVisible();
});
