import type { Pool } from "pg";
import type { DiscoveredTenant, Tenant, TenantDiscoveryRequest } from "./tenant.schema.ts";

/**
 * Builds the tenant-specific login URL for a discovered tenant.
 */
export const getTenantLoginUrl = (tenantSlug: string) => {
  const rootFqdn = process.env.ROOT_FQDN?.trim() || `reados.localhost`;
  const hostSuffix = rootFqdn;
  const protocol = hostSuffix.endsWith(`.localhost`) ? `http` : `https`;

  return `${protocol}://${tenantSlug}.${hostSuffix}/authentication`;
};

/**
 * Resolves tenants associated with a user email address.
 */
export const discoverTenantsByEmail = async (pool: Pool, request: TenantDiscoveryRequest) => {
  const { email } = request;

  const discoveryResult = await pool.query<Pick<Tenant, `name` | `slug`>>(
    `
      SELECT
        "tenant"."name",
        "tenant"."slug"
      FROM "tenantUser"
      INNER JOIN "tenant"
        ON "tenant"."id" = "tenantUser"."tenant"
      WHERE "tenantUser"."user" = $1
      ORDER BY "tenant"."name", "tenant"."slug";
    `,
    [email],
  );

  const tenants: DiscoveredTenant[] = discoveryResult.rows.map(({ name, slug }) => ({
    loginUrl: getTenantLoginUrl(slug),
    name,
    slug,
  }));

  return tenants;
};
