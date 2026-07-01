import { test, expect } from "@playwright/test";
test("completes an exam and sees a score", async ({ page }) => {
  await page.goto("/exam");
  for (let i = 0; i < 20; i++) {
    await page.getByRole("button", { name: /^A/ }).first().click();
    const finish = page.getByRole("button", { name: "Finish", exact: true });
    if (await finish.isVisible().catch(() => false)) { await finish.click(); break; }
    await page.getByRole("button", { name: "Next", exact: true }).click();
  }
  await expect(page.getByText(/Score/)).toBeVisible();
});
