import { expect, test } from "../../../testing/e2e";
import { signInToDemoTenant } from "../../../testing/e2e-helpers";
import { getTenantOrigin } from "../../../testing/hosts";
import { sessionMeResponseSchema } from "./authentication.schema.ts";

const accountingHeadingPattern = /^(Accounting|Muhasebe)$/u;

test(`authentication OTP flow signs in and creates a session`, async ({ page }) => {
  const { authenticationOrigin, tenantOrigin } = await signInToDemoTenant({ page });

  await expect(page).toHaveURL(`${tenantOrigin}/`);
  await expect(page.getByRole(`heading`, { name: accountingHeadingPattern })).toBeVisible();

  const sessionResponse = await page.request.get(`${authenticationOrigin}/session/me`);
  expect(sessionResponse.ok()).toBeTruthy();

  const sessionJson = sessionMeResponseSchema.parse(await sessionResponse.json());
  expect(sessionJson.data.authenticated).toBe(true);
  expect(sessionJson.data.session).not.toBeNull();
  expect(sessionJson.data.session?.email).toBe(`admin@reados.localhost`);

  const logoutResponse = await page.request.post(`${authenticationOrigin}/session/logout`);
  expect(logoutResponse.ok()).toBeTruthy();

  const loggedOutSessionResponse = await page.request.get(`${authenticationOrigin}/session/me`);
  expect(loggedOutSessionResponse.ok()).toBeFalsy();
});

test(`authentication rejects invalid OTP codes`, async ({ page }) => {
  const tenantOrigin = getTenantOrigin(`demo`);
  await page.goto(`${tenantOrigin}/authentication?email=admin%40reados.localhost`);

  await page.locator(`form`).first().locator(`button[type="submit"]`).click();
  await page.locator(`#authentication-otp-code`).fill(`000000`);
  await page.locator(`form`).nth(1).locator(`button[type="submit"]`).click();

  await expect(page).toHaveURL(`${tenantOrigin}/authentication?email=admin%40reados.localhost`);
});

test(`authentication profile language preference is applied in tenant app`, async ({ page }) => {
  const { authenticationOrigin, tenantOrigin } = await signInToDemoTenant({ page });
  await expect(page).toHaveURL(`${tenantOrigin}/`);
  await expect(page.getByRole(`heading`, { name: accountingHeadingPattern })).toBeVisible();

  try {
    const updatedProfile = sessionMeResponseSchema.parse(
      await page.evaluate(async (origin) => {
        const response = await fetch(`${origin}/profile/me`, {
          body: JSON.stringify({
            language: `tr`,
          }),
          credentials: `include`,
          headers: {
            "Content-Type": `application/json`,
          },
          method: `PATCH`,
        });

        return response.json();
      }, authenticationOrigin),
    );

    expect(updatedProfile.data.authenticated).toBeTruthy();
    expect(updatedProfile.data.session).not.toBeNull();
    expect(updatedProfile.data.session?.language).toBe(`tr`);
    expect(updatedProfile.data.session?.email).toBe(`admin@reados.localhost`);

    await page.reload();
    await expect(page.getByRole(`heading`, { name: `Muhasebe` })).toBeVisible();
  } finally {
    const restoredProfile = sessionMeResponseSchema.parse(
      await page.evaluate(async (origin) => {
        const response = await fetch(`${origin}/profile/me`, {
          body: JSON.stringify({
            language: `en`,
          }),
          credentials: `include`,
          headers: {
            "Content-Type": `application/json`,
          },
          method: `PATCH`,
        });

        return response.json();
      }, authenticationOrigin),
    );

    expect(restoredProfile.data.authenticated).toBeTruthy();
    expect(restoredProfile.data.session).not.toBeNull();
    expect(restoredProfile.data.session?.language).toBe(`en`);
  }
});
