import { createRoute, type AnyRoute } from '@tanstack/react-router';

import { ApplicationLayout } from '@components/application/ApplicationLayout.tsx';
import { createErpRouteTree } from '@components/erp/erp.route.ts';
import { Profile } from '@components/profile/Profile';

export const createApplicationRouteTree = (rootRoute: AnyRoute) => {
  const applicationLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: `application-layout`,
    component: ApplicationLayout,
  });

  const profileRoute = createRoute({
    getParentRoute: () => applicationLayoutRoute,
    path: `profile`,
    component: Profile,
  });

  return applicationLayoutRoute.addChildren([
    profileRoute,
    createErpRouteTree(applicationLayoutRoute),
  ]);
};
