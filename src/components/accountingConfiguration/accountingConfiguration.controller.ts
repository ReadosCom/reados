import type { Pool } from "pg";

import type { AccountingConfigurationUpdateBody } from "./accountingConfiguration.schema.ts";

const accountingModuleName = `accounting`;

type SetupRow = {
  configuration: Record<string, unknown>;
  module: string;
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
      configuration: {},
      module: accountingModuleName,
    } as const;
  }

  return {
    configuration: row.configuration,
    module: accountingModuleName,
  } as const;
};

/**
 * Upserts configuration for the accounting module.
 */
export const updateAccountingConfiguration = async (pool: Pool, body: AccountingConfigurationUpdateBody) => {
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
    [accountingModuleName, JSON.stringify(body.configuration)],
  );

  const row = result.rows[0];

  if (!row) {
    return {
      configuration: body.configuration,
      module: accountingModuleName,
    } as const;
  }

  return {
    configuration: row.configuration,
    module: accountingModuleName,
  } as const;
};
