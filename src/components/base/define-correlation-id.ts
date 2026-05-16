import type { Express } from "express";

import { getCorrelationId } from "@components/express/express.router.ts";

export const defineCorrelationId = (app: Express) => {
  app.use((request, response, next) => {
    const correlationId = getCorrelationId(request, response);

    response.locals.correlationId = correlationId;
    response.setHeader(`x-correlation-id`, correlationId);
    next();
  });
};
