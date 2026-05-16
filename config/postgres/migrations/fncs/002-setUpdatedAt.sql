CREATE OR REPLACE FUNCTION "setUpdatedAt"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updatedAt" := transaction_timestamp();
  RETURN NEW;
END;
$$;
