CREATE TABLE IF NOT EXISTS "user" (
  "email" text PRIMARY KEY,
  "firstName" text NOT NULL,
  "middleName" text,
  "lastName" text NOT NULL,
  "displayName" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT statement_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT statement_timestamp()
);

DROP TRIGGER IF EXISTS "setUpdatedAtOnUser" ON "user";

CREATE TRIGGER "setUpdatedAtOnUser"
BEFORE UPDATE ON "user"
FOR EACH ROW
EXECUTE FUNCTION "setUpdatedAt"();
