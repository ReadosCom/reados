CREATE TABLE IF NOT EXISTS "segment" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "label" text NOT NULL,
  "order" integer NOT NULL,
  "required" boolean NOT NULL,
  "type" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  CONSTRAINT "segmentOrderUnique" UNIQUE ("order"),
  CONSTRAINT "segmentTypeValid" CHECK ("type" IN ('entity', 'account', 'customer', 'supplier', 'generic'))
);

SELECT "ensureSetUpdatedAtTrigger"('segment');

-- Historical alterations consolidated into the base segment DDL file.
-- Keeping IF EXISTS / IF NOT EXISTS guards preserves idempotent behavior across environments.
ALTER TABLE "segment"
DROP CONSTRAINT IF EXISTS "segmentSourceValid";

ALTER TABLE "segment"
DROP COLUMN IF EXISTS "source";

ALTER TABLE "segment"
ADD COLUMN IF NOT EXISTS "type" text;

UPDATE "segment"
SET "type" = CASE
  WHEN "id" = '00000000-0000-7000-8000-000000000001' THEN 'entity'
  WHEN "id" = '00000000-0000-7000-8000-000000000002' THEN 'account'
  ELSE 'generic'
END
WHERE "type" IS NULL;

ALTER TABLE "segment"
ALTER COLUMN "type" SET NOT NULL;

ALTER TABLE "segment"
DROP CONSTRAINT IF EXISTS "segmentTypeValid";

ALTER TABLE "segment"
ADD CONSTRAINT "segmentTypeValid" CHECK ("type" IN ('entity', 'account', 'customer', 'supplier', 'generic'));
