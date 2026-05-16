import { coreRouter } from "@components/core/core.router.ts";
import { createServer, startModuleServer } from "@components/express/express.server.ts";

const port = Number(process.env.PORT ?? 3000);
const app = createServer({
  module: `core`,
  router: coreRouter,
});

startModuleServer({
  app,
  module: `core`,
  port,
});
