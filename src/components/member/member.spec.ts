import { expect, test } from "../../../testing/e2e";
import { getFrontendConfig } from "../../../testing/hosts";
import { applyMemberTemplateBodySchema, applyMemberTemplateResponseSchema, listAccountTemplatesResponseSchema, listMembersResponseSchema } from "./member.schema.ts";
import { createMember, deleteMember, updateMember } from "./member.spec.helpers";
import { createSegmentFromList, createUniqueMemberSegmentNames, deleteSegmentFromList, openSegmentTab } from "../segment/segment.spec.helpers";
import { signInToDemoTenant } from "../../../testing/e2e-helpers";

const accountSystemSegmentId = `00000000-0000-7000-8000-000000000002`;
const turkeyTemplateId = `tr-tek-duzen`;
const getErpOrigin = (tenantSlug: string) => `http://erp.${tenantSlug}.${getFrontendConfig().rootFqdn}`;

test(`Turkish Tek Duzen template is listed and applies idempotently`, async ({ page }) => {
  const erpOrigin = getErpOrigin(`demo`);

  const templatesResponse = await page.request.get(`${erpOrigin}/accounting/member/templates`);
  expect(templatesResponse.ok()).toBeTruthy();

  const templatesPayload = listAccountTemplatesResponseSchema.parse(await templatesResponse.json());
  const turkeyTemplate = templatesPayload.data.find((template) => template.id === turkeyTemplateId);

  expect(turkeyTemplate?.label).toBe(`Turkey Tek Düzen Hesap Planı`);

  const applyBody = applyMemberTemplateBodySchema.parse({ segmentId: accountSystemSegmentId, templateId: turkeyTemplateId });

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const applyResponse = await page.request.post(`${erpOrigin}/accounting/member/templates/apply`, { data: applyBody });
    expect(applyResponse.ok()).toBeTruthy();
    expect(applyMemberTemplateResponseSchema.parse(await applyResponse.json()).data.applied).toBe(true);
  }

  const membersResponse = await page.request.get(`${erpOrigin}/accounting/member?segmentId=${encodeURIComponent(accountSystemSegmentId)}`);
  expect(membersResponse.ok()).toBeTruthy();

  const membersPayload = listMembersResponseSchema.parse(await membersResponse.json());
  const membersByCode = new Map(membersPayload.data.map((member) => [member.code, member]));

  expect(membersPayload.data).toHaveLength(344);
  expect(new Set(membersPayload.data.map((member) => member.code)).size).toBe(344);
  expect(membersByCode.get(`1`)?.name).toBe(`Dönen Varlıklar`);
  expect(membersByCode.get(`100`)?.parent).toBe(membersByCode.get(`10`)?.id);
  expect(membersByCode.get(`120`)?.name).toBe(`Alıcılar`);
  expect(membersByCode.get(`320`)?.name).toBe(`Satıcılar`);
  expect(membersByCode.get(`8`)?.type).toBe(`management`);
  expect(membersByCode.get(`9`)?.type).toBe(`memo`);
  expect(membersByCode.get(`170`)?.parent).toBe(membersByCode.get(`17`)?.id);
  expect(membersByCode.get(`178`)?.name).toBe(`Yıllara Yaygın İnşaat Enflasyon Düzeltme`);
  expect(membersByCode.get(`790`)?.parent).toBe(membersByCode.get(`7`)?.id);
});

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
