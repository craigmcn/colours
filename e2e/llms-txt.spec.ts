import { test, expect } from "@playwright/test";

const CANONICAL = "https://www.craigmcn.com/colours";

const fetchLlmsTxt = async (
  request: import("@playwright/test").APIRequestContext,
) => {
  const response = await request.get("/llms.txt");
  expect(response.ok()).toBe(true);
  return response.text();
};

test("serves llms.txt as a static file, not the SPA shell", async ({
  request,
}) => {
  const text = await fetchLlmsTxt(request);
  expect(text.startsWith("# colours\n")).toBe(true);
  expect(text).not.toContain("<!doctype html>");
});

test("the theme example URL renders the documented CSS output", async ({
  page,
  request,
}) => {
  const text = await fetchLlmsTxt(request);
  const url = text.match(
    new RegExp(`Example: ${CANONICAL}(/theme\\?\\S+)`),
  )![1];
  const cssLines = text
    .match(/```css\n([\s\S]*?)```/)![1]
    .split("\n")
    .filter((line) => line.startsWith("--"));

  await page.goto(url);
  for (const line of cssLines)
    await expect(page.getByText(line, { exact: true })).toBeVisible();
});

test("the palette example URL renders its base at step 500", async ({
  page,
  request,
}) => {
  const text = await fetchLlmsTxt(request);
  const url = text.match(
    new RegExp(`Example: ${CANONICAL}(/palette\\?\\S+)`),
  )![1];
  const params = new URLSearchParams(url.split("?")[1]);

  await page.goto(url);
  await expect(
    page.getByText(`--${params.get("name")}-500: #${params.get("base")};`, {
      exact: true,
    }),
  ).toBeVisible();
});
