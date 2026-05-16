CREATE TABLE IF NOT EXISTS "billingAccount" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "tenant" uuid NOT NULL,
  "name" text NOT NULL,
  "address" text NOT NULL,
  "taxId" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  CONSTRAINT "billingAccountTenantForeignKey" FOREIGN KEY ("tenant") REFERENCES "tenant" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "billingAccountTenantIndex" ON "billingAccount" ("tenant");

SELECT "ensureSetUpdatedAtTrigger"('billingAccount');
