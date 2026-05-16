import type { Router } from "express";
import { z } from "zod";

import { defineRoutes } from "@components/express/express.router.ts";
import { ensurePool } from "@components/postgres/pool.ts";

import { getAccountingConfiguration, updateAccountingConfiguration } from "./accountingConfiguration.controller.ts";
import { accountingConfigurationUpdateBodySchema } from "./accountingConfiguration.schema.ts";

type RouteRegistrationOptions = {
  prefix?: string;
};

const pool = ensurePool();

/**
 * Registers accounting configuration routes on the provided app.
 */
export const registerAccountingConfigurationRoutes = (app: Router, options: RouteRegistrationOptions = {}) => {
  const prefix = options.prefix ?? ``;
  const route = defineRoutes(app);

  route({
    method: `get`,
    route: prefix,
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

  route({
    method: `patch`,
    route: prefix,
    validators: {
      body: accountingConfigurationUpdateBodySchema,
    },
    handler: async ({ body, fail, respond }) => {
      try {
        const configuration = await updateAccountingConfiguration(pool, body);
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
          code: `accounting_configuration_update_failed`,
          logMessage: `Failed to update accounting configuration.`,
          message: `We could not update accounting configuration right now.`,
          status: 500,
        });
      }
    },
  });
};
