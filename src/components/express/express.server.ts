import express from "express";

import { defineMiddlewares } from "@components/base/define-middlewares.ts";
import type { CreateServerOptions } from "./express.schema.ts";

/**
 * Creates a standardized module Express application with shared middleware, health, root, and coverage routes.
 */
export const createServer = ({ module, port, routers }: CreateServerOptions) => {
  const app = express();

  app.set(`trust proxy`, 1);
  defineMiddlewares(app);
  for (const router of routers) {
    app.use(router);
  }

  app.get(`/health`, (_request, response) => {
    response.status(200).json({
      data: {
        module,
        status: `ok`,
      },
      success: true,
    });
  });

  app.get(`/`, (_request, response) => {
    response.status(200).json({
      data: {
        message: `${module} module is running.`,
        module,
      },
      success: true,
    });
  });

  if (process.env.COVERAGE === `true`) {
    app.get(`/__coverage__`, (_request, response) => {
      const runtimeCoverage = (globalThis as { __coverage__?: unknown }).__coverage__ ?? {};
      response.json(runtimeCoverage);
    });
  }

  app.listen(port, () => {
    console.log(`${module} server listening on port ${port}`);
  });

  return app;
};
