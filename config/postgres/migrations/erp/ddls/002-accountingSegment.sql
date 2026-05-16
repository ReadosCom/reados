CREATE TABLE IF NOT EXISTS "accountingSegment" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "label" text NOT NULL,
  "order" integer NOT NULL,
  "required" boolean NOT NULL,
  "active" boolean NOT NULL,
  "source" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  CONSTRAINT "accountingSegmentOrderUnique" UNIQUE ("order"),
  CONSTRAINT "accountingSegmentSourceValid" CHECK ("source" IN ('system', 'custom'))
);

SELECT "ensureSetUpdatedAtTrigger"('accountingSegment');
