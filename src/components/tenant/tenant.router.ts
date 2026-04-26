import { createModuleServer, validateRequestBody } from '../express/express.server.ts';
import { ensurePool } from '@components/postgres/pool.ts';
import { createTenantDiscoveryHandler } from './tenant.controller.ts';
import { tenantDiscoveryRequestSchema } from './tenant.schema.ts';

/**
 * Creates the tenant server with identifier-first discovery routes.
 */
export const createTenantServer = () => {
  const app = createModuleServer({
    moduleName: `tenant`,
  });
  const pool = ensurePool();

  app.post(`/discovery`, validateRequestBody(tenantDiscoveryRequestSchema), createTenantDiscoveryHandler(pool));

  return app;
};
