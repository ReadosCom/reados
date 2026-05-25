import type { Pool } from 'pg';

import { accountingConfigurationSchema, type AccountingConfiguration } from './accountingConfiguration.schema.ts';

const accountingModuleName = `accounting`;

const defaultAccountingConfiguration: AccountingConfiguration = accountingConfigurationSchema.parse({});

/**
 * Returns persisted configuration for the accounting module.
 */
export const getAccountingConfiguration = async (_pool: Pool) => {
  return {
    configuration: defaultAccountingConfiguration,
    module: accountingModuleName,
  } as const;
};
