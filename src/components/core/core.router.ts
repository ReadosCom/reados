import { createModuleServer } from '@components/express/express.server.ts';

/**
 * Creates the tenant core server with a tenant whoami route.
 */
export const createCoreServer = () => {
  const app = createModuleServer({
    moduleName: `core`,
  });

  app.get(`/whoami`, (_request, response) => {
    response.json({
      whoami: `tenant`,
    });
  });

  return app;
};
