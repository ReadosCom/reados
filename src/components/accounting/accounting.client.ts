import { erpServiceGet } from "@components/application/application.client.ts";
import { accountingDashboardSummaryResponseSchema, type AccountingDashboardSummaryResponseData } from "./accounting.schema.ts";

/**
 * Fetches accounting dashboard summary metrics from the accounting module API.
 */
export const getAccountingDashboardSummary = async (): Promise<AccountingDashboardSummaryResponseData> => {
  const response = await erpServiceGet({
    path: `/accounting/dashboard/summary`,
  });

  if (!response.ok) {
    throw new Error(`Failed to load accounting dashboard summary.`);
  }

  return accountingDashboardSummaryResponseSchema.parse(await response.json()).data;
};
