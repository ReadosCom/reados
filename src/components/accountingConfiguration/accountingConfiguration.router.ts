import { Router } from "express";
import { z } from "zod";

import { defineRoutes } from "@components/express/express.router.ts";
import { ensurePool } from "@components/postgres/pool.ts";

import { getAccountingConfiguration } from "./accountingConfiguration.controller.ts";

const pool = ensurePool();

/**
 * Accounting configuration routes.
 */
export const accountingConfigurationRouter = Router();
const route = defineRoutes(accountingConfigurationRouter);

route({
  method: `get`,
  route: `/`,
  handler: async ({ fail, respond }) => {
    try {
      const configuration = await getAccountingConfiguration(pool);
      respond(configuration);
    } catch (error) {
      if (error instanceof z.ZodError) {
        fail({
          cause: error,
          code: `invalid_accounting_configuration`,
          details: z.flattenError(error),
          message: `Invalid accounting configuration.`,
          status: 400,
        });
        return;
      }

      fail({
        cause: error,
        code: `accounting_configuration_fetch_failed`,
        logMessage: `Failed to load accounting configuration.`,
        message: `We could not load accounting configuration right now.`,
        status: 500,
      });
    }
  },
});
