-- Medication form inputs can represent an optional infusion rate as an empty
-- string. Treat that value as NULL before casting it to the numeric column.
CREATE OR REPLACE FUNCTION public.case_builder_replace_medications(
  p_case_id uuid,
  p_orders jsonb,
  p_administrations jsonb
)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  PERFORM 1 FROM public.cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Case % was not found', p_case_id; END IF;

  DELETE FROM public.medication_administrations WHERE case_id = p_case_id;
  DELETE FROM public.medication_orders WHERE case_id = p_case_id;

  INSERT INTO public.medication_orders(
    id, case_id, medication_id, dose, frequency, priority, instructions,
    indication, ordering_provider, infusion_rate, is_in_presim, phase
  )
  SELECT (item->>'id')::uuid, p_case_id, (item->>'medication_id')::uuid,
         COALESCE((item->>'dose')::numeric, 0),
         (item->>'frequency')::public.medication_frequencies,
         (item->>'priority')::public.medication_priorities,
         item->>'instructions', item->>'indication', item->>'ordering_provider',
         NULLIF(btrim(item->>'infusion_rate'), '')::numeric,
         COALESCE((item->>'is_in_presim')::boolean, true),
         COALESCE((item->>'phase')::integer, 1)
  FROM jsonb_array_elements(COALESCE(p_orders, '[]'::jsonb)) item;

  INSERT INTO public.medication_administrations(
    case_id, medication_order_id, administrator, time_offset, status, notes,
    administered_dose, is_in_presim, phase
  )
  SELECT p_case_id, (item->>'medication_order_id')::uuid,
         COALESCE(item->>'administrator', ''), (item->>'time_offset')::integer,
         item->>'status', COALESCE(item->>'notes', ''),
         (item->>'administered_dose')::numeric,
         COALESCE((item->>'is_in_presim')::boolean, true),
         COALESCE((item->>'phase')::integer, 1)
  FROM jsonb_array_elements(COALESCE(p_administrations, '[]'::jsonb)) item;

  UPDATE public.cases
  SET case_creation_complete = false, updated_at = now()
  WHERE id = p_case_id;
END;
$$;

REVOKE ALL ON FUNCTION public.case_builder_replace_medications(uuid, jsonb, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.case_builder_replace_medications(uuid, jsonb, jsonb)
  TO service_role;
