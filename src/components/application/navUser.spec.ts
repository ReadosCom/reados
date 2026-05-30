import { expect, test } from "../../../testing/e2e";
import { signInToDemoTenant } from "../../../testing/e2e-helpers";

test(`nav user menu opens profile and signs out`, async ({ page }) => {
  await signInToDemoTenant({ page });

  const userMenuButton = page.getByRole(`button`, { name: /admin@reados\.localhost/u });
  await userMenuButton.click();
  await page.getByRole(`menuitem`, { name: `Profile` }).click();
  await expect(page).toHaveURL(/\/profile$/u);
  await expect(page.getByRole(`heading`, { name: `Profile` })).toBeVisible();

  await userMenuButton.click();
  await page.getByRole(`menuitem`, { name: `Sign out` }).click();
  await expect(page).toHaveURL(/\/authentication$/u);
});
