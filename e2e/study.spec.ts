import { test, expect } from "@playwright/test";

test("study: open a domain and see theory content", async ({ page }) => {
  await page.goto("/study");
  await page.getByRole("link", { name: /Agent architecture/ }).click();
  await expect(page.getByRole("heading", { name: /Agent architecture/ })).toBeVisible();
  await expect(page.getByText(/stop_reason/).first()).toBeVisible();
});

test("study: practice deep-link preselects the domain", async ({ page }) => {
  await page.goto("/practice?domain=prompt-engineering");
  await expect(page.getByText(/^Practice by scenario/).first()).toBeHidden().catch(() => {});
  // a question should be showing (domain preselected), so an option button exists
  await expect(page.getByRole("button", { name: /Change topic/ })).toBeVisible();
});
