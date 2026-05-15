import type { Router } from "express";
import { getCorrelationId } from "@components/express/express.server.ts";

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

  app.get(`${prefix}/dashboard/summary`, async (request, response) => {
    try {
      const summary = await getAccountingDashboardSummary();
      response.status(200).json({
        data: {
          summary,
        },
        success: true,
      });
    } catch (error) {
      console.error(`Failed to load accounting summary.`, error);
      response.status(500).json({
        error: {
          code: `accounting_summary_failed`,
          correlationId: getCorrelationId(request, response),
          message: `We could not load the accounting summary right now.`,
        },
        success: false,
      });
    }
  });
};
