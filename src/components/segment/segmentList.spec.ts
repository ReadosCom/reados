import { expect, test } from "../../../testing/e2e";
import { createSegmentFromList, createUniqueMemberSegmentNames, deleteSegmentFromList } from "./segment.spec.helpers";
import { signInToDemoTenant } from "../../../testing/e2e-helpers";

const editSegmentButtonName = /edit segment|kırılımı düzenle/i;
const saveSegmentButtonName = /save segment|saving|kırılımı kaydet|kaydediliyor/i;
const moveSegmentUpButtonName = /move segment up|kırılımı yukarı taşı/i;
const deleteSegmentButtonName = /delete segment|kırılımı sil/i;
const cancelButtonName = /cancel|iptal/i;
const deleteConfirmButtonName = /delete|sil/i;
const deletePromptMessage = /are you sure, segment deletion will re-shape whole general ledger\?|emin misiniz, kırılım silme işlemi tüm genel muhasebe defteri yapısını yeniden şekillendirecek\?/i;

test(`segment list creates and edits a segment`, async ({ page }, testInfo) => {
  await signInToDemoTenant({ page });
  const names = createUniqueMemberSegmentNames(testInfo);
  const originalLabel = names.segmentLabel;
  const updatedLabel = `${names.segmentLabel} Updated`;

  try {
    await createSegmentFromList({ label: originalLabel, page });
    const row = page.getByRole(`row`).filter({ hasText: originalLabel }).first();
    await row.getByRole(`button`, { name: editSegmentButtonName }).click();
    const editDialog = page.getByRole(`dialog`).filter({ hasText: `Edit segment` });
    await editDialog.getByLabel(`Label`).fill(updatedLabel);
    await editDialog.getByRole(`button`, { name: saveSegmentButtonName }).click();
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
    await row.getByRole(`button`, { name: moveSegmentUpButtonName }).click();
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

    await row.getByRole(`button`, { name: deleteSegmentButtonName }).click();
    await expect(page.getByRole(`dialog`).getByText(deletePromptMessage)).toBeVisible();
    await page.getByRole(`dialog`).getByRole(`button`, { name: cancelButtonName }).click();
    await expect(page.getByRole(`cell`, { name: label })).toBeVisible();

    await row.getByRole(`button`, { name: deleteSegmentButtonName }).click();
    await page.getByRole(`dialog`).getByRole(`button`, { name: deleteConfirmButtonName }).click();
    await expect(page.getByRole(`cell`, { name: label })).toHaveCount(0);
  } finally {
    await deleteSegmentFromList({ label, page });
  }
});
