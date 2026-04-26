import { z } from 'zod';

export const tenantDiscoveryRequestSchema = z.object({
  email: z.string().check(z.trim(), z.email(`Enter a valid email address.`), z.toLowerCase()),
});

export const tenantDiscoveryTenantSchema = z.object({
  loginUrl: z.string().trim().url(),
  name: z.string().trim().min(1),
  slug: z.string().trim().min(1),
});

export const tenantDiscoveryResponseSchema = z.object({
  tenants: z.array(tenantDiscoveryTenantSchema),
});

export type TenantDiscoveryRequest = z.infer<typeof tenantDiscoveryRequestSchema>;
export type TenantDiscoveryResponse = z.infer<typeof tenantDiscoveryResponseSchema>;
export type TenantDiscoveryTenant = z.infer<typeof tenantDiscoveryTenantSchema>;
