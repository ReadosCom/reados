import { expect, type Page, type TestInfo } from "@playwright/test";
import { getTenantOrigin } from "../../../testing/hosts";

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

export const navigateToAccountingSegmentList = async (page: Page) => {
  await page.goto(`${getTenantOrigin(`demo`)}/erp/accounting/configuration/segment-list`);
  await expect(page.getByRole(`button`, { name: `New Segment` })).toBeVisible();
};

export const navigateToAccountingSegments = async (page: Page) => {
  await page.goto(`${getTenantOrigin(`demo`)}/erp/accounting/configuration/segments`);
  await expect(page.getByRole(`tab`).first()).toBeVisible();
};

export const createSegmentFromList = async ({ label, page }: { label: string; page: Page }) => {
  await navigateToAccountingSegmentList(page);
  await page.getByRole(`button`, { name: `New Segment` }).click();
  await page.getByRole(`dialog`).getByLabel(`Label`).fill(label);
  await page.getByRole(`dialog`).getByRole(`button`, { name: `Save segment` }).click();
  await expect(page.getByRole(`cell`, { name: label })).toBeVisible();
};

export const openSegmentTab = async ({ label, page }: { label: string; page: Page }) => {
  await navigateToAccountingSegments(page);
  await page.getByRole(`tab`, { name: label }).click();
};

export const deleteSegmentFromList = async ({ label, page }: { label: string; page: Page }) => {
  await navigateToAccountingSegmentList(page);
  const row = page.getByRole(`row`).filter({ hasText: label }).first();
  if ((await row.count()) === 0) {
    return;
  }

  await row.getByRole(`button`, { name: `Delete segment` }).click();
  await page.getByRole(`dialog`).getByRole(`button`, { name: `Delete` }).click();
  await expect(page.getByRole(`cell`, { name: label })).toHaveCount(0);
};
