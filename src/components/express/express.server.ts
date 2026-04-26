import cors from 'cors';
import express from 'express';

type CreateModuleServerOptions = {
  moduleName: string;
};

/**
 * Creates a minimal module server with shared middleware and health endpoints.
 */
export const createModuleServer = ({ moduleName }: CreateModuleServerOptions) => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get(`/health`, (_request, response) => {
    response.json({
      module: moduleName,
      status: `ok`,
    });
  });

  app.get(`/`, (_request, response) => {
    response.json({
      message: `${moduleName} module is running.`,
      module: moduleName,
    });
  });

  if (process.env.COVERAGE === `true`) {
    app.get(`/__coverage__`, (_request, response) => {
      const runtimeCoverage = (globalThis as { __coverage__?: unknown }).__coverage__ ?? {};
      response.json(runtimeCoverage);
    });
  }

  return app;
};
