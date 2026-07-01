import { test, expect } from "@playwright/test";
test("practice reveals an explanation", async ({ page }) => {
  await page.goto("/practice");
  await page.getByRole("button", { name: /Customer Support Agent/ }).click();
  await page.getByRole("button", { name: /^A/ }).first().click();
  await expect(page.getByText(/^Why [A-D]:/)).toBeVisible();
});
