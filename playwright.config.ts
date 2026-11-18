import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3060",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Calls Vite's bin through node rather than `yarn dev`: the nested yarn run
  // inside Playwright's child process sometimes failed with "command not
  // found: vite" locally (#125), and this path needs no bin lookup.
  webServer: {
    command: "node node_modules/vite/bin/vite.js --port 3060 --strictPort",
    url: "http://localhost:3060",
    reuseExistingServer: !process.env.CI,
  },
});
