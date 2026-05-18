import { authenticationRouter } from "@components/authentication/authentication.router.ts";
import { createServer } from "@components/express/express.server.ts";

const port = Number(process.env.PORT ?? 3000);
createServer({
  module: `authentication`,
  port,
  routers: [authenticationRouter],
});
