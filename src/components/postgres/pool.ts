import { Pool } from "pg";

let pool: Pool | null = null;

const getDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(`Expected DATABASE_URL to be defined for PostgreSQL access.`);
  }

  return databaseUrl;
};

/**
 * Returns the shared PostgreSQL pool for the current process, creating it once on demand.
 */
export const ensurePool = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  return pool;
};
