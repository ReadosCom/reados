import { Router } from "express";

import { accountingConfigurationRouter } from "@components/accountingConfiguration/accountingConfiguration.router.ts";

/**
 * ERP configuration route composition.
 */
export const erpConfigurationRouter = Router();

erpConfigurationRouter.use(`/accounting`, accountingConfigurationRouter);
