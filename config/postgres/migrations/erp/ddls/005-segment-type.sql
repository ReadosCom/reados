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
ADD CONSTRAINT "segmentTypeValid" CHECK ("type" IN ('entity', 'account', 'generic'));
