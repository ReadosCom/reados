import type { Express } from "express";

import { defineCorrelationId } from "./define-correlation-id.ts";
import { defineCors } from "./define-cors.ts";
import { defineExtensions } from "./define-extensions.ts";
import { defineLogging } from "./define-logging.ts";

export const defineMiddlewares = (app: Express) => {
  defineCors(app);
  defineExtensions(app);
  defineCorrelationId(app);
  defineLogging(app);
};
