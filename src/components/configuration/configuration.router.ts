import type { Router } from "express";

import { registerAccountingConfigurationRoutes } from "@components/accountingConfiguration/accountingConfiguration.router.ts";

/**
 * Registers ERP configuration routes.
 */
export const registerConfigurationRoutes = (app: Router) => {
  registerAccountingConfigurationRoutes(app, {
    prefix: `/configuration/accounting`,
  });
};
