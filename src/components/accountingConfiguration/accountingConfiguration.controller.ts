import { escapeIdentifier, type Pool } from 'pg';

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

type SegmentColumnRow = {
  id: string;
};

/**
 * Finalizes accounting configuration and creates runtime ledger tables/constraints.
 */
export const finalizeAccountingConfiguration = async (pool: Pool) => {
  const client = await pool.connect();

  try {
    await client.query(`BEGIN;`);

    const setupResult = await client.query<SetupRow>(
      `
        SELECT
          "module",
          "configuration"
        FROM "setup"
        WHERE "module" = $1
        FOR UPDATE;
      `,
      [accountingModuleName],
    );

    const existingSetup = setupResult.rows[0];
    const currentConfiguration = existingSetup
      ? accountingConfigurationSchema.parse(existingSetup.configuration)
      : defaultAccountingConfiguration;

    if (currentConfiguration.finalized) {
      await client.query(`COMMIT;`);
      return {
        configuration: currentConfiguration,
        module: accountingModuleName,
      } as const;
    }

    const segmentResult = await client.query<SegmentColumnRow>(
      `
        SELECT
          "id"
        FROM "segment"
        ORDER BY "order" ASC;
      `,
    );

    const segmentColumns = segmentResult.rows.map(({ id }) => id);

    for (const segmentColumn of segmentColumns) {
      await client.query(`ALTER TABLE "gl" ADD COLUMN IF NOT EXISTS ${escapeIdentifier(segmentColumn)} text;`);
    }

    const finalizedConfiguration: AccountingConfiguration = {
      finalized: true,
    };

    await client.query(
      `
        INSERT INTO "setup" ("module", "configuration")
        VALUES ($1, $2::jsonb)
        ON CONFLICT ("module")
        DO UPDATE SET
          "configuration" = EXCLUDED."configuration";
      `,
      [accountingModuleName, JSON.stringify(finalizedConfiguration)],
    );

    await client.query(`COMMIT;`);

    return {
      configuration: finalizedConfiguration,
      module: accountingModuleName,
    } as const;
  } catch (error) {
    await client.query(`ROLLBACK;`);
    throw error;
  } finally {
    client.release();
  }
};
