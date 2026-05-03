import { createRootRoute, createRoute, createRouter, lazyRouteComponent, Outlet } from '@tanstack/react-router';

import { RootIndex } from '@components/app/RootIndex';
import { Identify } from '@components/identify/Identify';

const Authentication = lazyRouteComponent(() => import('@components/authentication/Authentication'), `Authentication`);

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/`,
  component: RootIndex,
});

const identifyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `identify`,
  component: Identify,
});

const authenticationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `authentication`,
  component: Authentication,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, identifyRoute, authenticationRoute]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
