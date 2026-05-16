import { getErpServiceOrigin } from "@components/application/application.host.ts";
import { accountingDashboardSummaryResponseSchema, type AccountingDashboardSummaryResponseData } from "./accounting.schema.ts";

const root = getErpServiceOrigin();

/**
 * Fetches accounting dashboard summary metrics from the accounting module API.
 */
export const getAccountingDashboardSummary = async (): Promise<AccountingDashboardSummaryResponseData> => {
  const response = await fetch(`${root}/accounting/dashboard/summary`, {
    credentials: `include`,
  });

  if (!response.ok) {
    throw new Error(`Failed to load accounting dashboard summary.`);
  }

  return accountingDashboardSummaryResponseSchema.parse(await response.json()).data;
};
