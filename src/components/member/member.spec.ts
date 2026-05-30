import { expect, test } from "../../../testing/e2e";
import { createMember, deleteMember, updateMember } from "./member.spec.helpers";
import { createSegmentFromList, createUniqueMemberSegmentNames, deleteSegmentFromList, openSegmentTab } from "../segment/segment.spec.helpers";
import { signInToDemoTenant } from "../../../testing/e2e-helpers";

test(`member lifecycle in its own segment`, async ({ page }, testInfo) => {
  const names = createUniqueMemberSegmentNames(testInfo);
  const updatedCode = `${names.memberCode}-u`.slice(0, 48);
  await signInToDemoTenant({ page });
  await createSegmentFromList({ label: names.segmentLabel, page });
  await openSegmentTab({ label: names.segmentLabel, page });

  try {
    await createMember({ code: names.memberCode, description: `Created by ${names.token}`, name: names.memberName, page });
    await expect(page.getByRole(`cell`, { name: names.memberCode })).toBeVisible();

    await updateMember({
      code: names.memberCode,
      description: `Updated by ${names.token}`,
      name: names.updatedMemberName,
      nextCode: updatedCode,
      page,
    });
    await expect(page.getByRole(`cell`, { name: updatedCode })).toBeVisible();
    await deleteMember({ code: updatedCode, page });
    await expect(page.getByRole(`cell`, { name: updatedCode })).toHaveCount(0);
  } finally {
    await deleteMember({ code: updatedCode, page });
    await deleteMember({ code: names.memberCode, page });
    await deleteSegmentFromList({ label: names.segmentLabel, page });
  }
});
