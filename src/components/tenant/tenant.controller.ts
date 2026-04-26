import type { Pool } from 'pg';
import type { Request, Response } from 'express';

import type { TenantDiscoveryRequest, TenantDiscoveryTenant } from './tenant.schema.ts';

/**
 * Builds the tenant-specific login URL for a discovered tenant.
 */
export const getTenantLoginUrl = (tenantSlug: string) => {
  const tunnelFqdn = process.env.CLOUDFLARED_TUNNEL_FQDN?.trim();
  const hostSuffix = tunnelFqdn || `reados.localhost`;
  const protocol = tunnelFqdn ? `https` : `http`;

  return `${protocol}://${tenantSlug}.${hostSuffix}/authentication`;
};

/**
 * Creates a request handler that resolves the tenants associated with an email address.
 */
export const createTenantDiscoveryHandler = (pool: Pool) => {
  return async (_request: Request, response: Response) => {
    const { email } = response.locals.validatedBody as TenantDiscoveryRequest;

    try {
      const discoveryResult = await pool.query<{ name: string; slug: string }>(
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

      const tenants: TenantDiscoveryTenant[] = discoveryResult.rows.map(({ name, slug }) => ({
        loginUrl: getTenantLoginUrl(slug),
        name,
        slug,
      }));

      response.json({
        tenants,
      });
    } catch (error) {
      console.error(`Failed to discover tenants for ${email}.`, error);
      response.status(500).json({
        message: `We could not look up your tenants right now.`,
      });
    }
  };
};
