CREATE TABLE IF NOT EXISTS "tenantUser" (
  "tenantId" uuid NOT NULL,
  "userEmail" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT statement_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT statement_timestamp(),
  CONSTRAINT "tenantUserPrimaryKey" PRIMARY KEY ("tenantId", "userEmail"),
  CONSTRAINT "tenantUserTenantForeignKey" FOREIGN KEY ("tenantId") REFERENCES "tenant" ("id") ON DELETE CASCADE,
  CONSTRAINT "tenantUserUserForeignKey" FOREIGN KEY ("userEmail") REFERENCES "user" ("email") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "tenantUserUserEmailIndex" ON "tenantUser" ("userEmail");

DROP TRIGGER IF EXISTS "setUpdatedAtOnTenantUser" ON "tenantUser";

CREATE TRIGGER "setUpdatedAtOnTenantUser"
BEFORE UPDATE ON "tenantUser"
FOR EACH ROW
EXECUTE FUNCTION "setUpdatedAt"();
