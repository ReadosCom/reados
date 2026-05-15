import express from "express";

import { validate } from "../express/express.server.ts";
import { ensurePool } from "@components/postgres/pool.ts";
import { createTenantDiscoveryHandler } from "./tenant.controller.ts";
import { tenantDiscoveryRequestSchema } from "./tenant.schema.ts";

/**
 * Defines tenant discovery routes.
 */
export const tenantRouter = express.Router();
const pool = ensurePool();

tenantRouter.post(`/discovery`, validate({ body: tenantDiscoveryRequestSchema }), createTenantDiscoveryHandler(pool));
