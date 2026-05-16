import { rootCoreRouter } from "@components/rootCore/rootCore.router.ts";
import { createServer, startModuleServer } from "@components/express/express.server.ts";

const port = Number(process.env.PORT ?? 3000);
const app = createServer({
  module: `root-core`,
  router: rootCoreRouter,
});

startModuleServer({
  app,
  module: `root core`,
  port,
});
