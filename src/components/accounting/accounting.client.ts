import { accountingDashboardSummaryResponseSchema, type AccountingDashboardSummaryResponseData } from "./accounting.schema.ts";

/**
 * Fetches accounting dashboard summary metrics from the accounting module API.
 */
export const getAccountingDashboardSummary = async (): Promise<AccountingDashboardSummaryResponseData> => {
  const response = await fetch(`/accounting/dashboard/summary`, {
    credentials: `include`,
  });

  if (!response.ok) {
    throw new Error(`Failed to load accounting dashboard summary.`);
  }

  return accountingDashboardSummaryResponseSchema.parse(await response.json()).data;
};
