import { expect, test } from "../../../testing/e2e";
import { createSegmentFromList, deleteSegmentFromList } from "../../../testing/e2e-accounting-helpers";
import { createUniqueMemberSegmentNames, signInToDemoTenant } from "../../../testing/e2e-helpers";

test(`segment list creates and edits a segment`, async ({ page }, testInfo) => {
  await signInToDemoTenant({ page });
  const names = createUniqueMemberSegmentNames(testInfo);
  const originalLabel = names.segmentLabel;
  const updatedLabel = `${names.segmentLabel} Updated`;

  try {
    await createSegmentFromList({ label: originalLabel, page });
    const row = page.getByRole(`row`).filter({ hasText: originalLabel }).first();
    await row.getByRole(`button`, { name: `Edit segment` }).click();
    const editDialog = page.getByRole(`dialog`).filter({ hasText: `Edit segment` });
    await editDialog.getByLabel(`Label`).fill(updatedLabel);
    await editDialog.getByRole(`button`, { name: `Save segment` }).click();
    await expect(page.getByRole(`cell`, { name: updatedLabel })).toBeVisible();
  } finally {
    await deleteSegmentFromList({ label: updatedLabel, page });
    await deleteSegmentFromList({ label: originalLabel, page });
  }
});

test(`segment list reorders segments`, async ({ page }, testInfo) => {
  await signInToDemoTenant({ page });
  const first = createUniqueMemberSegmentNames(testInfo).segmentLabel;
  const second = `${createUniqueMemberSegmentNames(testInfo).segmentLabel}-2`;

  try {
    await createSegmentFromList({ label: first, page });
    await createSegmentFromList({ label: second, page });
    const row = page.getByRole(`row`).filter({ hasText: second }).first();
    await row.getByRole(`button`, { name: `Move segment up` }).click();
  } finally {
    await deleteSegmentFromList({ label: second, page });
    await deleteSegmentFromList({ label: first, page });
  }
});

test(`segment list delete prompt supports cancel and confirm`, async ({ page }, testInfo) => {
  await signInToDemoTenant({ page });
  const label = createUniqueMemberSegmentNames(testInfo).segmentLabel;

  try {
    await createSegmentFromList({ label, page });
    const row = page.getByRole(`row`).filter({ hasText: label }).first();

    await row.getByRole(`button`, { name: `Delete segment` }).click();
    await expect(page.getByRole(`dialog`).getByText(`Are you sure, segment deletion will re-shape whole General Ledger?`)).toBeVisible();
    await page.getByRole(`dialog`).getByRole(`button`, { name: `Cancel` }).click();
    await expect(page.getByRole(`cell`, { name: label })).toBeVisible();

    await row.getByRole(`button`, { name: `Delete segment` }).click();
    await page.getByRole(`dialog`).getByRole(`button`, { name: `Delete` }).click();
    await expect(page.getByRole(`cell`, { name: label })).toHaveCount(0);
  } finally {
    await deleteSegmentFromList({ label, page });
  }
});
