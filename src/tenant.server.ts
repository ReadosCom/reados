import { createTenantServer } from '@components/tenant/tenant.router.ts';

const port = Number(process.env.PORT ?? 3000);
const app = createTenantServer();

app.listen(port, () => {
  console.log(`tenant server listening on port ${port}`);
});
