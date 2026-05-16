import { Router } from "express";
import { accountingRouter } from "@components/accounting/accounting.router.ts";
import { erpConfigurationRouter } from "@components/erpConfiguration/erpConfiguration.router.ts";

/**
 * ERP route composition.
 */
export const erpRouter = Router();

erpRouter.use(`/accounting`, accountingRouter);
erpRouter.use(`/configuration`, erpConfigurationRouter);
