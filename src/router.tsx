import { createRootRoute, createRoute, createRouter, lazyRouteComponent, Outlet } from '@tanstack/react-router';

import { RootIndex } from '@components/application/RootIndex.tsx';
import { AccountingFallbackRedirect } from '@components/accounting/AccountingFallbackRedirect.tsx';
import { Accounting } from '@components/accounting/Accounting.tsx';
import { AccountingConfigurationPage } from '@components/accountingConfiguration/AccountingConfigurationPage.tsx';
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

const accountingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `erp/accounting`,
  component: Accounting,
});

const accountingConfigurationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `erp/accounting/configuration`,
  component: AccountingConfigurationPage,
});

const accountingFallbackRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `erp/accounting/$accountingPath`,
  component: AccountingFallbackRedirect,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, identifyRoute, authenticationRoute, profileRoute, accountingRoute, accountingConfigurationRoute, accountingFallbackRoute]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
