CREATE OR REPLACE FUNCTION "ensureSetUpdatedAtTrigger"(tableName text)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  triggerName text := 'setUpdatedAtOn_' || tableName;
  triggerExists boolean := false;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_trigger AS triggerDefinition
    JOIN pg_class AS tableDefinition
      ON tableDefinition.oid = triggerDefinition.tgrelid
    JOIN pg_namespace AS schemaDefinition
      ON schemaDefinition.oid = tableDefinition.relnamespace
    WHERE NOT triggerDefinition.tgisinternal
      AND tableDefinition.relname = tableName
      AND triggerDefinition.tgname = triggerName
      AND schemaDefinition.nspname = current_schema
  )
  INTO triggerExists;

  IF triggerExists THEN
    RETURN;
  END IF;

  EXECUTE format(
    'CREATE TRIGGER %I BEFORE UPDATE ON %I.%I FOR EACH ROW EXECUTE FUNCTION "setUpdatedAt"()',
    triggerName,
    current_schema,
    tableName
  );
END;
$$;
