import { erpRouter } from "@components/erp/erp.router.ts";
import { createServer } from "@components/express/express.server.ts";

const port = Number(process.env.PORT ?? 3000);
createServer({
  module: `erp`,
  port,
  routers: [erpRouter],
});
