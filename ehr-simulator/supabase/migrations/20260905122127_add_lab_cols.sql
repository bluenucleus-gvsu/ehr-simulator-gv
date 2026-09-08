-- Add missing labs_result values (CBC, VBGs, ABGs)
ALTER TABLE IF EXISTS lab_results
  ADD COLUMN IF NOT EXISTS blood_type text,
  ADD COLUMN IF NOT EXISTS rh_factor text,
  ADD COLUMN IF NOT EXISTS inr text,
  ADD COLUMN IF NOT EXISTS bnp text,
  ADD COLUMN IF NOT EXISTS hba1c text,
  ADD COLUMN IF NOT EXISTS d_dimer text,
  ADD COLUMN IF NOT EXISTS procal text,
  ADD COLUMN IF NOT EXISTS basophils text,
  ADD COLUMN IF NOT EXISTS monocytes text,
  ADD COLUMN IF NOT EXISTS eosinophils text,
  ADD COLUMN IF NOT EXISTS lymphocytes text,
  ADD COLUMN IF NOT EXISTS neutrophils text,


  ADD COLUMN IF NOT EXISTS art_pco2 text,
  ADD COLUMN IF NOT EXISTS art_po2 text,
  ADD COLUMN IF NOT EXISTS art_ph  text,
  ADD COLUMN IF NOT EXISTS art_so2 text,


  ADD COLUMN IF NOT EXISTS ven_ph text,
  ADD COLUMN IF NOT EXISTS ven_so2 text;


ALTER TABLE IF EXISTS lab_results RENAME COLUMN pco2 TO ven_pco2;
ALTER TABLE IF EXISTS lab_results RENAME COLUMN po2 TO ven_po2;
ALTER TABLE IF EXISTS lab_results RENAME COLUMN co2 TO total_co2;
ALTER TABLE IF EXISTS lab_results RENAME COLUMN blood TO urine_blood;
ALTER TABLE IF EXISTS lab_results RENAME COLUMN protein TO urine_protein;

ALTER TABLE lab_results
  ALTER COLUMN albumin TYPE text,
  ALTER COLUMN alp TYPE text,
  ALTER COLUMN alt TYPE text,
  ALTER COLUMN ammonia TYPE text,
  ALTER COLUMN amylase TYPE text,
  ALTER COLUMN ast TYPE text,
  ALTER COLUMN bun TYPE text,
  ALTER COLUMN calcium TYPE text,
  ALTER COLUMN chloride TYPE text,
  ALTER COLUMN ckmb TYPE text,
  ALTER COLUMN creatinine TYPE text,
  ALTER COLUMN crp TYPE text,
  ALTER COLUMN esr TYPE text,
  ALTER COLUMN free_t3 TYPE text,
  ALTER COLUMN free_t4 TYPE text,
  ALTER COLUMN glucose TYPE text,
  ALTER COLUMN hco3 TYPE text,
  ALTER COLUMN hdl_cholesterol TYPE text,
  ALTER COLUMN hematocrit TYPE text,
  ALTER COLUMN hemoglobin TYPE text,
  ALTER COLUMN lactate TYPE text,
  ALTER COLUMN ldl_cholesterol TYPE text,
  ALTER COLUMN lipase TYPE text,
  ALTER COLUMN magnesium TYPE text,
  ALTER COLUMN mch TYPE text,
  ALTER COLUMN mchc TYPE text,
  ALTER COLUMN mcv TYPE text,
  ALTER COLUMN myoglobin TYPE text,
  ALTER COLUMN phosphate TYPE text,
  ALTER COLUMN platelets TYPE text,
  ALTER COLUMN potassium TYPE text,
  ALTER COLUMN pt TYPE text,
  ALTER COLUMN ptt TYPE text,
  ALTER COLUMN rbc TYPE text,
  ALTER COLUMN sodium TYPE text,
  ALTER COLUMN specific_gravity TYPE text,
  ALTER COLUMN total_bilirubin TYPE text,
  ALTER COLUMN total_cholesterol TYPE text,
  ALTER COLUMN total_co2 TYPE text,
  ALTER COLUMN triglycerides TYPE text,
  ALTER COLUMN troponin TYPE text,
  ALTER COLUMN tsh TYPE text,
  ALTER COLUMN urine_ph TYPE text,
  ALTER COLUMN ven_pco2 TYPE text,
  ALTER COLUMN ven_po2 TYPE text,
  ALTER COLUMN wbc TYPE text;

-- Remove MicrobiologyReport, ImagingReport, and case_creation_complete
CREATE OR REPLACE FUNCTION public.case_builder_replace_labs(
  p_case_id uuid,
  p_lab_rows jsonb
)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE unknown_column text;
BEGIN
  PERFORM 1 FROM public.cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Case % was not found', p_case_id; END IF;
  SELECT key INTO unknown_column
  FROM jsonb_array_elements(COALESCE(p_lab_rows, '[]'::jsonb)) item
  CROSS JOIN LATERAL jsonb_object_keys(item) key
  WHERE key NOT IN (
    SELECT attribute.attname
    FROM pg_catalog.pg_attribute attribute
    WHERE attribute.attrelid = 'public.lab_results'::regclass
      AND attribute.attnum > 0 AND NOT attribute.attisdropped
  )
  LIMIT 1;
  IF unknown_column IS NOT NULL THEN
    RAISE EXCEPTION 'Unknown lab_results column: %', unknown_column;
  END IF;

  DELETE FROM public.lab_results WHERE case_id = p_case_id;
  INSERT INTO public.lab_results
  SELECT (jsonb_populate_record(
    NULL::public.lab_results,
    item || jsonb_build_object(
      'id', gen_random_uuid(), 'case_id', p_case_id, 'created_at', now(),
      'data', COALESCE(item->'data', '{}'::jsonb),
      'is_in_presim', COALESCE((item->>'is_in_presim')::boolean, true)
    )
  )).* FROM jsonb_array_elements(COALESCE(p_lab_rows, '[]'::jsonb)) item;
END;
$$;
