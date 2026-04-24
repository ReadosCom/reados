CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_catalog.pg_proc AS procedureDefinition
    JOIN pg_catalog.pg_namespace AS namespaceDefinition
      ON namespaceDefinition.oid = procedureDefinition.pronamespace
    WHERE namespaceDefinition.nspname = current_schema()
      AND procedureDefinition.proname = 'uuidv7'
      AND pg_catalog.pg_get_function_identity_arguments(procedureDefinition.oid) = ''
  ) THEN
    EXECUTE $function$
      CREATE FUNCTION uuidv7()
      RETURNS uuid
      LANGUAGE plpgsql
      VOLATILE
      AS $body$
      DECLARE
        unixTimestampMilliseconds bigint;
        randomBytes bytea;
      BEGIN
        unixTimestampMilliseconds := floor(extract(epoch FROM clock_timestamp()) * 1000);
        randomBytes := gen_random_bytes(10);

        randomBytes := set_byte(randomBytes, 0, (get_byte(randomBytes, 0) & 15) | 112);
        randomBytes := set_byte(randomBytes, 2, (get_byte(randomBytes, 2) & 63) | 128);

        RETURN encode(
          substring(int8send(unixTimestampMilliseconds) FROM 3) || randomBytes,
          'hex'
        )::uuid;
      END;
      $body$;
    $function$;
  END IF;
END;
$$;
