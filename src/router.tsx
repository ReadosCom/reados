import { createRootRoute, createRoute, createRouter, lazyRouteComponent, Outlet } from '@tanstack/react-router';

import { Home } from '@components/home/home';

const Identify = lazyRouteComponent(() => import('@components/identify/Identify'), `Identify`);
const Authentication = lazyRouteComponent(() => import('@components/authentication/Authentication'), `Authentication`);

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `/`,
  component: Home,
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
