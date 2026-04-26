import { expect, test } from '../../../testing/e2e';

test('authentication identifier accepts an email address', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'Logo Reados' })).toBeVisible();

  await page.getByLabel('Email address').fill('ali@example.com');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('Tenant lookup requested for ali@example.com.')).toBeVisible();
});
