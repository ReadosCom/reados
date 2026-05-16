import type { Router } from "express";
import { defineRoutes } from "@components/express/express.router.ts";

import { getAccountingDashboardSummary } from "./accounting.controller.ts";

type RouteRegistrationOptions = {
  prefix?: string;
};

/**
 * Registers accounting routes on the provided module app.
 */
export const registerAccountingRoutes = (
  app: Router,
  options: RouteRegistrationOptions = {},
) => {
  const prefix = options.prefix ?? ``;
  const route = defineRoutes(app);

  route({
    method: `get`,
    route: `${prefix}/dashboard/summary`,
    handler: async ({ fail, respond }) => {
      try {
        const summary = await getAccountingDashboardSummary();
        respond({
          summary,
        });
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
};
