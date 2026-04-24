CREATE TABLE IF NOT EXISTS "tenantUser" (
  "tenant" uuid NOT NULL,
  "user" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT statement_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT statement_timestamp(),
  CONSTRAINT "tenantUserPrimaryKey" PRIMARY KEY ("tenant", "user"),
  CONSTRAINT "tenantUserTenantForeignKey" FOREIGN KEY ("tenant") REFERENCES "tenant" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "tenantUserUserIndex" ON "tenantUser" ("user");

DROP TRIGGER IF EXISTS "setUpdatedAtOnTenantUser" ON "tenantUser";

CREATE TRIGGER "setUpdatedAtOnTenantUser"
BEFORE UPDATE ON "tenantUser"
FOR EACH ROW
EXECUTE FUNCTION "setUpdatedAt"();
