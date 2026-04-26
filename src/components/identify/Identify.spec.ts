import { expect, test } from '../../../testing/e2e';

test('identify accepts an email address', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'One entry point for every tenant workspace.' })).toBeVisible();

  await page.getByRole('link', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: 'Sign in to Reados' })).toBeVisible();

  await page.getByLabel('Email address').fill('admin@reados.localhost');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('Choose a tenant for admin@reados.localhost.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Continue to Demo Tenant' })).toHaveAttribute('href', 'http://demo.reados.localhost/authentication');
});
