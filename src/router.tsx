import { Outlet, createRootRoute, createRoute, createRouter, lazyRouteComponent } from '@tanstack/react-router';

import { createApplicationRouteTree } from '@components/application/application.route.ts';
import { RootIndex } from '@components/application/RootIndex.tsx';
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
  routeTree: rootRoute.addChildren([
    indexRoute,
    identifyRoute,
    authenticationRoute,
    createApplicationRouteTree(rootRoute),
  ]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
