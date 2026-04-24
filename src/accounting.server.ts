import { createModuleServer } from './components/express/express.server.ts';

const port = Number(process.env.PORT ?? 3000);
const app = createModuleServer({
  moduleName: `accounting`,
});

app.listen(port, () => {
  console.log(`accounting server listening on port ${port}`);
});
