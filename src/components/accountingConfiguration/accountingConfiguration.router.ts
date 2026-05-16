import type { Request, Response, Router } from "express";
import { z } from "zod";

import { getCorrelationId, validate } from "@components/express/express.server.ts";
import { ensurePool } from "@components/postgres/pool.ts";

import { getAccountingConfiguration, updateAccountingConfiguration } from "./accountingConfiguration.controller.ts";
import { accountingConfigurationUpdateBodySchema } from "./accountingConfiguration.schema.ts";

type RouteRegistrationOptions = {
  prefix?: string;
};

const pool = ensurePool();

const respondValidationError = (request: Request, response: Response, error: z.ZodError) => {
  response.status(400).json({
    error: {
      code: `invalid_accounting_configuration`,
      correlationId: getCorrelationId(request, response),
      details: z.flattenError(error),
      message: `Invalid accounting configuration.`,
    },
    success: false,
  });
};

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
      if (error instanceof z.ZodError) {
        respondValidationError(request, response, error);
        return;
      }

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
      if (error instanceof z.ZodError) {
        respondValidationError(_request, response, error);
        return;
      }

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
