CREATE TABLE IF NOT EXISTS "setup" (
  "module" text PRIMARY KEY,
  "configuration" jsonb NOT NULL
);

INSERT INTO "setup" ("module", "configuration") VALUES ('accounting', '{}'::jsonb) ON CONFLICT ("module") DO NOTHING;
