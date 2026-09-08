-- Case-builder replacement writes must be atomic. These RPCs are intentionally
-- available only to the service role; server actions perform the user/admin check.

CREATE OR REPLACE FUNCTION public.case_builder_replace_history(p_case_id uuid, p_history jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  UPDATE public.cases
  SET medical_history = ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_history->'medicalHistory', '[]'::jsonb))),
      surgical_history = ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_history->'surgicalHistory', '[]'::jsonb))),
      allergies = ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_history->'allergies', '[]'::jsonb))),
      social_habits = ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_history->'socialHistory', '[]'::jsonb))),
      living_situation = ARRAY(SELECT jsonb_array_elements_text(COALESCE(p_history->'livingSituation', '[]'::jsonb))),
      case_creation_complete = false,
      updated_at = now()
  WHERE id = p_case_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Case % was not found', p_case_id; END IF;

  DELETE FROM public.case_safety_alerts WHERE case_id = p_case_id;
  INSERT INTO public.safety_alerts(name)
  SELECT DISTINCT btrim(value)
  FROM jsonb_array_elements_text(COALESCE(p_history->'alerts', '[]'::jsonb))
  WHERE btrim(value) <> ''
  ON CONFLICT (name) DO NOTHING;
  INSERT INTO public.case_safety_alerts(case_id, safety_alert_id)
  SELECT p_case_id, alert.id
  FROM public.safety_alerts alert
  JOIN (
    SELECT DISTINCT btrim(value) AS name
    FROM jsonb_array_elements_text(COALESCE(p_history->'alerts', '[]'::jsonb))
    WHERE btrim(value) <> ''
  ) requested USING (name);

  DELETE FROM public.case_family_history WHERE case_id = p_case_id;
  INSERT INTO public.relationship_types(name)
  SELECT DISTINCT btrim(item->>'relation')
  FROM jsonb_array_elements(COALESCE(p_history->'familyHistory', '[]'::jsonb)) item
  WHERE btrim(COALESCE(item->>'relation', '')) <> ''
    AND btrim(COALESCE(item->>'condition', '')) <> ''
  ON CONFLICT (name) DO NOTHING;
  INSERT INTO public.case_family_history(case_id, relationship_id, condition)
  SELECT DISTINCT p_case_id, relationship.id, btrim(item->>'condition')
  FROM jsonb_array_elements(COALESCE(p_history->'familyHistory', '[]'::jsonb)) item
  JOIN public.relationship_types relationship ON relationship.name = btrim(item->>'relation')
  WHERE btrim(COALESCE(item->>'relation', '')) <> ''
    AND btrim(COALESCE(item->>'condition', '')) <> '';
END;
$$;

CREATE OR REPLACE FUNCTION public.case_builder_replace_clinical_documents(p_case_id uuid, p_rows jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  PERFORM 1 FROM public.cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Case % was not found', p_case_id; END IF;
  DELETE FROM public.clinical_documents WHERE case_id = p_case_id;
  INSERT INTO public.clinical_documents(case_id, is_in_presim, category, specialty, author, time_offset, doc_text, phase)
  SELECT p_case_id,
         COALESCE((item->>'is_in_presim')::boolean, true),
         (item->>'category')::public.clinical_doc_category_type,
         COALESCE(item->>'specialty', ''),
         item->>'author',
         (item->>'time_offset')::integer,
         item->>'doc_text',
         COALESCE((item->>'phase')::integer, 1)
  FROM jsonb_array_elements(COALESCE(p_rows, '[]'::jsonb)) item;
  UPDATE public.cases SET case_creation_complete = false, updated_at = now() WHERE id = p_case_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.case_builder_replace_orders(p_case_id uuid, p_rows jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  PERFORM 1 FROM public.cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Case % was not found', p_case_id; END IF;
  DELETE FROM public.orders WHERE case_id = p_case_id;
  INSERT INTO public.orders(case_id, category, title, details, status, provider, is_important, is_in_presim, phase)
  SELECT p_case_id, item->>'category', item->>'title', COALESCE(item->>'details', ''),
         COALESCE(item->>'status', 'Active'), COALESCE(item->>'provider', ''),
         COALESCE((item->>'is_important')::boolean, false),
         COALESCE((item->>'is_in_presim')::boolean, true),
         COALESCE((item->>'phase')::integer, 1)
  FROM jsonb_array_elements(COALESCE(p_rows, '[]'::jsonb)) item;
  UPDATE public.cases SET case_creation_complete = false, updated_at = now() WHERE id = p_case_id;
END;
$$;

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
         (item->>'infusion_rate')::numeric, COALESCE((item->>'is_in_presim')::boolean, true),
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
  UPDATE public.cases SET case_creation_complete = false, updated_at = now() WHERE id = p_case_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.case_builder_replace_documentation(p_case_id uuid, p_rows jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE unknown_column text;
BEGIN
  PERFORM 1 FROM public.cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Case % was not found', p_case_id; END IF;
  SELECT key INTO unknown_column
  FROM jsonb_array_elements(COALESCE(p_rows, '[]'::jsonb)) item
  CROSS JOIN LATERAL jsonb_object_keys(item) key
  WHERE key NOT IN (
    SELECT attribute.attname
    FROM pg_catalog.pg_attribute attribute
    WHERE attribute.attrelid = 'public.documentation_results'::regclass
      AND attribute.attnum > 0 AND NOT attribute.attisdropped
  )
  LIMIT 1;
  IF unknown_column IS NOT NULL THEN
    RAISE EXCEPTION 'Unknown documentation_results column: %', unknown_column;
  END IF;

  DELETE FROM public.documentation_results WHERE case_id = p_case_id;
  INSERT INTO public.documentation_results
  SELECT (jsonb_populate_record(
    NULL::public.documentation_results,
    item || jsonb_build_object(
      'id', gen_random_uuid(), 'case_id', p_case_id,
      'created_at', now(), 'is_in_presim', COALESCE((item->>'is_in_presim')::boolean, true)
    )
  )).* FROM jsonb_array_elements(COALESCE(p_rows, '[]'::jsonb)) item;
  UPDATE public.cases SET case_creation_complete = false, updated_at = now() WHERE id = p_case_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.case_builder_replace_labs(
  p_case_id uuid,
  p_lab_rows jsonb,
  p_imaging_rows jsonb,
  p_microbiology_rows jsonb
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

  INSERT INTO public.imaging_reports(case_id, lab_id, name, technique, findings, impressions, is_critical)
  SELECT p_case_id, lab.id, item->>'name', COALESCE(item#>>'{raw,technique}', ''),
         COALESCE(item#>'{raw,findings}', '{}'::jsonb),
         ARRAY(SELECT jsonb_array_elements_text(COALESCE(item#>'{raw,impressions}', '[]'::jsonb))),
         COALESCE((item#>>'{raw,isCritical}')::boolean, false)
  FROM jsonb_array_elements(COALESCE(p_imaging_rows, '[]'::jsonb)) item
  JOIN public.lab_results lab
    ON lab.case_id = p_case_id AND lab.time_offset = (item->>'time_offset')::integer;
  IF (SELECT count(*) FROM public.imaging_reports report WHERE report.case_id = p_case_id)
     <> jsonb_array_length(COALESCE(p_imaging_rows, '[]'::jsonb)) THEN
    RAISE EXCEPTION 'One or more imaging reports did not match a lab time offset';
  END IF;

  INSERT INTO public.microbiology_reports(
    case_id, lab_id, name, sample_type, appearance, microscopy, location,
    culture_results, sensitivity, comments, reporter, is_critical
  )
  SELECT p_case_id, lab.id, item->>'name',
         COALESCE(item#>>'{raw,sampleType}', item->>'name', ''),
         COALESCE(item#>>'{raw,appearance}', ''), COALESCE(item#>>'{raw,microscopy}', ''),
         item#>>'{raw,location}', COALESCE(item#>>'{raw,cultureResults}', ''),
         COALESCE(item#>>'{raw,sensitivity}', ''), COALESCE(item#>>'{raw,comments}', ''),
         COALESCE(item#>>'{raw,reporter}', ''), COALESCE(item#>>'{raw,isCritical}', 'false')
  FROM jsonb_array_elements(COALESCE(p_microbiology_rows, '[]'::jsonb)) item
  JOIN public.lab_results lab
    ON lab.case_id = p_case_id AND lab.time_offset = (item->>'time_offset')::integer;
  IF (SELECT count(*) FROM public.microbiology_reports report WHERE report.case_id = p_case_id)
     <> jsonb_array_length(COALESCE(p_microbiology_rows, '[]'::jsonb)) THEN
    RAISE EXCEPTION 'One or more microbiology reports did not match a lab time offset';
  END IF;
  UPDATE public.cases SET case_creation_complete = false, updated_at = now() WHERE id = p_case_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.case_builder_replace_media(p_case_id uuid, p_rows jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  PERFORM 1 FROM public.cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Case % was not found', p_case_id; END IF;
  DELETE FROM public.case_images WHERE case_id = p_case_id;
  INSERT INTO public.case_images(case_id, preview_url, file_path)
  SELECT p_case_id, item->>'preview_url', item->>'file_path'
  FROM jsonb_array_elements(COALESCE(p_rows, '[]'::jsonb)) item;
  UPDATE public.cases SET case_creation_complete = false, updated_at = now() WHERE id = p_case_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.case_builder_publish(p_case_id uuid)
RETURNS public.cases
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE result public.cases;
BEGIN
  SELECT * INTO result FROM public.cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Case % was not found', p_case_id; END IF;
  IF btrim(COALESCE(result.first_name, '')) = '' OR btrim(COALESCE(result.last_name, '')) = ''
     OR btrim(COALESCE(result.description, '')) = '' OR result.date_of_birth IS NULL THEN
    RAISE EXCEPTION 'Patient name, date of birth, and case summary are required before publishing';
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.clinical_documents WHERE case_id = p_case_id AND phase NOT BETWEEN 1 AND result.phase_count
    UNION ALL SELECT 1 FROM public.orders WHERE case_id = p_case_id AND phase NOT BETWEEN 1 AND result.phase_count
    UNION ALL SELECT 1 FROM public.medication_orders WHERE case_id = p_case_id AND phase NOT BETWEEN 1 AND result.phase_count
    UNION ALL SELECT 1 FROM public.medication_administrations WHERE case_id = p_case_id AND phase NOT BETWEEN 1 AND result.phase_count
  ) THEN
    RAISE EXCEPTION 'Content has a release phase outside the case phase count';
  END IF;
  UPDATE public.cases
  SET case_creation_complete = true, updated_at = now()
  WHERE id = p_case_id
  RETURNING * INTO result;
  RETURN result;
END;
$$;

REVOKE ALL ON FUNCTION public.case_builder_replace_history(uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.case_builder_replace_clinical_documents(uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.case_builder_replace_orders(uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.case_builder_replace_medications(uuid, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.case_builder_replace_documentation(uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.case_builder_replace_labs(uuid, jsonb, jsonb, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.case_builder_replace_media(uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.case_builder_publish(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.case_builder_replace_history(uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.case_builder_replace_clinical_documents(uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.case_builder_replace_orders(uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.case_builder_replace_medications(uuid, jsonb, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.case_builder_replace_documentation(uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.case_builder_replace_labs(uuid, jsonb, jsonb, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.case_builder_replace_media(uuid, jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.case_builder_publish(uuid) TO service_role;

-- Upload/delete is performed by authenticated server actions using the service role.
DROP POLICY IF EXISTS "Allow public upload to case-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete from case-media" ON storage.objects;
