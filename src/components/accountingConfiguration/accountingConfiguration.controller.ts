import type { Pool } from 'pg';

import { accountingConfigurationSchema, type AccountingConfiguration, type AccountingConfigurationUpdateBody } from './accountingConfiguration.schema.ts';

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

/**
 * Upserts configuration for the accounting module.
 */
export const updateAccountingConfiguration = async (pool: Pool, body: AccountingConfigurationUpdateBody) => {
  const configuration = accountingConfigurationSchema.parse(body.configuration);

  const result = await pool.query<SetupRow>(
    `
      INSERT INTO "setup" (
        "module",
        "configuration"
      )
      VALUES (
        $1,
        $2::jsonb
      )
      ON CONFLICT ("module")
      DO UPDATE SET
        "configuration" = EXCLUDED."configuration"
      RETURNING
        "module",
        "configuration";
    `,
    [accountingModuleName, JSON.stringify(configuration)],
  );

  const row = result.rows[0];

  if (!row) {
    return {
      configuration: body.configuration,
      module: accountingModuleName,
    } as const;
  }

  return {
    configuration: accountingConfigurationSchema.parse(row.configuration),
    module: accountingModuleName,
  } as const;
};
