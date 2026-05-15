import { Temporal } from "@js-temporal/polyfill";

import type { AccountingDashboardSummary } from "./accounting.schema.ts";

/**
 * Returns the accounting dashboard summary for the active tenant.
 */
export const getAccountingDashboardSummary = async (): Promise<AccountingDashboardSummary> => {
  const asOf = Temporal.Now.plainDateISO().toString();

  return {
    asOf,
    currency: `USD`,
    overdueInvoices: 3,
    openInvoices: 14,
    unpaidBalance: 28450.12,
  };
};
