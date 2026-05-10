import { createRootRoute, createRoute, createRouter, lazyRouteComponent, Outlet } from '@tanstack/react-router';

import { RootIndex } from '@components/application/RootIndex.tsx';
import { Identify } from '@components/identify/Identify';
import { Profile } from '@components/profile/Profile';

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

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `profile`,
  component: Profile,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, identifyRoute, authenticationRoute, profileRoute]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
