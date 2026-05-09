import { expect, test } from '../../../testing/e2e';
import { getAppOrigin, getTenantOrigin } from '../../../testing/hosts';

test('identify accepts an email address', async ({ page }) => {
  await page.goto(`${getAppOrigin()}/`);

  await expect(page.getByRole('heading', { name: 'Welcome to Reados' })).toBeVisible();
  await page.getByRole('link', { name: 'Start here' }).click();
  await expect(page.getByRole('heading', { name: 'Sign in to Reados' })).toBeVisible();

  await page.getByLabel('Email address').fill('admin@reados.localhost');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('Choose a tenant for admin@reados.localhost.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Continue to Demo Tenant' })).toHaveAttribute('href', `${getTenantOrigin(`demo`)}/authentication?email=admin%40reados.localhost`);
});
