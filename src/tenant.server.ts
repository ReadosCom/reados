import { tenantRouter } from "@components/tenant/tenant.router.ts";
import { createServer } from "@components/express/express.server.ts";

const port = Number(process.env.PORT ?? 3000);
createServer({
  module: `tenant`,
  port,
  routers: [tenantRouter],
});
