import { erpServiceGet } from "@components/application/application.client.ts";
import { accountingConfigurationResponseSchema, type AccountingConfigurationResponseData } from "./accountingConfiguration.schema.ts";

/**
 * Fetches accounting configuration.
 */
export const getAccountingConfiguration = async (): Promise<AccountingConfigurationResponseData> => {
  const response = await erpServiceGet({
    path: `/accounting/configuration`,
  });

  if (!response.ok) {
    throw new Error(`Failed to load accounting configuration.`);
  }

  return accountingConfigurationResponseSchema.parse(await response.json()).data;
};
