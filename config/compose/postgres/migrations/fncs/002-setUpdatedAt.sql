CREATE OR REPLACE FUNCTION "setUpdatedAt"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW."updatedAt" := statement_timestamp();
  RETURN NEW;
END;
$$;
