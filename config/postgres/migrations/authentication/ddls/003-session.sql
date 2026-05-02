CREATE TABLE IF NOT EXISTS "session" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "user" text NOT NULL,
  "userAgent" text,
  "ipAddress" text,
  "expiresAt" timestamptz NOT NULL,
  "revokedAt" timestamptz,
  "createdAt" timestamptz NOT NULL DEFAULT statement_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT statement_timestamp()
);

CREATE INDEX IF NOT EXISTS "sessionUserIndex" ON "session" ("user");
CREATE INDEX IF NOT EXISTS "sessionExpiresAtIndex" ON "session" ("expiresAt");

DROP TRIGGER IF EXISTS "setUpdatedAtOnSession" ON "session";

CREATE TRIGGER "setUpdatedAtOnSession"
BEFORE UPDATE ON "session"
FOR EACH ROW
EXECUTE FUNCTION "setUpdatedAt"();
