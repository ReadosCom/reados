import { getErpServiceOrigin } from "@components/application/application.host.ts";
import { accountingConfigurationResponseSchema, type AccountingConfigurationResponseData } from "./accountingConfiguration.schema.ts";

const root = getErpServiceOrigin();

/**
 * Fetches accounting configuration.
 */
export const getAccountingConfiguration = async (): Promise<AccountingConfigurationResponseData> => {
  const response = await fetch(`${root}/accounting/configuration`, {
    credentials: `include`,
  });

  if (!response.ok) {
    throw new Error(`Failed to load accounting configuration.`);
  }

  return accountingConfigurationResponseSchema.parse(await response.json()).data;
};
