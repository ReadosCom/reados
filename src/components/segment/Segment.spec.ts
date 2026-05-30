import { apiErrorResponseSchema } from "@components/application/api.schema.ts";
import { expect, test } from "../../../testing/e2e";
import { getFrontendConfig } from "../../../testing/hosts";
import { segmentListResponseSchema } from "./segment.schema.ts";

const getErpOrigin = (tenantSlug: string) => {
  return `http://erp.${tenantSlug}.${getFrontendConfig().rootFqdn}`;
};

test(`segment required anchors include customer and supplier and cannot be deleted`, async ({ page }) => {
  const erpOrigin = getErpOrigin(`demo`);
  const segmentResponse = await page.request.get(`${erpOrigin}/accounting/segment`);

  expect(segmentResponse.ok()).toBeTruthy();

  const segmentJson = segmentListResponseSchema.parse(await segmentResponse.json());
  const requiredSegmentsByType = new Map(segmentJson.data.filter((segment) => segment.required).map((segment) => [segment.type, segment]));

  expect(requiredSegmentsByType.get(`entity`)?.label).toBe(`Entity`);
  expect(requiredSegmentsByType.get(`account`)?.label).toBe(`Account`);
  expect(requiredSegmentsByType.get(`customer`)?.label).toBe(`Customer`);
  expect(requiredSegmentsByType.get(`supplier`)?.label).toBe(`Supplier`);

  for (const type of [`customer`, `supplier`] as const) {
    const segment = requiredSegmentsByType.get(type);

    expect(segment).toBeDefined();

    const updateResponse = await page.request.patch(`${erpOrigin}/accounting/segment/${segment?.id ?? ``}`, {
      data: { required: false },
    });

    expect(updateResponse.status()).toBe(400);

    const updateJson = apiErrorResponseSchema.parse(await updateResponse.json());

    expect(updateJson.error.code).toBe(`segment_required_update_forbidden`);
    expect(updateJson.error.message).toBe(`Required accounting segments must remain required.`);

    const deleteResponse = await page.request.delete(`${erpOrigin}/accounting/segment/${segment?.id ?? ``}`);

    expect(deleteResponse.status()).toBe(400);

    const deleteJson = apiErrorResponseSchema.parse(await deleteResponse.json());

    expect(deleteJson.error.code).toBe(`segment_required_delete_forbidden`);
    expect(deleteJson.error.message).toBe(`Required accounting segments cannot be deleted.`);
  }
});
