import express from "express";

import { defineRoutes } from "../express/express.router.ts";
import { ensurePool } from "@components/postgres/pool.ts";
import { discoverTenantsByEmail } from "./tenant.controller.ts";
import { tenantDiscoveryRequestSchema } from "./tenant.schema.ts";

/**
 * Defines tenant discovery routes.
 */
export const tenantRouter = express.Router();
const pool = ensurePool();
const route = defineRoutes(tenantRouter);

route({
  method: `post`,
  route: `/discovery`,
  validators: {
    body: tenantDiscoveryRequestSchema,
  },
  handler: async ({ body, fail, respond }) => {
    try {
      const result = await discoverTenantsByEmail(pool, body);
      respond(result);
    } catch (error) {
      fail({
        cause: error,
        code: `tenant_discovery_failed`,
        logMessage: `Failed to discover tenants for ${body.email}.`,
        message: `We could not look up your tenants right now.`,
        status: 500,
      });
    }
  },
});
