import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  webServer: { command: "npx serve out -l 3100", url: "http://localhost:3100", reuseExistingServer: !process.env.CI },
  use: { baseURL: "http://localhost:3100" },
});
