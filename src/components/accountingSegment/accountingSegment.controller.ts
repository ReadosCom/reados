import type { Pool } from "pg";

/**
 * Returns all accounting segments ordered for presentation/processing.
 */
export const listAccountingSegments = async (pool: Pool) => {
  const result = await pool.query(
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

  return result.rows;
};
