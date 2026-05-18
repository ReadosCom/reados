import type { Pool } from 'pg';

import {
  AccountingSegmentNotFoundError,
  AccountingSegmentRequiredDeleteError,
  type AccountingSegment,
  type AccountingSegmentRow,
  type CreateAccountingSegmentBody,
  type UpdateAccountingSegmentBody,
} from './accountingSegment.schema.ts';

const entitySystemSegmentId = `00000000-0000-7000-8000-000000000001`;
const accountSystemSegmentId = `00000000-0000-7000-8000-000000000002`;

const asAccountingSegment = (row: AccountingSegmentRow): AccountingSegment => {
  return {
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    label: row.label,
    order: row.order,
    required: row.required,
    updatedAt: row.updatedAt.toISOString(),
  };
};

const selectAccountingSegments = async (pool: Pool) => {
  return pool.query<AccountingSegmentRow>(
    `
      SELECT
        "id",
        "label",
        "order",
        "required",
        "active",
        "createdAt",
        "updatedAt"
      FROM "accountingSegment"
      ORDER BY "order" ASC;
    `,
  );
};

const ensureDefaultAccountingSegments = async (pool: Pool) => {
  await pool.query(
    `
      INSERT INTO "accountingSegment" (
        "id",
        "label",
        "order",
        "required",
        "active",
        "source"
      )
      VALUES
        ($1, 'Entity', 0, true, true, 'system'),
        ($2, 'Account', 1, true, true, 'system')
      ON CONFLICT ("id") DO NOTHING;
    `,
    [entitySystemSegmentId, accountSystemSegmentId],
  );
};

/**
 * Returns all accounting segments ordered for presentation/processing.
 */
export const listAccountingSegments = async (pool: Pool) => {
  let result = await selectAccountingSegments(pool);

  if (result.rowCount === 0) {
    await ensureDefaultAccountingSegments(pool);
    result = await selectAccountingSegments(pool);
  }

  return result.rows.map(asAccountingSegment);
};

/**
 * Returns one accounting segment by id.
 */
export const getAccountingSegmentById = async (pool: Pool, id: string) => {
  const result = await pool.query<AccountingSegmentRow>(
    `
      SELECT
        "id",
        "label",
        "order",
        "required",
        "active",
        "createdAt",
        "updatedAt"
      FROM "accountingSegment"
      WHERE "id" = $1
      LIMIT 1;
    `,
    [id],
  );

  const row = result.rows[0];

  if (!row) {
    throw new AccountingSegmentNotFoundError(id);
  }

  return asAccountingSegment(row);
};

/**
 * Creates one accounting segment.
 */
export const createAccountingSegment = async (pool: Pool, body: CreateAccountingSegmentBody) => {
  const result = await pool.query<AccountingSegmentRow>(
    `
      INSERT INTO "accountingSegment" (
        "label",
        "order",
        "required",
        "active",
        "source"
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        "id",
        "label",
        "order",
        "required",
        "active",
        "createdAt",
        "updatedAt";
    `,
    [body.label, body.order, body.required, body.active, `custom`],
  );

  return asAccountingSegment(result.rows[0]);
};

/**
 * Updates one accounting segment.
 */
export const updateAccountingSegment = async (pool: Pool, id: string, body: UpdateAccountingSegmentBody) => {
  await getAccountingSegmentById(pool, id);

  const result = await pool.query<AccountingSegmentRow>(
    `
      UPDATE "accountingSegment"
      SET
        "label" = COALESCE($2, "label"),
        "order" = COALESCE($3, "order"),
        "required" = COALESCE($4, "required"),
        "active" = COALESCE($5, "active")
      WHERE "id" = $1
      RETURNING
        "id",
        "label",
        "order",
        "required",
        "active",
        "createdAt",
        "updatedAt";
    `,
    [id, body.label ?? null, body.order ?? null, body.required ?? null, body.active ?? null],
  );

  const row = result.rows[0];

  if (!row) {
    throw new AccountingSegmentNotFoundError(id);
  }

  return asAccountingSegment(row);
};

/**
 * Deletes one accounting segment.
 */
export const deleteAccountingSegment = async (pool: Pool, id: string) => {
  const existingSegment = await getAccountingSegmentById(pool, id);

  if (existingSegment.required) {
    throw new AccountingSegmentRequiredDeleteError(id);
  }

  const result = await pool.query<AccountingSegmentRow>(
    `
      DELETE FROM "accountingSegment"
      WHERE "id" = $1
      RETURNING
        "id",
        "label",
        "order",
        "required",
        "active",
        "createdAt",
        "updatedAt";
    `,
    [id],
  );

  const row = result.rows[0];

  if (!row) {
    throw new AccountingSegmentNotFoundError(id);
  }

  return asAccountingSegment(row);
};
