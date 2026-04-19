import { createModuleServer } from './components/express/express.server.ts';

const port = Number(process.env.PORT ?? 3000);
const app = createModuleServer({
  moduleName: `core`,
  routePrefix: `/api/core`,
});

app.listen(port, () => {
  console.log(`core server listening on port ${port}`);
});
