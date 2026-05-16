import { coreRouter } from "@components/core/core.router.ts";
import { createServer } from "@components/express/express.server.ts";

const port = Number(process.env.PORT ?? 3000);
createServer({
  module: `core`,
  port,
  routers: [coreRouter],
});
