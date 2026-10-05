BEGIN;

DO $$
DECLARE
  function_signature regprocedure;
  function_definition text;
BEGIN
  FOREACH function_signature IN ARRAY ARRAY[
    'public.case_builder_replace_history(uuid,jsonb)'::regprocedure,
    'public.case_builder_replace_clinical_documents(uuid,jsonb)'::regprocedure,
    'public.case_builder_replace_orders(uuid,jsonb)'::regprocedure,
    'public.case_builder_replace_medications(uuid,jsonb,jsonb)'::regprocedure,
    'public.case_builder_replace_documentation(uuid,jsonb)'::regprocedure,
    'public.case_builder_replace_labs(uuid,jsonb,jsonb,jsonb)'::regprocedure,
    'public.case_builder_replace_media(uuid,jsonb)'::regprocedure
  ]
  LOOP
    function_definition := pg_get_functiondef(function_signature);
    function_definition := replace(
      function_definition,
      'case_creation_complete = false,',
      ''
    );

    IF position('case_creation_complete' IN function_definition) > 0 THEN
      RAISE EXCEPTION 'Unable to remove publication state from function %', function_signature;
    END IF;

    EXECUTE function_definition;
  END LOOP;
END;
$$;

DROP FUNCTION IF EXISTS public.case_builder_publish(uuid);

ALTER TABLE public.cases
  DROP COLUMN IF EXISTS case_creation_complete;

COMMIT;
