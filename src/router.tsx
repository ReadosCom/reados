import { createRootRoute, createRoute, createRouter, lazyRouteComponent, Outlet } from '@tanstack/react-router';

import { RootIndex } from '@components/application/RootIndex.tsx';
import { ApplicationLayout } from '@components/application/ApplicationLayout.tsx';
import { AccountingFallbackRedirect } from '@components/accounting/AccountingFallbackRedirect.tsx';
import { Accounting } from '@components/accounting/Accounting.tsx';
import { AccountingConfiguration } from '@components/accountingConfiguration/AccountingConfiguration.tsx';
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

const applicationLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: `application`,
  component: ApplicationLayout,
});

const profileRoute = createRoute({
  getParentRoute: () => applicationLayoutRoute,
  path: `profile`,
  component: Profile,
});

const accountingRoute = createRoute({
  getParentRoute: () => applicationLayoutRoute,
  path: `erp/accounting`,
  component: Accounting,
});

const accountingConfigurationRoute = createRoute({
  getParentRoute: () => applicationLayoutRoute,
  path: `erp/accounting/configure`,
  component: AccountingConfiguration,
});

const accountingFallbackRoute = createRoute({
  getParentRoute: () => applicationLayoutRoute,
  path: `erp/accounting/$accountingPath`,
  component: AccountingFallbackRedirect,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    indexRoute,
    identifyRoute,
    authenticationRoute,
    applicationLayoutRoute.addChildren([profileRoute, accountingRoute, accountingConfigurationRoute, accountingFallbackRoute]),
  ]),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
