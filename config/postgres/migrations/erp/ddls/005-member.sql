CREATE TABLE IF NOT EXISTS "member" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "segment" uuid NOT NULL REFERENCES "segment" ("id") ON DELETE CASCADE,
  "code" text NOT NULL,
  "name" text NOT NULL,
  "description" text NOT NULL,
  "parent" uuid REFERENCES "member" ("id") ON DELETE SET NULL,
  "type" text,
  "reporting" text,
  "createdAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  CONSTRAINT "memberTypeValid" CHECK ("type" IS NULL OR "type" IN ('expense', 'revenue', 'asset', 'liability')),
  CONSTRAINT "memberReportingValid" CHECK ("reporting" IS NULL OR "reporting" IN ('debit', 'credit')),
  CONSTRAINT "memberUniqueCodeInSegment" UNIQUE ("segment", "code")
);

CREATE INDEX IF NOT EXISTS "memberSegmentIdx" ON "member" ("segment");
CREATE INDEX IF NOT EXISTS "memberParentIdx" ON "member" ("parent");

ALTER TABLE "member"
DROP CONSTRAINT IF EXISTS "memberTypeValid";

ALTER TABLE "member"
ADD CONSTRAINT "memberTypeValid" CHECK ("type" IS NULL OR "type" IN ('expense', 'revenue', 'asset', 'liability', 'equity'));

CREATE OR REPLACE FUNCTION "validateMemberTypeForSegment"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  "segmentType" text;
BEGIN
  SELECT "type"
  INTO "segmentType"
  FROM "segment"
  WHERE "id" = NEW."segment"
  LIMIT 1;

  IF "segmentType" = 'account' AND NEW."type" IS NULL THEN
    RAISE EXCEPTION 'Member type is required for account segments.';
  END IF;

  IF "segmentType" = 'account' AND NEW."reporting" IS NULL THEN
    RAISE EXCEPTION 'Member reporting is required for account segments.';
  END IF;

  IF "segmentType" IN ('entity', 'customer', 'supplier', 'generic') AND NEW."type" IS NOT NULL THEN
    RAISE EXCEPTION 'Member type is only allowed for account segments.';
  END IF;

  IF "segmentType" IN ('entity', 'customer', 'supplier', 'generic') AND NEW."reporting" IS NOT NULL THEN
    RAISE EXCEPTION 'Member reporting is only allowed for account segments.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS "memberTypeBySegmentTrigger" ON "member";

CREATE TRIGGER "memberTypeBySegmentTrigger"
BEFORE INSERT OR UPDATE ON "member"
FOR EACH ROW
EXECUTE FUNCTION "validateMemberTypeForSegment"();

SELECT "ensureSetUpdatedAtTrigger"('member');
