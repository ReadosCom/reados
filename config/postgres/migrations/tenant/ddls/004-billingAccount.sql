CREATE TABLE IF NOT EXISTS "billingAccount" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "tenant" uuid NOT NULL,
  "name" text NOT NULL,
  "address" text NOT NULL,
  "taxId" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT statement_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT statement_timestamp(),
  CONSTRAINT "billingAccountTenantForeignKey" FOREIGN KEY ("tenant") REFERENCES "tenant" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "billingAccountTenantIndex" ON "billingAccount" ("tenant");

DROP TRIGGER IF EXISTS "setUpdatedAtOnBillingAccount" ON "billingAccount";

CREATE TRIGGER "setUpdatedAtOnBillingAccount"
BEFORE UPDATE ON "billingAccount"
FOR EACH ROW
EXECUTE FUNCTION "setUpdatedAt"();
