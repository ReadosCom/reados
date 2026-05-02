import { createAuthenticationServer } from '@components/authentication/authentication.router.ts';

const port = Number(process.env.PORT ?? 3000);
const app = createAuthenticationServer();

app.listen(port, () => {
  console.log(`authentication server listening on port ${port}`);
});
