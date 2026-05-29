import { Outlet, createRoute, redirect, type AnyRoute } from "@tanstack/react-router";

import { Accounting } from "@components/accounting/Accounting.tsx";
import { AccountingFallbackRedirect } from "@components/accounting/AccountingFallbackRedirect.tsx";
import { createAccountingConfigurationRouteTree } from "@components/accountingConfiguration/accountingConfiguration.route.ts";

const accountingConfigurationSegmentsPath = `/erp/accounting/configuration/segments` as never;

const redirectToSegments = () => {
  throw redirect({ to: accountingConfigurationSegmentsPath });
};

export const createAccountingRouteTree = (erpRoute: AnyRoute) => {
  const accountingRoute = createRoute({
    getParentRoute: () => erpRoute,
    path: `accounting`,
    component: Outlet,
  });
  const getParentAccountingRoute = () => accountingRoute;

  const accountingIndexRoute = createRoute({
    getParentRoute: getParentAccountingRoute,
    path: `/`,
    component: Accounting,
  });

  const configureLegacyRoute = createRoute({
    getParentRoute: getParentAccountingRoute,
    path: `configure`,
    beforeLoad: redirectToSegments,
  });

  const configurationTypoLegacyRoute = createRoute({
    getParentRoute: getParentAccountingRoute,
    path: `coniguration/segments`,
    beforeLoad: redirectToSegments,
  });

  const accountingFallbackRoute = createRoute({
    getParentRoute: getParentAccountingRoute,
    path: `$`,
    component: AccountingFallbackRedirect,
  });

  return accountingRoute.addChildren([accountingIndexRoute, createAccountingConfigurationRouteTree(accountingRoute), configureLegacyRoute, configurationTypoLegacyRoute, accountingFallbackRoute]);
};
