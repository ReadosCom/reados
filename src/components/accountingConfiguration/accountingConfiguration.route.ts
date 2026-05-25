import { createRoute, redirect, type AnyRoute } from '@tanstack/react-router';

import { AccountingConfiguration } from '@components/accountingConfiguration/AccountingConfiguration.tsx';
import { AccountingSegments } from '@components/accountingSegment/AccountingSegments.tsx';

const redirectToSegments = () => {
  throw redirect({ to: "/erp/accounting/configuration/segments" as never });
};

export const createAccountingConfigurationRouteTree = (accountingRoute: AnyRoute) => {
  const accountingConfigurationRoute = createRoute({
    getParentRoute: () => accountingRoute,
    path: `configuration`,
    component: AccountingConfiguration,
  });

  const accountingConfigurationIndexRoute = createRoute({
    getParentRoute: () => accountingConfigurationRoute,
    path: `/`,
    beforeLoad: redirectToSegments,
  });

  const accountingConfigurationSegmentsRoute = createRoute({
    getParentRoute: () => accountingConfigurationRoute,
    path: `segments`,
    component: AccountingSegments,
  });

  const accountingConfigurationSegmentRoute = createRoute({
    getParentRoute: () => accountingConfigurationRoute,
    path: `segments/$segmentId`,
    component: AccountingSegments,
  });

  return accountingConfigurationRoute.addChildren([
    accountingConfigurationIndexRoute,
    accountingConfigurationSegmentsRoute,
    accountingConfigurationSegmentRoute,
  ]);
};
