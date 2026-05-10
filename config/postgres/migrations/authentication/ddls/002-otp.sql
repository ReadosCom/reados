CREATE TABLE IF NOT EXISTS "otp" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "user" text NOT NULL,
  "hash" text NOT NULL,
  "expiresAt" timestamptz NOT NULL,
  "remainingAttempt" integer NOT NULL DEFAULT 5,
  "createdAt" timestamptz NOT NULL DEFAULT statement_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT statement_timestamp(),
  CONSTRAINT "otpRemainingAttemptCheck" CHECK ("remainingAttempt" >= 0)
);

CREATE INDEX IF NOT EXISTS "otpUserCreatedAtIndex" ON "otp" ("user", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "otpExpiresAtIndex" ON "otp" ("expiresAt");

SELECT "ensureSetUpdatedAtTrigger"('otp');
