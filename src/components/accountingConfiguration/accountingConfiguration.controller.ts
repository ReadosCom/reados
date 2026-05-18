import type { Pool } from 'pg';

import { accountingConfigurationSchema, type AccountingConfiguration } from './accountingConfiguration.schema.ts';

const accountingModuleName = `accounting`;

type SetupRow = {
  configuration: Record<string, unknown>;
  module: string;
};

const defaultAccountingConfiguration: AccountingConfiguration = {
  finalized: false,
};

/**
 * Returns persisted configuration for the accounting module.
 */
export const getAccountingConfiguration = async (pool: Pool) => {
  const result = await pool.query<SetupRow>(
    `
      SELECT
        "module",
        "configuration"
      FROM "setup"
      WHERE "module" = $1
      LIMIT 1;
    `,
    [accountingModuleName],
  );

  const row = result.rows[0];

  if (!row) {
    return {
      configuration: defaultAccountingConfiguration,
      module: accountingModuleName,
    } as const;
  }

  const configuration = accountingConfigurationSchema.parse(row.configuration);

  return {
    configuration,
    module: accountingModuleName,
  } as const;
};
