CREATE TABLE IF NOT EXISTS "journal" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "type" text NOT NULL,
  "date" date NOT NULL,
  "createdAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  "updatedAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  "postedAt" timestamptz
);

SELECT "ensureSetUpdatedAtTrigger"('journal');
