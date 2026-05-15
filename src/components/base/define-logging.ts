import type { Express } from "express";
import pino from "pino";
import pinoHttp from "pino-http";

import { getCorrelationId } from "@components/express/express.server.ts";

const logger = pino({ level: process.env.LOG_LEVEL ?? `info` });

export const defineLogging = (app: Express) => {
  app.use(
    pinoHttp({
      logger,
      customLogLevel: (_request, response, error) => {
        if (error || response.statusCode >= 500) {
          return `error`;
        }

        if (response.statusCode >= 400) {
          return `warn`;
        }

        return `info`;
      },
      genReqId: (request, response) => getCorrelationId(request, response),
      customProps: (request, response) => ({ correlationId: getCorrelationId(request, response) }),
    }),
  );
};
