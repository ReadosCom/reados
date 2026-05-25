CREATE TABLE IF NOT EXISTS "gl" (
  "id" uuid PRIMARY KEY DEFAULT uuidv7(),
  "journal" uuid NOT NULL REFERENCES "journal"("id") ON DELETE RESTRICT,
  "date" date NOT NULL,
  "debit" numeric(18,2) NOT NULL DEFAULT 0,
  "credit" numeric(18,2) NOT NULL DEFAULT 0,
  "createdAt" timestamptz NOT NULL DEFAULT transaction_timestamp(),
  CONSTRAINT "glDebitNonNegative" CHECK ("debit" >= 0),
  CONSTRAINT "glCreditNonNegative" CHECK ("credit" >= 0),
  CONSTRAINT "glNonZeroAmount" CHECK ("debit" > 0 OR "credit" > 0)
);
