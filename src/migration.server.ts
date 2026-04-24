import 'dotenv/config';

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import { Client } from 'pg';

const migrationRootDirectoryPath = path.resolve(process.cwd(), 'config/postgres/migrations');
const orderedMigrationDirectoryNames = ['fncs', 'ddls', 'fncs', 'seed'] as const;

type MigrationDirectory = {
  directoryPath: string;
  label: string;
};

const getServiceName = () => {
  const serviceName = process.argv[2] ?? process.env.MIGRATION_SERVICE;

  if (!serviceName) {
    throw new Error('Expected a migration service name as the first argument or MIGRATION_SERVICE.');
  }

  return serviceName;
};

const getDatabaseUrl = (serviceName: string) => {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    return databaseUrl;
  }

  const postgresPassword = process.env.READOS_POSTGRES_PASSWORD;
  const postgresHost = process.env.POSTGRES_HOST ?? `localhost`;

  if (!postgresPassword) {
    throw new Error('Expected DATABASE_URL to be defined for the migration runner, or READOS_POSTGRES_PASSWORD for the local Docker Compose PostgreSQL fallback.');
  }

  return `postgres://postgres:${postgresPassword}@${postgresHost}:5432/${serviceName}`;
};

const getMigrationDirectories = (serviceName: string): MigrationDirectory[] => {
  const serviceMigrationDirectoryPath = path.join(migrationRootDirectoryPath, serviceName);

  return orderedMigrationDirectoryNames.map((directoryName, index) => {
    if (index === 0) {
      return {
        directoryPath: path.join(migrationRootDirectoryPath, directoryName),
        label: `shared/${directoryName}`,
      };
    }

    return {
      directoryPath: path.join(serviceMigrationDirectoryPath, directoryName),
      label: `${serviceName}/${directoryName}`,
    };
  });
};

const getSqlFilePaths = async ({ directoryPath, label }: MigrationDirectory) => {
  try {
    const directoryEntries = await readdir(directoryPath, { withFileTypes: true });

    return directoryEntries
      .filter((directoryEntry) => directoryEntry.isFile() && directoryEntry.name.endsWith('.sql'))
      .sort((leftDirectoryEntry, rightDirectoryEntry) => leftDirectoryEntry.name.localeCompare(rightDirectoryEntry.name))
      .map((directoryEntry) => ({
        filePath: path.join(directoryPath, directoryEntry.name),
        label: `${label}/${directoryEntry.name}`,
      }));
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }

    throw error;
  }
};

const run = async () => {
  const serviceName = getServiceName();
  const databaseUrl = getDatabaseUrl(serviceName);
  const client = new Client({
    connectionString: databaseUrl,
  });
  let isTransactionOpen = false;

  const migrationDirectories = getMigrationDirectories(serviceName);
  const migrationFiles = (await Promise.all(migrationDirectories.map((migrationDirectory) => getSqlFilePaths(migrationDirectory)))).flat();

  if (migrationFiles.length === 0) {
    console.log(`No migration files found for ${serviceName}.`);
    return;
  }

  await client.connect();

  try {
    for (const migrationFile of migrationFiles) {
      const sql = await readFile(migrationFile.filePath, 'utf8');

      if (!sql.trim()) {
        continue;
      }

      console.log(`Applying ${migrationFile.label}`);

      await client.query('BEGIN;');
      isTransactionOpen = true;
      await client.query(sql);
      await client.query('COMMIT;');
      isTransactionOpen = false;
    }
  } catch (error) {
    if (isTransactionOpen) {
      await client.query('ROLLBACK;');
    }

    throw error;
  } finally {
    await client.end();
  }
};

await run();
