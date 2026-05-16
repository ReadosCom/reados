import { Router } from "express";
import { defineRoutes } from "@components/express/express.router.ts";

import { getAccountingDashboardSummary } from "./accountingDashboard.controller.ts";

/**
 * Accounting dashboard routes.
 */
export const accountingDashboardRouter = Router();
const route = defineRoutes(accountingDashboardRouter);

route({
  method: `get`,
  route: `/summary`,
  handler: async ({ fail, respond }) => {
    try {
      const summary = await getAccountingDashboardSummary();
      respond(summary);
    } catch (error) {
      fail({
        cause: error,
        code: `accounting_summary_failed`,
        logMessage: `Failed to load accounting summary.`,
        message: `We could not load the accounting summary right now.`,
        status: 500,
      });
    }
  },
});
