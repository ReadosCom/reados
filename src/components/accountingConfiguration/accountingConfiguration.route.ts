import { createRoute, redirect, type AnyRoute } from '@tanstack/react-router';

import { AccountingConfiguration } from '@components/accountingConfiguration/AccountingConfiguration.tsx';
import { AccountingSegmentList } from '@components/accountingSegmentList/AccountingSegmentList.tsx';
import { AccountingSegments } from '@components/accountingSegment/AccountingSegments.tsx';

const accountingConfigurationSegmentListPath = `/erp/accounting/configuration/segment-list` as never;

const redirectToSegmentList = () => {
  throw redirect({ to: accountingConfigurationSegmentListPath });
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
    beforeLoad: redirectToSegmentList,
  });

  const accountingConfigurationSegmentListRoute = createRoute({
    getParentRoute: () => accountingConfigurationRoute,
    path: `segment-list`,
    component: AccountingSegmentList,
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
    accountingConfigurationSegmentListRoute,
    accountingConfigurationSegmentsRoute,
    accountingConfigurationSegmentRoute,
  ]);
};
