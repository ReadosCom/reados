import { createRootCoreServer } from '@components/rootCore/rootCore.router.ts';

const port = Number(process.env.PORT ?? 3000);
const app = createRootCoreServer();

app.listen(port, () => {
  console.log(`root core server listening on port ${port}`);
});
