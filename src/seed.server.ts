import 'dotenv/config';

import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';

import { Client } from 'pg';
import { z } from 'zod';

const tenantSeedSchema = z.object({
  billingAccountAddress: z.string().trim().min(1),
  billingAccountName: z.string().trim().min(1),
  billingAccountTaxId: z.string().trim().min(1),
  tenantName: z.string().trim().min(1),
  tenantSlug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, `Use lowercase letters, numbers, and single hyphens between words.`),
  userDisplayName: z.string().trim().min(1),
  userEmail: z.string().trim().email(),
  userFirstName: z.string().trim().min(1),
  userLastName: z.string().trim().min(1),
  userMiddleName: z
    .string()
    .trim()
    .transform((value) => (value ? value : null)),
});

type TenantSeedInput = z.input<typeof tenantSeedSchema>;
type TenantSeedData = z.output<typeof tenantSeedSchema>;

type SeedQuestion = {
  defaultValue: string;
  environmentName: keyof TenantSeedInput;
  label: string;
};

const seedQuestions: SeedQuestion[] = [
  {
    defaultValue: `Demo Tenant`,
    environmentName: `tenantName`,
    label: `Tenant name`,
  },
  {
    defaultValue: `demo`,
    environmentName: `tenantSlug`,
    label: `Tenant slug`,
  },
  {
    defaultValue: `admin@reados.localhost`,
    environmentName: `userEmail`,
    label: `Admin user email`,
  },
  {
    defaultValue: `Reados`,
    environmentName: `userFirstName`,
    label: `Admin first name`,
  },
  {
    defaultValue: ``,
    environmentName: `userMiddleName`,
    label: `Admin middle name`,
  },
  {
    defaultValue: `Admin`,
    environmentName: `userLastName`,
    label: `Admin last name`,
  },
  {
    defaultValue: `Reados Admin`,
    environmentName: `userDisplayName`,
    label: `Admin display name`,
  },
  {
    defaultValue: `Demo Tenant Billing`,
    environmentName: `billingAccountName`,
    label: `Billing account name`,
  },
  {
    defaultValue: `Local development address`,
    environmentName: `billingAccountAddress`,
    label: `Billing account address`,
  },
  {
    defaultValue: `DEMO-TAX-ID`,
    environmentName: `billingAccountTaxId`,
    label: `Billing account tax ID`,
  },
];

const environmentVariableNames = {
  billingAccountAddress: `SEED_BILLING_ACCOUNT_ADDRESS`,
  billingAccountName: `SEED_BILLING_ACCOUNT_NAME`,
  billingAccountTaxId: `SEED_BILLING_ACCOUNT_TAX_ID`,
  tenantName: `SEED_TENANT_NAME`,
  tenantSlug: `SEED_TENANT_SLUG`,
  userDisplayName: `SEED_USER_DISPLAY_NAME`,
  userEmail: `SEED_USER_EMAIL`,
  userFirstName: `SEED_USER_FIRST_NAME`,
  userLastName: `SEED_USER_LAST_NAME`,
  userMiddleName: `SEED_USER_MIDDLE_NAME`,
} satisfies Record<keyof TenantSeedInput, string>;

const getBooleanEnvironmentValue = (name: string) => [`1`, `true`, `yes`].includes((process.env[name] ?? ``).toLowerCase());

const getServiceName = () => process.argv[2] ?? process.env.SEED_SERVICE ?? `tenant`;

const getDatabaseUrl = (serviceName: string) => {
  const serviceDatabaseUrl = process.env[`${serviceName.toUpperCase()}_DATABASE_URL`];
  const databaseUrl = process.env.DATABASE_URL;

  if (serviceDatabaseUrl) {
    return serviceDatabaseUrl;
  }

  if (databaseUrl && serviceName === `tenant`) {
    return databaseUrl;
  }

  const postgresPassword = process.env.READOS_POSTGRES_PASSWORD;
  const postgresHost = process.env.POSTGRES_HOST ?? `localhost`;

  if (!postgresPassword) {
    throw new Error(`Expected DATABASE_URL or READOS_POSTGRES_PASSWORD to be defined for the seed runner.`);
  }

  return `postgres://postgres:${postgresPassword}@${postgresHost}:5432/${serviceName}`;
};

const getEnvironmentSeedInput = (): Partial<TenantSeedInput> =>
  Object.fromEntries(
    Object.entries(environmentVariableNames)
      .map(([inputName, environmentVariableName]) => [inputName, process.env[environmentVariableName]])
      .filter((entry): entry is [string, string] => typeof entry[1] === `string`),
  );

const getSeedInputFromEnvironment = (useDefaults: boolean) => {
  const environmentSeedInput = getEnvironmentSeedInput();
  const missingEnvironmentVariableNames = seedQuestions.filter(({ environmentName }) => !useDefaults && typeof environmentSeedInput[environmentName] !== `string`).map(({ environmentName }) => environmentVariableNames[environmentName]);

  if (missingEnvironmentVariableNames.length > 0) {
    throw new Error(`Missing required seed environment variables: ${missingEnvironmentVariableNames.join(`, `)}.`);
  }

  return Object.fromEntries(seedQuestions.map(({ defaultValue, environmentName }) => [environmentName, environmentSeedInput[environmentName] ?? defaultValue])) as TenantSeedInput;
};

const askSeedQuestions = async () => {
  const environmentSeedInput = getEnvironmentSeedInput();
  const readline = createInterface({
    input,
    output,
  });
  const answers: Partial<TenantSeedInput> = {};

  try {
    for (const { defaultValue, environmentName, label } of seedQuestions) {
      const suggestedValue = environmentSeedInput[environmentName] ?? defaultValue;
      const answer = await readline.question(`${label} [${suggestedValue}]: `);

      answers[environmentName] = answer.trim() || suggestedValue;
    }

    return answers as TenantSeedInput;
  } finally {
    readline.close();
  }
};

const getSeedData = async () => {
  const isNonInteractive = getBooleanEnvironmentValue(`SEED_NON_INTERACTIVE`) || !process.stdin.isTTY;
  const seedInput = isNonInteractive ? getSeedInputFromEnvironment(getBooleanEnvironmentValue(`SEED_USE_DEFAULTS`)) : await askSeedQuestions();

  return tenantSeedSchema.parse(seedInput);
};

const rollbackOpenTransaction = async (client: Client, isTransactionOpen: boolean) => {
  if (isTransactionOpen) {
    await client.query(`ROLLBACK;`);
  }
};

/**
 * Upserts the authentication-owned user seed data.
 */
export const seedAuthenticationData = async (client: Client, seedData: TenantSeedData) => {
  await client.query(
    `
      INSERT INTO "user" 
        ( "email", "firstName", "middleName", "lastName", "displayName" )
      VALUES 
        ( $1,      $2,          $3,            $4,        $5 )
      ON CONFLICT ("email")
      DO UPDATE SET
        "firstName" = EXCLUDED."firstName",
        "middleName" = EXCLUDED."middleName",
        "lastName" = EXCLUDED."lastName",
        "displayName" = EXCLUDED."displayName";
    `,
    [seedData.userEmail, seedData.userFirstName, seedData.userMiddleName, seedData.userLastName, seedData.userDisplayName],
  );
};

/**
 * Upserts the tenant-owned seed data needed to bootstrap tenant discovery.
 */
export const seedTenantData = async (client: Client, seedData: TenantSeedData) => {
  const tenantResult = await client.query<{ id: string }>(
    `
      INSERT INTO "tenant" (
        "name",
        "slug"
      )
      VALUES (
        $1,
        $2
      )
      ON CONFLICT ("slug")
      DO UPDATE SET
        "name" = EXCLUDED."name"
      RETURNING "id";
    `,
    [seedData.tenantName, seedData.tenantSlug],
  );
  const tenant = tenantResult.rows[0]?.id;

  if (!tenant) {
    throw new Error(`Could not create or update tenant ${seedData.tenantSlug}.`);
  }

  await client.query(
    `
      INSERT INTO "tenantUser" (
        "tenant",
        "user"
      )
      VALUES (
        $1,
        $2
      )
      ON CONFLICT ("tenant", "user")
      DO NOTHING;
    `,
    [tenant, seedData.userEmail],
  );

  const existingBillingAccountResult = await client.query<{ id: string }>(
    `
      SELECT "id"
      FROM "billingAccount"
      WHERE "tenant" = $1
        AND "name" = $2
      LIMIT 1;
    `,
    [tenant, seedData.billingAccountName],
  );
  const existingBillingAccountId = existingBillingAccountResult.rows[0]?.id;

  if (existingBillingAccountId) {
    await client.query(
      `
        UPDATE "billingAccount"
        SET
          "address" = $1,
          "taxId" = $2
        WHERE "id" = $3;
      `,
      [seedData.billingAccountAddress, seedData.billingAccountTaxId, existingBillingAccountId],
    );

    return;
  }

  await client.query(
    `
      INSERT INTO "billingAccount" (
        "tenant",
        "name",
        "address",
        "taxId"
      )
      VALUES (
        $1,
        $2,
        $3,
        $4
      );
    `,
    [tenant, seedData.billingAccountName, seedData.billingAccountAddress, seedData.billingAccountTaxId],
  );
};

const run = async () => {
  const serviceName = getServiceName();

  if (serviceName !== `tenant`) {
    throw new Error(`Only tenant seeding is supported today.`);
  }

  const seedData = await getSeedData();
  const authenticationClient = new Client({
    connectionString: getDatabaseUrl(`authentication`),
  });
  const tenantClient = new Client({
    connectionString: getDatabaseUrl(serviceName),
  });
  let isAuthenticationClientConnected = false;
  let isTenantClientConnected = false;
  let isAuthenticationTransactionOpen = false;
  let isTenantTransactionOpen = false;

  try {
    await authenticationClient.connect();
    isAuthenticationClientConnected = true;
    await tenantClient.connect();
    isTenantClientConnected = true;
    await authenticationClient.query(`BEGIN;`);
    isAuthenticationTransactionOpen = true;
    await tenantClient.query(`BEGIN;`);
    isTenantTransactionOpen = true;
    await seedAuthenticationData(authenticationClient, seedData);
    await seedTenantData(tenantClient, seedData);
    await authenticationClient.query(`COMMIT;`);
    isAuthenticationTransactionOpen = false;
    await tenantClient.query(`COMMIT;`);
    isTenantTransactionOpen = false;

    console.log(`Seeded tenant "${seedData.tenantSlug}" with admin user "${seedData.userEmail}".`);
  } catch (error) {
    await rollbackOpenTransaction(tenantClient, isTenantTransactionOpen);
    await rollbackOpenTransaction(authenticationClient, isAuthenticationTransactionOpen);
    throw error;
  } finally {
    if (isAuthenticationClientConnected) {
      await authenticationClient.end();
    }

    if (isTenantClientConnected) {
      await tenantClient.end();
    }
  }
};

await run();
