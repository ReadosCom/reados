import { ensurePool } from "@components/postgres/pool.ts";
import { escapeIdentifier } from "pg";

import {
  SegmentNotFoundError,
  SegmentRequiredDeleteError,
  SegmentRequiredUpdateError,
  requiredSegmentDefinitions,
  type CreateSegmentBody,
  type ReorderSegmentBody,
  type Segment,
  type SegmentRow,
  type UpdateSegmentBody,
} from "./segment.schema.ts";
const pool = ensurePool();

const getGlSegmentIndexName = (segmentId: string) => {
  return `glSegment_${segmentId.replaceAll(`-`, `_`)}_idx`;
};

const asSegment = (row: SegmentRow): Segment => {
  return {
    createdAt: row.createdAt.toISOString(),
    id: row.id,
    label: row.label,
    order: row.order,
    required: row.required,
    type: row.type,
    updatedAt: row.updatedAt.toISOString(),
  };
};

const selectSegments = async () => {
  return pool.query<SegmentRow>(
    `
      SELECT
        "id",
        "label",
        "order",
        "required",
        "type",
        "createdAt",
        "updatedAt"
      FROM "segment"
      ORDER BY "order" ASC;
    `,
  );
};

const ensureRequiredSegments = async () => {
  const client = await pool.connect();

  try {
    await client.query(`BEGIN;`);
    await client.query(`LOCK TABLE "segment" IN SHARE ROW EXCLUSIVE MODE;`);

    const existingResult = await client.query<Pick<SegmentRow, "id" | "order">>(
      `
        SELECT
          "id",
          "order"
        FROM "segment";
      `,
    );
    const existingSegmentIds = new Set(existingResult.rows.map((row) => row.id));
    let nextOrder = Math.max(-1, ...existingResult.rows.map((row) => row.order)) + 1;

    for (const requiredSegment of requiredSegmentDefinitions) {
      if (existingSegmentIds.has(requiredSegment.id)) {
        await client.query(
          `
            UPDATE "segment"
            SET
              "required" = true,
              "type" = $2
            WHERE "id" = $1;
          `,
          [requiredSegment.id, requiredSegment.type],
        );
        continue;
      }

      await client.query(
        `
          INSERT INTO "segment" (
            "id",
            "label",
            "order",
            "required",
            "type"
          )
          VALUES ($1, $2, $3, true, $4);
        `,
        [requiredSegment.id, requiredSegment.label, nextOrder, requiredSegment.type],
      );
      nextOrder += 1;
    }

    for (const requiredSegment of requiredSegmentDefinitions) {
      await client.query(`ALTER TABLE "gl" ADD COLUMN IF NOT EXISTS ${escapeIdentifier(requiredSegment.id)} text;`);
      await client.query(`CREATE INDEX IF NOT EXISTS ${escapeIdentifier(getGlSegmentIndexName(requiredSegment.id))} ON "gl" (${escapeIdentifier(requiredSegment.id)});`);
    }

    await client.query(`COMMIT;`);
  } catch (error) {
    await client.query(`ROLLBACK;`);
    throw error;
  } finally {
    client.release();
  }
};

const ensureOrder = async (rows: SegmentRow[]) => {
  const hasOrderDrift = rows.some((row, index) => row.order !== index);

  if (!hasOrderDrift) {
    return rows;
  }

  const client = await pool.connect();

  try {
    await client.query(`BEGIN;`);
    await client.query(`LOCK TABLE "segment" IN SHARE ROW EXCLUSIVE MODE;`);
    await client.query(
      `
        UPDATE "segment" AS "segmentToUpdate"
        SET "order" = "orderedSegment"."normalizedOrder"
        FROM (
          SELECT
            "id",
            ROW_NUMBER() OVER (ORDER BY "order" ASC, "id" ASC) - 1 AS "normalizedOrder"
          FROM "segment"
        ) AS "orderedSegment"
        WHERE "segmentToUpdate"."id" = "orderedSegment"."id";
      `,
    );
    const normalizedResult = await client.query<SegmentRow>(
      `
        SELECT
          "id",
          "label",
          "order",
          "required",
          "type",
          "createdAt",
          "updatedAt"
        FROM "segment"
        ORDER BY "order" ASC;
      `,
    );
    await client.query(`COMMIT;`);
    return normalizedResult.rows;
  } catch (error) {
    await client.query(`ROLLBACK;`);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Returns all accounting segments ordered for presentation/processing.
 */
export const listSegments = async () => {
  await ensureRequiredSegments();
  const result = await selectSegments();

  const orderedRows = await ensureOrder(result.rows);

  return orderedRows.map(asSegment);
};

/**
 * Returns one accounting segment by id.
 */
export const getSegmentById = async (id: string) => {
  await ensureRequiredSegments();

  const result = await pool.query<SegmentRow>(
    `
      SELECT
        "id",
        "label",
        "order",
        "required",
        "type",
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
export const createSegment = async (body: CreateSegmentBody) => {
  const result = await pool.query<SegmentRow>(
    `
      INSERT INTO "segment" (
        "label",
        "order",
        "required",
        "type"
      )
      VALUES ($1, $2, $3, $4)
      RETURNING
        "id",
        "label",
        "order",
        "required",
        "type",
        "createdAt",
        "updatedAt";
    `,
    [body.label, body.order, body.required, `generic`],
  );

  return asSegment(result.rows[0]);
};

/**
 * Updates one accounting segment.
 */
export const updateSegment = async (id: string, body: UpdateSegmentBody) => {
  await getSegmentById(id);

  if (body.required === false && requiredSegmentDefinitions.some((requiredSegment) => requiredSegment.id === id)) {
    throw new SegmentRequiredUpdateError(id);
  }

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
        "type",
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
export const deleteSegment = async (id: string) => {
  await ensureRequiredSegments();

  const client = await pool.connect();

  try {
    await client.query(`BEGIN;`);

    const existingResult = await client.query<SegmentRow>(
      `
        SELECT
          "id",
          "label",
          "order",
          "required",
          "type",
          "createdAt",
          "updatedAt"
        FROM "segment"
        WHERE "id" = $1
        LIMIT 1
        FOR UPDATE;
      `,
      [id],
    );

    const existingRow = existingResult.rows[0];

    if (!existingRow) {
      throw new SegmentNotFoundError(id);
    }

    if (existingRow.required) {
      throw new SegmentRequiredDeleteError(id);
    }

    const result = await client.query<SegmentRow>(
      `
        DELETE FROM "segment"
        WHERE "id" = $1
        RETURNING
          "id",
          "label",
          "order",
          "required",
          "type",
          "createdAt",
          "updatedAt";
      `,
      [id],
    );

    const row = result.rows[0];

    if (!row) {
      throw new SegmentNotFoundError(id);
    }

    await client.query(`ALTER TABLE "gl" DROP COLUMN IF EXISTS ${escapeIdentifier(id)};`);
    await client.query(`COMMIT;`);
    return asSegment(row);
  } catch (error) {
    await client.query(`ROLLBACK;`);
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Reorders one accounting segment by swapping order with its adjacent segment.
 */
export const reorderSegment = async (id: string, body: ReorderSegmentBody) => {
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

    return getSegmentById(id);
  } catch (error) {
    await client.query(`ROLLBACK`);
    throw error;
  } finally {
    client.release();
  }
};
