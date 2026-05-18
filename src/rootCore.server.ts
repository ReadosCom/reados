import { rootCoreRouter } from "@components/rootCore/rootCore.router.ts";
import { createServer } from "@components/express/express.server.ts";

const port = Number(process.env.PORT ?? 3000);
createServer({
  module: `root-core`,
  port,
  routers: [rootCoreRouter],
});
