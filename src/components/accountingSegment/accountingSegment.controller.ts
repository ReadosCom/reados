import type { Pool } from 'pg';

import { AccountingSegmentNotFoundError, type AccountingSegment, type AccountingSegmentRow, type CreateAccountingSegmentBody, type UpdateAccountingSegmentBody } from './accountingSegment.schema.ts';

const asAccountingSegment = (row: AccountingSegmentRow): AccountingSegment => {
  return {
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    label: row.label,
    order: row.order,
    required: row.required,
    source: row.source,
    updatedAt: row.updatedAt.toISOString(),
  };
};

/**
 * Returns all accounting segments ordered for presentation/processing.
 */
export const listAccountingSegments = async (pool: Pool) => {
  const result = await pool.query<AccountingSegmentRow>(
    `
      SELECT
        "id",
        "label",
        "order",
        "required",
        "active",
        "source",
        "createdAt",
        "updatedAt"
      FROM "accountingSegment"
      ORDER BY "order" ASC;
    `,
  );

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
        "source",
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
        "source",
        "createdAt",
        "updatedAt";
    `,
    [body.label, body.order, body.required, body.active, body.source],
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
        "active" = COALESCE($5, "active"),
        "source" = COALESCE($6, "source")
      WHERE "id" = $1
      RETURNING
        "id",
        "label",
        "order",
        "required",
        "active",
        "source",
        "createdAt",
        "updatedAt";
    `,
    [id, body.label ?? null, body.order ?? null, body.required ?? null, body.active ?? null, body.source ?? null],
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
        "source",
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
