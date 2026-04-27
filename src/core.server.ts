import { createCoreServer } from '@components/core/core.router.ts';

const port = Number(process.env.PORT ?? 3000);
const app = createCoreServer();

app.listen(port, () => {
  console.log(`core server listening on port ${port}`);
});
