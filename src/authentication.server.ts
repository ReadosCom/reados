import { authenticationRouter } from "@components/authentication/authentication.router.ts";
import { createServer, startModuleServer } from "@components/express/express.server.ts";

const port = Number(process.env.PORT ?? 3000);
const app = createServer({
  module: `authentication`,
  router: authenticationRouter,
});

startModuleServer({
  app,
  module: `authentication`,
  port,
});
