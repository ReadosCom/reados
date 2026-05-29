import { expect, type Page } from "@playwright/test";
import { navigateToAccountingSegmentList, navigateToAccountingSegments } from "./e2e-helpers";

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

export const deleteSegmentFromSegmentsPage = async ({ label, page }: { label: string; page: Page }) => {
  await navigateToAccountingSegments(page);
  const tab = page.getByRole(`tab`, { name: label });
  if ((await tab.count()) === 0) {
    return;
  }

  await tab.click();
  await page.getByRole(`button`, { name: `Remove` }).click();
};

export const createMember = async ({ code, description, name, page }: { code: string; description: string; name: string; page: Page }) => {
  await page.getByRole(`button`, { name: `Create member` }).click();
  const createDialog = page.getByRole(`dialog`).filter({ hasText: `Create member` });
  await createDialog.getByLabel(`Code`).fill(code);
  await createDialog.getByLabel(`Name`).fill(name);
  await createDialog.getByLabel(`Description`).fill(description);
  await createDialog.getByRole(`button`, { name: `Create member` }).click();
  await expect(page.getByRole(`cell`, { name: code })).toBeVisible();
};

export const updateMember = async ({ code, description, name, nextCode, page }: { code: string; description: string; name: string; nextCode: string; page: Page }) => {
  const row = page.getByRole(`row`).filter({ hasText: code }).first();
  await row.getByRole(`button`, { name: `Edit member` }).click();
  const editDialog = page.getByRole(`dialog`).filter({ hasText: `Edit member` });
  await editDialog.getByLabel(`Code`).fill(nextCode);
  await editDialog.getByLabel(`Name`).fill(name);
  await editDialog.getByLabel(`Description`).fill(description);
  await editDialog.getByRole(`button`, { name: `Save changes` }).click();
  await expect(page.getByRole(`cell`, { name: nextCode })).toBeVisible();
};

export const deleteMember = async ({ code, page }: { code: string; page: Page }) => {
  const row = page.getByRole(`row`).filter({ hasText: code }).first();
  if ((await row.count()) === 0) {
    return;
  }

  await row.getByRole(`button`, { name: `Delete member` }).click();
  const deleteDialog = page.getByRole(`dialog`).filter({ hasText: `Delete member` });
  await deleteDialog.getByRole(`button`, { name: `Delete` }).click();
  await expect(page.getByRole(`cell`, { name: code })).toHaveCount(0);
};
