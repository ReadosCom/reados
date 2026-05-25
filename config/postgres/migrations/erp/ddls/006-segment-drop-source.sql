ALTER TABLE "segment"
DROP CONSTRAINT IF EXISTS "segmentSourceValid";

ALTER TABLE "segment"
DROP COLUMN IF EXISTS "source";
