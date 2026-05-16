CREATE TABLE IF NOT EXISTS "user" (
  "email" text PRIMARY KEY,
  "profile" jsonb NOT NULL DEFAULT '{"language":"en"}'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT transaction_timestamp()
);

SELECT "ensureSetUpdatedAtTrigger"('user');
