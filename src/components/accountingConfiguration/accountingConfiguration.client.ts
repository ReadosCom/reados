import { getErpServiceOrigin } from "@components/application/application.host.ts";
import {
  accountingConfigurationResponseSchema,
  finalizeAccountingConfigurationResponseSchema,
  type AccountingConfigurationResponseData,
  type FinalizeAccountingConfigurationResponseData,
} from "./accountingConfiguration.schema.ts";

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

/**
 * Finalizes accounting configuration.
 */
export const finalizeAccountingConfiguration = async (): Promise<FinalizeAccountingConfigurationResponseData> => {
  const response = await fetch(`${root}/accounting/configuration/finalize`, {
    credentials: `include`,
    method: `POST`,
  });

  if (!response.ok) {
    throw new Error(`Failed to finalize accounting configuration.`);
  }

  return finalizeAccountingConfigurationResponseSchema.parse(await response.json()).data;
};
