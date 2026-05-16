import { tenantRouter } from "@components/tenant/tenant.router.ts";
import { createServer, startModuleServer } from "@components/express/express.server.ts";

const port = Number(process.env.PORT ?? 3000);
const app = createServer({
  module: `tenant`,
  router: tenantRouter,
});

startModuleServer({
  app,
  module: `tenant`,
  port,
});
