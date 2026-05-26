import { Outlet, createRoute, type AnyRoute } from '@tanstack/react-router';

import { createAccountingRouteTree } from '@components/accounting/accounting.route.ts';

export const createErpRouteTree = (applicationLayoutRoute: AnyRoute) => {
  const erpRoute = createRoute({
    getParentRoute: () => applicationLayoutRoute,
    path: `erp`,
    component: Outlet,
  });

  return erpRoute.addChildren([createAccountingRouteTree(erpRoute)]);
};
