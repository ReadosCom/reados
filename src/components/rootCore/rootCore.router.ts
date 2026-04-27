import { createModuleServer } from '@components/express/express.server.ts';

/**
 * Creates the root core server with a root whoami route.
 */
export const createRootCoreServer = () => {
  const app = createModuleServer({
    moduleName: `root-core`,
  });

  app.get(`/whoami`, (_request, response) => {
    response.json({
      whoami: `root`,
    });
  });

  return app;
};
