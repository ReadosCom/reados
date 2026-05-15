import { useQuery } from "@tanstack/react-query";

import { getAccountingDashboardSummary } from "./accounting.client.ts";

/**
 * Returns high-level accounting metrics for the current tenant.
 */
export const useAccountingDashboardSummaryQuery = () => {
  return useQuery({
    queryFn: getAccountingDashboardSummary,
    queryKey: [`accounting`, `dashboard`, `summary`],
  });
};
