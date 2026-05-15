import { Router } from "express";
import { registerAccountingRoutes } from "@components/accounting/accounting.router.ts";
import { registerConfigurationRoutes } from "@components/configuration/configuration.router.ts";

/**
 * ERP route composition.
 */
export const erpRouter = Router();

registerAccountingRoutes(erpRouter, {
    prefix: `/accounting`,
});
registerConfigurationRoutes(erpRouter);
