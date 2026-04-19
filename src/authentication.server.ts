import { createModuleServer } from './components/express/express.server.ts';

const port = Number(process.env.PORT ?? 3000);
const app = createModuleServer({
  moduleName: `authentication`,
  routePrefix: `/api/authentication`,
});

app.listen(port, () => {
  console.log(`authentication server listening on port ${port}`);
});
