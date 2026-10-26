-- ====================
-- Item Release tables 
-- ====================
CREATE TABLE IF NOT EXISTS public.lab_result_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.case_sessions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.lab_results(id) ON DELETE CASCADE,
  released_at timestamptz NOT NULL DEFAULT now(),
  released_by uuid REFERENCES auth.users(id),
  UNIQUE (session_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.clinical_document_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.case_sessions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.clinical_documents(id) ON DELETE CASCADE,
  released_at timestamptz NOT NULL DEFAULT now(),
  released_by uuid REFERENCES auth.users(id),
  UNIQUE (session_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.order_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.case_sessions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  released_at timestamptz NOT NULL DEFAULT now(),
  released_by uuid REFERENCES auth.users(id),
  UNIQUE (session_id, item_id)
);

CREATE TABLE IF NOT EXISTS public.medication_order_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.case_sessions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.medication_orders(id) ON DELETE CASCADE,
  released_at timestamptz NOT NULL DEFAULT now(),
  released_by uuid REFERENCES auth.users(id),
  UNIQUE (session_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_lab_result_releases_item
  ON public.lab_result_releases (item_id);
CREATE INDEX IF NOT EXISTS idx_clinical_document_releases_item
  ON public.clinical_document_releases (item_id);
CREATE INDEX IF NOT EXISTS idx_order_releases_item
  ON public.order_releases (item_id);
CREATE INDEX IF NOT EXISTS idx_medication_order_releases_item
  ON public.medication_order_releases (item_id);

ALTER TABLE public.lab_result_releases REPLICA IDENTITY FULL;
ALTER TABLE public.clinical_document_releases REPLICA IDENTITY FULL;
ALTER TABLE public.order_releases REPLICA IDENTITY FULL;
ALTER TABLE public.medication_order_releases REPLICA IDENTITY FULL;

-- =========================================
-- Realtime
-- =========================================
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'lab_result_releases',
    'clinical_document_releases',
    'order_releases',
    'medication_order_releases'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_rel pr
      JOIN pg_publication p ON p.oid = pr.prpubid
      JOIN pg_class c ON c.oid = pr.prrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE p.pubname = 'supabase_realtime'
        AND n.nspname = 'public'
        AND c.relname = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END
$$;

-- =========================================
-- Update releasable item tables
-- =========================================
ALTER TABLE public.lab_results
  ALTER COLUMN time_offset DROP NOT NULL;

ALTER TABLE public.lab_results
  ADD COLUMN IF NOT EXISTS phase integer NOT NULL DEFAULT 1;

ALTER TABLE public.lab_results
  ADD COLUMN IF NOT EXISTS label text;

ALTER TABLE public.clinical_documents
  ALTER COLUMN time_offset DROP NOT NULL;

ALTER TABLE public.clinical_documents
  ADD COLUMN IF NOT EXISTS label text;

ALTER TABLE public.medication_orders
  ADD COLUMN IF NOT EXISTS label text;

-- =======================
-- Backfill faculty label 
-- =======================
UPDATE public.medication_orders mo
SET label = m.generic_name
FROM public.medications m
WHERE mo.medication_id = m.id
  AND (mo.label IS NULL OR btrim(mo.label) = '');



-- ===========
-- RPC updates
-- ===========
CREATE OR REPLACE FUNCTION public.case_builder_replace_labs(p_case_id uuid, p_lab_rows jsonb)
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
      'is_in_presim', COALESCE((item->>'is_in_presim')::boolean, true),
      'time_offset', CASE
        WHEN COALESCE((item->>'phase')::integer, 1) > 1 THEN NULL
        ELSE (item->>'time_offset')::integer
      END,
      'phase', COALESCE((item->>'phase')::integer, 1),
      'label', NULLIF(btrim(COALESCE(item->>'label', '')), '')
    )
  )).* FROM jsonb_array_elements(COALESCE(p_lab_rows, '[]'::jsonb)) item;
  UPDATE public.cases SET updated_at = now() WHERE id = p_case_id;
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
  INSERT INTO public.clinical_documents(case_id, is_in_presim, category, specialty, author, time_offset, doc_text, phase, label)
  SELECT p_case_id,
         COALESCE((item->>'is_in_presim')::boolean, true),
         (item->>'category')::public.clinical_doc_category_type,
         COALESCE(item->>'specialty', ''),
         item->>'author',
         CASE
           WHEN COALESCE((item->>'phase')::integer, 1) > 1 THEN NULL
           ELSE (item->>'time_offset')::integer
         END,
         item->>'doc_text',
         COALESCE((item->>'phase')::integer, 1),
         NULLIF(btrim(COALESCE(item->>'label', '')), '')
  FROM jsonb_array_elements(COALESCE(p_rows, '[]'::jsonb)) item;
  UPDATE public.cases SET updated_at = now() WHERE id = p_case_id;
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
    indication, ordering_provider, infusion_rate, is_in_presim, phase, label
  )
  SELECT (item->>'id')::uuid, p_case_id, (item->>'medication_id')::uuid,
         COALESCE((item->>'dose')::numeric, 0),
         (item->>'frequency')::public.medication_frequencies,
         (item->>'priority')::public.medication_priorities,
         item->>'instructions', item->>'indication', item->>'ordering_provider',
         (item->>'infusion_rate')::numeric, COALESCE((item->>'is_in_presim')::boolean, true),
         COALESCE((item->>'phase')::integer, 1),
         COALESCE(
           NULLIF(btrim(COALESCE(item->>'label', '')), ''),
           (SELECT m.generic_name FROM public.medications m WHERE m.id = (item->>'medication_id')::uuid)
         )
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
  UPDATE public.cases SET updated_at = now() WHERE id = p_case_id;
END;
$$;

-- ================
-- RPC permissions
-- ================
REVOKE ALL ON FUNCTION public.case_builder_replace_labs(uuid, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.case_builder_replace_labs(uuid, jsonb)
  TO service_role;

REVOKE ALL ON FUNCTION public.case_builder_replace_clinical_documents(uuid, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.case_builder_replace_clinical_documents(uuid, jsonb)
  TO service_role;

REVOKE ALL ON FUNCTION public.case_builder_replace_medications(uuid, jsonb, jsonb)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.case_builder_replace_medications(uuid, jsonb, jsonb)
  TO service_role;
