import { accountingConfigurationResponseSchema, accountingConfigurationUpdateBodySchema, type AccountingConfigurationResponseData, type AccountingConfigurationUpdateBody } from "./accountingConfiguration.schema.ts";

/**
 * Fetches accounting configuration.
 */
export const getAccountingConfiguration = async (): Promise<AccountingConfigurationResponseData> => {
  const response = await fetch(`/configuration/accounting`, {
    credentials: `include`,
  });

  if (!response.ok) {
    throw new Error(`Failed to load accounting configuration.`);
  }

  return accountingConfigurationResponseSchema.parse(await response.json()).data;
};

/**
 * Persists accounting configuration.
 */
export const updateAccountingConfiguration = async (body: AccountingConfigurationUpdateBody): Promise<AccountingConfigurationResponseData> => {
  const parsedBody = accountingConfigurationUpdateBodySchema.parse(body);
  const response = await fetch(`/configuration/accounting`, {
    body: JSON.stringify(parsedBody),
    credentials: `include`,
    headers: {
      "Content-Type": `application/json`,
    },
    method: `PATCH`,
  });

  if (!response.ok) {
    throw new Error(`Failed to update accounting configuration.`);
  }

  return accountingConfigurationResponseSchema.parse(await response.json()).data;
};
