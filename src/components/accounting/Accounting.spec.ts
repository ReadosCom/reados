import { expect, test } from "../../../testing/e2e";
import { getFrontendConfig } from "../../../testing/hosts";
import { apiErrorResponseSchema, apiSuccessSchema } from "@components/application/api.schema.ts";
import { accountingDashboardSummaryResponseSchema } from "./accounting.schema.ts";
import { accountingConfigurationResponseSchema } from "@components/accountingConfiguration/accountingConfiguration.schema.ts";
import { accountTemplateSchema, createMemberResponseSchema, deleteMemberResponseSchema, listMembersResponseSchema, updateMemberResponseSchema } from "@components/member/member.schema.ts";
import { segmentListResponseSchema, segmentResponseSchema } from "@components/segment/segment.schema.ts";
import { z } from "zod";

const erpOrigin = () => `http://erp.demo.${getFrontendConfig().rootFqdn}`;
const missingUuid = `00000000-0000-7000-8000-000000000099`;

test.describe.configure({ mode: `serial` });

test(`accounting module APIs cover success, validation, and domain error paths`, async ({ request }) => {
  const healthResponse = await request.get(`${erpOrigin()}/health`);
  expect(healthResponse.ok()).toBeTruthy();
  expect(apiSuccessSchema(z.object({ module: z.literal(`erp`), status: z.literal(`ok`) })).parse(await healthResponse.json()).data.status).toBe(`ok`);

  const rootResponse = await request.get(`${erpOrigin()}/`);
  expect(rootResponse.ok()).toBeTruthy();
  expect(apiSuccessSchema(z.object({ message: z.string().min(1), module: z.literal(`erp`) })).parse(await rootResponse.json()).data.module).toBe(`erp`);

  const dashboardResponse = await request.get(`${erpOrigin()}/accounting/dashboard/summary`);
  expect(dashboardResponse.ok()).toBeTruthy();
  const dashboard = accountingDashboardSummaryResponseSchema.parse(await dashboardResponse.json()).data;
  expect(dashboard.currency).toBe(`USD`);
  expect(dashboard.openInvoices).toBeGreaterThan(dashboard.overdueInvoices);

  const configurationResponse = await request.get(`${erpOrigin()}/accounting/configuration`);
  expect(configurationResponse.ok()).toBeTruthy();
  expect(accountingConfigurationResponseSchema.parse(await configurationResponse.json()).data.module).toBe(`accounting`);

  const invalidSegmentIdResponse = await request.get(`${erpOrigin()}/accounting/segment/not-a-uuid`);
  expect(invalidSegmentIdResponse.status()).toBe(400);
  expect(apiErrorResponseSchema.parse(await invalidSegmentIdResponse.json()).error.code).toBe(`invalid_request_params`);

  const missingSegmentResponse = await request.get(`${erpOrigin()}/accounting/segment/${missingUuid}`);
  expect(missingSegmentResponse.status()).toBe(404);
  expect(apiErrorResponseSchema.parse(await missingSegmentResponse.json()).error.code).toBe(`segment_not_found`);

  const invalidCreateSegmentResponse = await request.post(`${erpOrigin()}/accounting/segment`, {
    data: { label: ``, order: -1, required: false },
  });
  expect(invalidCreateSegmentResponse.status()).toBe(400);
  expect(apiErrorResponseSchema.parse(await invalidCreateSegmentResponse.json()).error.code).toBe(`invalid_request_body`);

  const segmentListResponse = await request.get(`${erpOrigin()}/accounting/segment`);
  expect(segmentListResponse.ok()).toBeTruthy();
  const segments = segmentListResponseSchema.parse(await segmentListResponse.json()).data;
  const entitySegment = segments.find((segment) => segment.type === `entity`);
  const accountSegment = segments.find((segment) => segment.type === `account`);
  expect(entitySegment).toBeDefined();
  expect(accountSegment).toBeDefined();

  const createSegmentResponse = await request.post(`${erpOrigin()}/accounting/segment`, {
    data: { label: `Coverage Segment`, order: 99, required: false },
  });
  expect(createSegmentResponse.status()).toBe(201);
  const createdSegment = segmentResponseSchema.parse(await createSegmentResponse.json()).data;
  expect(createdSegment.label).toBe(`Coverage Segment`);
  expect(createdSegment.type).toBe(`generic`);

  const invalidUpdateSegmentResponse = await request.patch(`${erpOrigin()}/accounting/segment/${createdSegment.id}`, {
    data: {},
  });
  expect(invalidUpdateSegmentResponse.status()).toBe(400);
  expect(apiErrorResponseSchema.parse(await invalidUpdateSegmentResponse.json()).error.code).toBe(`invalid_request_body`);

  const missingUpdateSegmentResponse = await request.patch(`${erpOrigin()}/accounting/segment/${missingUuid}`, {
    data: { label: `Missing` },
  });
  expect(missingUpdateSegmentResponse.status()).toBe(404);
  expect(apiErrorResponseSchema.parse(await missingUpdateSegmentResponse.json()).error.code).toBe(`segment_not_found`);

  const updateSegmentResponse = await request.patch(`${erpOrigin()}/accounting/segment/${createdSegment.id}`, {
    data: { label: `Coverage Segment Updated`, order: 7, required: false },
  });
  expect(updateSegmentResponse.ok()).toBeTruthy();
  const updatedSegment = segmentResponseSchema.parse(await updateSegmentResponse.json()).data;
  expect(updatedSegment.label).toBe(`Coverage Segment Updated`);
  expect(updatedSegment.order).toBe(7);

  const reorderUpResponse = await request.post(`${erpOrigin()}/accounting/segment/${createdSegment.id}/reorder`, {
    data: { direction: `up` },
  });
  expect(reorderUpResponse.ok()).toBeTruthy();
  expect(segmentResponseSchema.parse(await reorderUpResponse.json()).data.id).toBe(createdSegment.id);

  const reorderDownResponse = await request.post(`${erpOrigin()}/accounting/segment/${createdSegment.id}/reorder`, {
    data: { direction: `down` },
  });
  expect(reorderDownResponse.ok()).toBeTruthy();
  expect(segmentResponseSchema.parse(await reorderDownResponse.json()).data.id).toBe(createdSegment.id);

  const missingReorderResponse = await request.post(`${erpOrigin()}/accounting/segment/${missingUuid}/reorder`, {
    data: { direction: `up` },
  });
  expect(missingReorderResponse.status()).toBe(404);
  expect(apiErrorResponseSchema.parse(await missingReorderResponse.json()).error.code).toBe(`segment_not_found`);

  const missingMemberQueryResponse = await request.get(`${erpOrigin()}/accounting/member`);
  expect(missingMemberQueryResponse.status()).toBe(400);
  expect(apiErrorResponseSchema.parse(await missingMemberQueryResponse.json()).error.code).toBe(`invalid_request_query`);

  const genericMembersResponse = await request.get(`${erpOrigin()}/accounting/member?segmentId=${createdSegment.id}`);
  expect(genericMembersResponse.ok()).toBeTruthy();
  expect(listMembersResponseSchema.parse(await genericMembersResponse.json()).data).toEqual([]);

  const invalidGenericMemberResponse = await request.post(`${erpOrigin()}/accounting/member`, {
    data: {
      code: `GEN-INVALID`,
      description: `Generic members cannot carry account typing.`,
      name: `Invalid Generic Member`,
      parent: null,
      reporting: `debit`,
      segmentId: createdSegment.id,
      type: `asset`,
    },
  });
  expect(invalidGenericMemberResponse.status()).toBe(400);
  expect(apiErrorResponseSchema.parse(await invalidGenericMemberResponse.json()).error.code).toBe(`segment_member_create_failed`);

  const createGenericMemberResponse = await request.post(`${erpOrigin()}/accounting/member`, {
    data: {
      code: `GEN-001`,
      description: `A deterministic generic member for endpoint coverage.`,
      name: `Generic Member`,
      parent: null,
      segmentId: createdSegment.id,
    },
  });
  expect(createGenericMemberResponse.status()).toBe(201);
  const genericMember = createMemberResponseSchema.parse(await createGenericMemberResponse.json()).data;
  expect(genericMember.type ?? null).toBeNull();

  const selfParentResponse = await request.put(`${erpOrigin()}/accounting/member/${genericMember.id}`, {
    data: {
      code: `GEN-001`,
      description: `A deterministic generic member for endpoint coverage.`,
      name: `Generic Member`,
      parent: genericMember.id,
    },
  });
  expect(selfParentResponse.status()).toBe(400);
  expect(apiErrorResponseSchema.parse(await selfParentResponse.json()).error.code).toBe(`segment_member_update_failed`);

  const updateGenericMemberResponse = await request.put(`${erpOrigin()}/accounting/member/${genericMember.id}`, {
    data: {
      code: `GEN-001A`,
      description: `Updated generic member for endpoint coverage.`,
      name: `Generic Member Updated`,
      parent: null,
    },
  });
  expect(updateGenericMemberResponse.ok()).toBeTruthy();
  expect(updateMemberResponseSchema.parse(await updateGenericMemberResponse.json()).data.code).toBe(`GEN-001A`);

  const accountSegmentId = accountSegment?.id;
  if (!accountSegmentId) {
    throw new Error(`Expected seeded account segment to exist.`);
  }

  const invalidAccountMemberResponse = await request.post(`${erpOrigin()}/accounting/member`, {
    data: {
      code: `ACC-INVALID`,
      description: `Account members require type and reporting.`,
      name: `Invalid Account Member`,
      parent: null,
      segmentId: accountSegmentId,
    },
  });
  expect(invalidAccountMemberResponse.status()).toBe(400);
  expect(apiErrorResponseSchema.parse(await invalidAccountMemberResponse.json()).error.code).toBe(`segment_member_create_failed`);

  const createAccountParentResponse = await request.post(`${erpOrigin()}/accounting/member`, {
    data: {
      code: `1000`,
      description: `Cash parent account.`,
      name: `Cash`,
      parent: null,
      reporting: `debit`,
      segmentId: accountSegmentId,
      type: `asset`,
    },
  });
  expect(createAccountParentResponse.status()).toBe(201);
  const accountParent = createMemberResponseSchema.parse(await createAccountParentResponse.json()).data;

  const typeMismatchChildResponse = await request.post(`${erpOrigin()}/accounting/member`, {
    data: {
      code: `4000`,
      description: `Revenue child cannot sit below an asset parent.`,
      name: `Sales Revenue`,
      parent: accountParent.id,
      reporting: `credit`,
      segmentId: accountSegmentId,
      type: `revenue`,
    },
  });
  expect(typeMismatchChildResponse.status()).toBe(400);
  expect(apiErrorResponseSchema.parse(await typeMismatchChildResponse.json()).error.code).toBe(`segment_member_create_failed`);

  const createAccountChildResponse = await request.post(`${erpOrigin()}/accounting/member`, {
    data: {
      code: `1010`,
      description: `Checking account.`,
      name: `Checking`,
      parent: accountParent.id,
      reporting: `debit`,
      segmentId: accountSegmentId,
      type: `asset`,
    },
  });
  expect(createAccountChildResponse.status()).toBe(201);
  const accountChild = createMemberResponseSchema.parse(await createAccountChildResponse.json()).data;
  expect(accountChild.parent).toBe(accountParent.id);

  const descendantParentResponse = await request.put(`${erpOrigin()}/accounting/member/${accountParent.id}`, {
    data: {
      code: `1000`,
      description: `Cash parent account.`,
      name: `Cash`,
      parent: accountChild.id,
      reporting: `debit`,
      type: `asset`,
    },
  });
  expect(descendantParentResponse.status()).toBe(400);
  expect(apiErrorResponseSchema.parse(await descendantParentResponse.json()).error.code).toBe(`segment_member_update_failed`);

  const invalidAccountUpdateResponse = await request.put(`${erpOrigin()}/accounting/member/${accountChild.id}`, {
    data: {
      code: `1010`,
      description: `Checking account.`,
      name: `Checking`,
      parent: accountParent.id,
      type: `asset`,
    },
  });
  expect(invalidAccountUpdateResponse.status()).toBe(400);
  expect(apiErrorResponseSchema.parse(await invalidAccountUpdateResponse.json()).error.code).toBe(`segment_member_update_failed`);

  for (const memberId of [accountChild.id, accountParent.id, genericMember.id]) {
    const deleteMemberResponse = await request.delete(`${erpOrigin()}/accounting/member/${memberId}`);
    expect(deleteMemberResponse.ok()).toBeTruthy();
    expect(deleteMemberResponseSchema.parse(await deleteMemberResponse.json()).data.deleted).toBe(true);
  }

  const missingDeleteMemberResponse = await request.delete(`${erpOrigin()}/accounting/member/${genericMember.id}`);
  expect(missingDeleteMemberResponse.status()).toBe(400);
  expect(apiErrorResponseSchema.parse(await missingDeleteMemberResponse.json()).error.code).toBe(`segment_member_delete_failed`);

  const templateResponse = await request.get(`${erpOrigin()}/accounting/member/templates`);
  expect(templateResponse.ok()).toBeTruthy();
  const templates = apiSuccessSchema(z.array(accountTemplateSchema)).parse(await templateResponse.json()).data;
  expect(templates.map((template) => template.id)).toEqual([`tr-tek-duzen`, `ifrs-global-core`, `ifrs-global-enterprise-extension`, `us-gaap`]);

  const applyTemplateResponse = await request.post(`${erpOrigin()}/accounting/member/templates/apply`, {
    data: { segmentId: accountSegmentId, templateId: templates[0]?.id },
  });
  expect(applyTemplateResponse.ok()).toBeTruthy();
  expect(apiSuccessSchema(z.object({ applied: z.literal(true) })).parse(await applyTemplateResponse.json()).data.applied).toBe(true);

  const requiredSegmentDeleteResponse = await request.delete(`${erpOrigin()}/accounting/segment/${accountSegmentId}`);
  expect(requiredSegmentDeleteResponse.status()).toBe(400);
  expect(apiErrorResponseSchema.parse(await requiredSegmentDeleteResponse.json()).error.code).toBe(`segment_required_delete_forbidden`);

  const deleteSegmentResponse = await request.delete(`${erpOrigin()}/accounting/segment/${createdSegment.id}`);
  expect(deleteSegmentResponse.ok()).toBeTruthy();
  expect(segmentResponseSchema.parse(await deleteSegmentResponse.json()).data.id).toBe(createdSegment.id);

  const missingDeleteSegmentResponse = await request.delete(`${erpOrigin()}/accounting/segment/${createdSegment.id}`);
  expect(missingDeleteSegmentResponse.status()).toBe(404);
  expect(apiErrorResponseSchema.parse(await missingDeleteSegmentResponse.json()).error.code).toBe(`segment_not_found`);
});
