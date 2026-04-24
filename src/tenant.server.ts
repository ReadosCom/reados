import { createModuleServer } from './components/express/express.server.ts';

const port = Number(process.env.PORT ?? 3000);
const app = createModuleServer({
  moduleName: `tenant`,
});

app.listen(port, () => {
  console.log(`tenant server listening on port ${port}`);
});
