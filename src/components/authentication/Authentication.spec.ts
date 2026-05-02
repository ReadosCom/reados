import { expect, test } from '../../../testing/e2e';

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

test(`authentication OTP flow signs in and creates a session`, async ({ page }) => {
  await page.goto(`/`);
  await page.getByRole(`link`, { name: `Start here` }).click();
  await page.getByLabel(`Email address`).fill(`admin@reados.localhost`);
  await page.getByRole(`button`, { name: `Sign in` }).click();
  await page.getByRole(`link`, { name: `Continue to Demo Tenant` }).click();

  await expect(page).toHaveURL(`http://demo.reados.localhost/authentication?email=admin%40reados.localhost`);
  await expect(page.getByRole(`heading`, { name: `Sign in with a one-time code` })).toBeVisible();

  await page.getByRole(`button`, { name: `Send verification code` }).click();

  await expect(page.getByText(`If this account is eligible, we sent a verification code.`)).toBeVisible();

  let otpResponse = await page.request.get(`http://authentication.demo.reados.localhost/test/otp/latest?email=admin%40reados.localhost`);

  for (let attempt = 0; !otpResponse.ok() && attempt < 20; attempt += 1) {
    await sleep(250);
    otpResponse = await page.request.get(`http://authentication.demo.reados.localhost/test/otp/latest?email=admin%40reados.localhost`);
  }

  expect(otpResponse.ok()).toBeTruthy();

  const otpJson = (await otpResponse.json()) as {
    code: string;
    found: boolean;
  };

  expect(otpJson.found).toBe(true);

  await page.getByLabel(`Verification code`).fill(otpJson.code);
  await page.getByRole(`button`, { name: `Verify and continue` }).click();

  await expect(page).toHaveURL(`http://demo.reados.localhost/`);

  const sessionResponse = await page.request.get(`http://authentication.demo.reados.localhost/session/me`);

  expect(sessionResponse.ok()).toBeTruthy();

  const sessionJson = (await sessionResponse.json()) as {
    authenticated: boolean;
    session: {
      userEmail: string;
    };
  };

  expect(sessionJson.authenticated).toBe(true);
  expect(sessionJson.session.userEmail).toBe(`admin@reados.localhost`);

  const logoutResponse = await page.request.post(`http://authentication.demo.reados.localhost/session/logout`);

  expect(logoutResponse.ok()).toBeTruthy();

  const loggedOutSessionResponse = await page.request.get(`http://authentication.demo.reados.localhost/session/me`);

  expect(loggedOutSessionResponse.ok()).toBeFalsy();
});

test(`authentication rejects invalid OTP codes`, async ({ page }) => {
  await page.goto(`http://demo.reados.localhost/authentication?email=admin%40reados.localhost`);

  await page.getByRole(`button`, { name: `Send verification code` }).click();

  await expect(page.getByText(`If this account is eligible, we sent a verification code.`)).toBeVisible();

  await page.getByLabel(`Verification code`).fill(`000000`);
  await page.getByRole(`button`, { name: `Verify and continue` }).click();

  await expect(page.getByText(`The verification code is invalid or expired.`)).toBeVisible();
  await expect(page).toHaveURL(`http://demo.reados.localhost/authentication?email=admin%40reados.localhost`);
});
