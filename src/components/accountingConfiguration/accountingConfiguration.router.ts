import type { Router } from "express";

import { getCorrelationId, validate } from "@components/express/express.server.ts";
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

  app.get(prefix, async (request, response) => {
    try {
      const configuration = await getAccountingConfiguration(pool);
      response.status(200).json({
        data: configuration,
        success: true,
      });
    } catch (error) {
      console.error(`Failed to load accounting configuration.`, error);
      response.status(500).json({
        error: {
          code: `accounting_configuration_fetch_failed`,
          correlationId: getCorrelationId(request, response),
          message: `We could not load accounting configuration right now.`,
        },
        success: false,
      });
    }
  });

  app.patch(prefix, validate({ body: accountingConfigurationUpdateBodySchema }, async (_request, response) => {
    const body = response.locals.body;

    try {
      const configuration = await updateAccountingConfiguration(pool, body);
      response.status(200).json({
        data: configuration,
        success: true,
      });
    } catch (error) {
      console.error(`Failed to update accounting configuration.`, error);
      response.status(500).json({
        error: {
          code: `accounting_configuration_update_failed`,
          correlationId: getCorrelationId(_request, response),
          message: `We could not update accounting configuration right now.`,
        },
        success: false,
      });
    }
  }));
};
