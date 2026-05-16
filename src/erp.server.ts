import { erpRouter } from "@components/erp/erp.router.ts";
import { createServer, startModuleServer } from "@components/express/express.server.ts";

const port = Number(process.env.PORT ?? 3000);
const app = createServer({
  module: `erp`,
  router: erpRouter,
});

startModuleServer({
  app,
  module: `erp`,
  port,
});
