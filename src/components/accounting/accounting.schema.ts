import { z } from "zod";
import { apiSuccessSchema } from "@components/application/api.schema.ts";

export const accountingDashboardSummarySchema = z.object({
  asOf: z.string().trim().min(1),
  currency: z.string().trim().min(1),
  overdueInvoices: z.number().int().nonnegative(),
  openInvoices: z.number().int().nonnegative(),
  unpaidBalance: z.number().nonnegative(),
});

export const accountingDashboardSummaryResponseDataSchema = accountingDashboardSummarySchema;
export const accountingDashboardSummaryResponseSchema = apiSuccessSchema(accountingDashboardSummaryResponseDataSchema);

export type AccountingDashboardSummary = z.infer<typeof accountingDashboardSummarySchema>;
export type AccountingDashboardSummaryResponseData = z.infer<typeof accountingDashboardSummaryResponseDataSchema>;
export type AccountingDashboardSummaryResponse = z.infer<typeof accountingDashboardSummaryResponseSchema>;
