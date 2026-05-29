import { z } from "zod";
import { apiSuccessSchema } from "@components/application/api.schema.ts";

export const tenantSchema = z.object({
  id: z.uuid({ version: `v7` }),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});

export const tenantDiscoveryRequestSchema = z.object({
  email: z.string().check(z.trim(), z.email(`Enter a valid email address.`), z.toLowerCase()),
});

export const discoveredTenantSchema = tenantSchema
  .pick({
    name: true,
    slug: true,
  })
  .extend({
    loginUrl: z.url(),
  });

export const tenantDiscoveryResponseDataSchema = z.array(discoveredTenantSchema);
export const tenantDiscoveryResponseSchema = apiSuccessSchema(tenantDiscoveryResponseDataSchema);

export type Tenant = z.infer<typeof tenantSchema>;
export type TenantDiscoveryResponseData = z.infer<typeof tenantDiscoveryResponseDataSchema>;
export type TenantDiscoveryRequest = z.infer<typeof tenantDiscoveryRequestSchema>;
export type TenantDiscoveryResponse = z.infer<typeof tenantDiscoveryResponseSchema>;
export type DiscoveredTenant = z.infer<typeof discoveredTenantSchema>;
