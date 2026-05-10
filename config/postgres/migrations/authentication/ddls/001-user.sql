CREATE TABLE IF NOT EXISTS "user" (
  "email" text PRIMARY KEY,
  "profile" jsonb NOT NULL DEFAULT '{"language":"en"}'::jsonb,
  "createdAt" timestamptz NOT NULL DEFAULT statement_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT statement_timestamp()
);

SELECT "ensureSetUpdatedAtTrigger"('user');
