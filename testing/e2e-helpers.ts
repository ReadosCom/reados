import type { Page, TestInfo } from "@playwright/test";
import { expect } from "@playwright/test";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { getAppOrigin, getAuthenticationOrigin, getTenantOrigin } from "./hosts";

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const otpLockPath = path.join(process.cwd(), "testing/output/.otp-signin-lock");

const sanitizeForCode = (value: string) =>
  value
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, `-`)
    .replaceAll(/^-|-$/g, ``)
    .slice(0, 24);

export const createUniqueMemberSegmentNames = (testInfo: TestInfo) => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 7);
  const base = sanitizeForCode(testInfo.title);
  const token = `${base || `e2e`}-${timestamp}-${random}`;

  return {
    memberCode: `m-${token}`.slice(0, 48),
    memberName: `Member ${token}`,
    segmentLabel: `E2E Segment ${token}`,
    token,
    updatedMemberName: `Updated Member ${token}`,
  };
};

export const signInToDemoTenant = async ({ email, page }: { email?: string; page: Page }) => {
  const userEmail = email ?? `admin@reados.localhost`;
  const tenantOrigin = getTenantOrigin(`demo`);
  await acquireOtpSigninLock();

  try {
    await page.goto(`${getAppOrigin()}/`);
    await page.locator(`a[href="/identify"]`).click();
    await page.locator(`#login-email`).fill(userEmail);
    await page.locator(`form`).first().locator(`button[type="submit"]`).click();
    await page.locator(`a[href*="demo.reados.localhost/authentication?email="]`).click();
    await expect(page).toHaveURL(`${tenantOrigin}/authentication?email=${encodeURIComponent(userEmail)}`);

    await page.locator(`form`).first().locator(`button[type="submit"]`).click();
    await expect(page.getByText(`If this account is eligible, we sent a verification code.`)).toBeVisible();

    const otpCode = await waitForOtpCode({ email: userEmail, page });
    await page.locator(`#authentication-otp-code`).fill(otpCode);
    await page.locator(`form`).nth(1).locator(`button[type="submit"]`).click();
    await expect(page).toHaveURL(`${tenantOrigin}/`);
  } finally {
    await releaseOtpSigninLock();
  }

  return {
    authenticationOrigin: getAuthenticationOrigin(`demo`),
    email: userEmail,
    tenantOrigin,
  };
};

export const waitForOtpCode = async ({ email, page }: { email: string; page: Page }) => {
  const authenticationOrigin = getAuthenticationOrigin(`demo`);
  let otpResponse = await page.request.get(`${authenticationOrigin}/test/otp/latest?email=${encodeURIComponent(email)}`);

  for (let attempt = 0; !otpResponse.ok() && attempt < 20; attempt += 1) {
    await sleep(250);
    otpResponse = await page.request.get(`${authenticationOrigin}/test/otp/latest?email=${encodeURIComponent(email)}`);
  }

  expect(otpResponse.ok()).toBeTruthy();
  const otpJson = (await otpResponse.json()) as {
    data?: { code?: string; found?: boolean };
  };
  expect(otpJson.data?.found).toBe(true);
  expect(otpJson.data?.code).toBeTruthy();

  return otpJson.data?.code as string;
};

export const navigateToAccountingSegmentList = async (page: Page) => {
  await page.goto(`${getTenantOrigin(`demo`)}/erp/accounting/configuration/segment-list`);
  await expect(page.getByRole(`button`, { name: `New Segment` })).toBeVisible();
};

export const navigateToAccountingSegments = async (page: Page) => {
  await page.goto(`${getTenantOrigin(`demo`)}/erp/accounting/configuration/segments`);
  await expect(page.getByRole(`tab`).first()).toBeVisible();
};

const acquireOtpSigninLock = async () => {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    try {
      await mkdir(otpLockPath);
      return;
    } catch {
      await sleep(100);
    }
  }

  throw new Error(`Timed out while waiting for OTP sign-in lock.`);
};

const releaseOtpSigninLock = async () => {
  await rm(otpLockPath, { force: true, recursive: true });
};
