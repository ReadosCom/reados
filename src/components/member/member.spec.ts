import { expect, test } from "../../../testing/e2e";
import type { Page } from "@playwright/test";
import { createUniqueMemberSegmentNames, signInToDemoTenant } from "../../../testing/e2e-helpers";

const createSegmentFromList = async ({ label, page }: { label: string; page: Page }) => {
  await page.goto(`/erp/accounting/configuration/segment-list`);
  await page.getByRole(`button`, { name: `New Segment` }).click();
  await page.getByRole(`dialog`).getByLabel(`Label`).fill(label);
  await page.getByRole(`dialog`).getByRole(`button`, { name: `Save segment` }).click();
  await expect(page.getByRole(`cell`, { name: label })).toBeVisible();
};

const openSegmentTab = async ({ label, page }: { label: string; page: Page }) => {
  await page.goto(`/erp/accounting/configuration/segments`);
  await page.getByRole(`tab`, { name: label }).click();
};

const createMember = async ({ code, description, name, page }: { code: string; description: string; name: string; page: Page }) => {
  await page.getByRole(`button`, { name: `Create member` }).click();
  const createDialog = page.getByRole(`dialog`).filter({ hasText: `Create member` });
  await createDialog.getByLabel(`Code`).fill(code);
  await createDialog.getByLabel(`Name`).fill(name);
  await createDialog.getByLabel(`Description`).fill(description);
  await createDialog.getByRole(`button`, { name: `Create member` }).click();
  await expect(page.getByRole(`cell`, { name: code })).toBeVisible();
};

const updateMember = async ({ code, description, name, nextCode, page }: { code: string; description: string; name: string; nextCode: string; page: Page }) => {
  const row = page.getByRole(`row`).filter({ hasText: code }).first();
  await row.getByRole(`button`, { name: `Edit member` }).click();
  const editDialog = page.getByRole(`dialog`).filter({ hasText: `Edit member` });
  await editDialog.getByLabel(`Code`).fill(nextCode);
  await editDialog.getByLabel(`Name`).fill(name);
  await editDialog.getByLabel(`Description`).fill(description);
  await editDialog.getByRole(`button`, { name: `Save changes` }).click();
  await expect(page.getByRole(`cell`, { name: nextCode })).toBeVisible();
};

const deleteMember = async ({ code, page }: { code: string; page: Page }) => {
  const row = page.getByRole(`row`).filter({ hasText: code }).first();
  if ((await row.count()) === 0) {
    return;
  }

  await row.getByRole(`button`, { name: `Delete member` }).click();
  const deleteDialog = page.getByRole(`dialog`).filter({ hasText: `Delete member` });
  await deleteDialog.getByRole(`button`, { name: `Delete` }).click();
  await expect(page.getByRole(`cell`, { name: code })).toHaveCount(0);
};

const deleteSegmentFromSegmentsPage = async ({ label, page }: { label: string; page: Page }) => {
  await page.goto(`/erp/accounting/configuration/segments`);
  const tab = page.getByRole(`tab`, { name: label });
  if ((await tab.count()) === 0) {
    return;
  }

  await tab.click();
  await page.getByRole(`button`, { name: `Remove` }).click();
};

test(`member creates in its own segment`, async ({ page }, testInfo) => {
  const names = createUniqueMemberSegmentNames(testInfo);
  await signInToDemoTenant({ page });
  await createSegmentFromList({ label: names.segmentLabel, page });
  await openSegmentTab({ label: names.segmentLabel, page });

  try {
    await createMember({ code: names.memberCode, description: `Created by ${names.token}`, name: names.memberName, page });
    await expect(page.getByRole(`cell`, { name: names.memberCode })).toBeVisible();
  } finally {
    await deleteMember({ code: names.memberCode, page });
    await deleteSegmentFromSegmentsPage({ label: names.segmentLabel, page });
  }
});

test(`member updates in its own segment`, async ({ page }, testInfo) => {
  const names = createUniqueMemberSegmentNames(testInfo);
  const updatedCode = `${names.memberCode}-u`.slice(0, 48);
  await signInToDemoTenant({ page });
  await createSegmentFromList({ label: names.segmentLabel, page });
  await openSegmentTab({ label: names.segmentLabel, page });

  try {
    await createMember({ code: names.memberCode, description: `Created by ${names.token}`, name: names.memberName, page });
    await updateMember({
      code: names.memberCode,
      description: `Updated by ${names.token}`,
      name: names.updatedMemberName,
      nextCode: updatedCode,
      page,
    });
    await expect(page.getByRole(`cell`, { name: updatedCode })).toBeVisible();
  } finally {
    await deleteMember({ code: updatedCode, page });
    await deleteMember({ code: names.memberCode, page });
    await deleteSegmentFromSegmentsPage({ label: names.segmentLabel, page });
  }
});

test(`member deletes in its own segment`, async ({ page }, testInfo) => {
  const names = createUniqueMemberSegmentNames(testInfo);
  await signInToDemoTenant({ page });
  await createSegmentFromList({ label: names.segmentLabel, page });
  await openSegmentTab({ label: names.segmentLabel, page });

  try {
    await createMember({ code: names.memberCode, description: `Created by ${names.token}`, name: names.memberName, page });
    await deleteMember({ code: names.memberCode, page });
    await expect(page.getByRole(`cell`, { name: names.memberCode })).toHaveCount(0);
  } finally {
    await deleteMember({ code: names.memberCode, page });
    await deleteSegmentFromSegmentsPage({ label: names.segmentLabel, page });
  }
});
