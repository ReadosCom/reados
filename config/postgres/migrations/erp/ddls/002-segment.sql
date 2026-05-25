CREATE TABLE IF NOT EXISTS "segment" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "label" text NOT NULL,
  "order" integer NOT NULL,
  "required" boolean NOT NULL,
  "type" text NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  CONSTRAINT "segmentOrderUnique" UNIQUE ("order"),
  CONSTRAINT "segmentTypeValid" CHECK ("type" IN ('entity', 'account', 'generic'))
);

SELECT "ensureSetUpdatedAtTrigger"('segment');
