import type { Pool } from 'pg';

import {
  SegmentNotFoundError,
  SegmentRequiredDeleteError,
  type Segment,
  type SegmentRow,
  type CreateSegmentBody,
  type ReorderSegmentBody,
  type UpdateSegmentBody,
} from './segment.schema.ts';

const entitySystemSegmentId = `00000000-0000-7000-8000-000000000001`;
const accountSystemSegmentId = `00000000-0000-7000-8000-000000000002`;

const asSegment = (row: SegmentRow): Segment => {
  return {
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    label: row.label,
    order: row.order,
    required: row.required,
    updatedAt: row.updatedAt.toISOString(),
  };
};

const selectSegments = async (pool: Pool) => {
  return pool.query<SegmentRow>(
    `
      SELECT
        "id",
        "label",
        "order",
        "required",
        "createdAt",
        "updatedAt"
      FROM "segment"
      ORDER BY "order" ASC;
    `,
  );
};

const ensureDefaultSegments = async (pool: Pool) => {
  await pool.query(
    `
      INSERT INTO "segment" (
        "id",
        "label",
        "order",
        "required",
        "source"
      )
      VALUES
        ($1, 'Entity', 0, true, 'system'),
        ($2, 'Account', 1, true, 'system')
      ON CONFLICT ("id") DO NOTHING;
    `,
    [entitySystemSegmentId, accountSystemSegmentId],
  );
};

/**
 * Returns all accounting segments ordered for presentation/processing.
 */
export const listSegments = async (pool: Pool) => {
  let result = await selectSegments(pool);

  if (result.rowCount === 0) {
    await ensureDefaultSegments(pool);
    result = await selectSegments(pool);
  }

  return result.rows.map(asSegment);
};

/**
 * Returns one accounting segment by id.
 */
export const getSegmentById = async (pool: Pool, id: string) => {
  const result = await pool.query<SegmentRow>(
    `
      SELECT
        "id",
        "label",
        "order",
        "required",
        "createdAt",
        "updatedAt"
      FROM "segment"
      WHERE "id" = $1
      LIMIT 1;
    `,
    [id],
  );

  const row = result.rows[0];

  if (!row) {
    throw new SegmentNotFoundError(id);
  }

  return asSegment(row);
};

/**
 * Creates one accounting segment.
 */
export const createSegment = async (pool: Pool, body: CreateSegmentBody) => {
  const result = await pool.query<SegmentRow>(
    `
      INSERT INTO "segment" (
        "label",
        "order",
        "required",
        "source"
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        "id",
        "label",
        "order",
        "required",
        "createdAt",
        "updatedAt";
    `,
    [body.label, body.order, body.required, `custom`],
  );

  return asSegment(result.rows[0]);
};

/**
 * Updates one accounting segment.
 */
export const updateSegment = async (pool: Pool, id: string, body: UpdateSegmentBody) => {
  await getSegmentById(pool, id);

  const result = await pool.query<SegmentRow>(
    `
      UPDATE "segment"
      SET
        "label" = COALESCE($2, "label"),
        "order" = COALESCE($3, "order"),
        "required" = COALESCE($4, "required")
      WHERE "id" = $1
      RETURNING
        "id",
        "label",
        "order",
        "required",
        "createdAt",
        "updatedAt";
    `,
    [id, body.label ?? null, body.order ?? null, body.required ?? null],
  );

  const row = result.rows[0];

  if (!row) {
    throw new SegmentNotFoundError(id);
  }

  return asSegment(row);
};

/**
 * Deletes one accounting segment.
 */
export const deleteSegment = async (pool: Pool, id: string) => {
  const existingSegment = await getSegmentById(pool, id);

  if (existingSegment.required) {
    throw new SegmentRequiredDeleteError(id);
  }

  const result = await pool.query<SegmentRow>(
    `
      DELETE FROM "segment"
      WHERE "id" = $1
      RETURNING
        "id",
        "label",
        "order",
        "required",
        "createdAt",
        "updatedAt";
    `,
    [id],
  );

  const row = result.rows[0];

  if (!row) {
    throw new SegmentNotFoundError(id);
  }

  return asSegment(row);
};

/**
 * Reorders one accounting segment by swapping order with its adjacent segment.
 */
export const reorderSegment = async (pool: Pool, id: string, body: ReorderSegmentBody) => {
  const client = await pool.connect();

  try {
    await client.query(`BEGIN`);

    await client.query(`LOCK TABLE "segment" IN SHARE ROW EXCLUSIVE MODE;`);

    await client.query(
      `
        UPDATE "segment"
        SET "order" = "order" * 100;
      `,
    );

    await client.query(
      `
        UPDATE "segment"
        SET "order" = "order" + $2
        WHERE "id" = $1;
      `,
      [id, body.direction === `up` ? -150 : 150],
    );

    await client.query(
      `
        UPDATE "segment" AS "segmentToUpdate"
        SET "order" = -("orderedSegment"."normalizedOrder" + 1)
        FROM (
          SELECT
            "id",
            ROW_NUMBER() OVER (ORDER BY "order" ASC) - 1 AS "normalizedOrder"
          FROM "segment"
        ) AS "orderedSegment"
        WHERE "segmentToUpdate"."id" = "orderedSegment"."id";
      `,
    );

    await client.query(
      `
        UPDATE "segment"
        SET "order" = (-"order") - 1;
      `,
    );

    await client.query(`COMMIT`);

    return getSegmentById(pool, id);
  } catch (error) {
    await client.query(`ROLLBACK`);
    throw error;
  } finally {
    client.release();
  }
};
