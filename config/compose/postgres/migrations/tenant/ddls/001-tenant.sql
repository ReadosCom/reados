CREATE TABLE IF NOT EXISTS "tenant" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "name" text NOT NULL,
  "slug" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT statement_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT statement_timestamp(),
  CONSTRAINT "tenantSlugUnique" UNIQUE ("slug"),
  CONSTRAINT "tenantSlugLowercase" CHECK ("slug" = lower("slug")),
  CONSTRAINT "tenantSlugFormat" CHECK ("slug" ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

DROP TRIGGER IF EXISTS "setUpdatedAtOnTenant" ON "tenant";

CREATE TRIGGER "setUpdatedAtOnTenant"
BEFORE UPDATE ON "tenant"
FOR EACH ROW
EXECUTE FUNCTION "setUpdatedAt"();
