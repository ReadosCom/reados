import { expect, type Page } from "@playwright/test";

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
