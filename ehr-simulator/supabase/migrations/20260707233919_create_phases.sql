ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS phase_count integer NOT NULL DEFAULT 1;

ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_phase_count_check;

ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS num_cases_count_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_phase_count_check
  CHECK (phase_count >= 1 AND phase_count <= 10);

ALTER TABLE public.case_sessions
  ADD COLUMN IF NOT EXISTS current_phase integer NOT NULL DEFAULT 1;

ALTER TABLE public.case_sessions
  DROP CONSTRAINT IF EXISTS case_sessions_current_phase_check;

ALTER TABLE public.case_sessions
  ADD CONSTRAINT case_sessions_current_phase_check
  CHECK (current_phase >= 1);

ALTER TABLE public.clinical_documents
  ADD COLUMN IF NOT EXISTS phase integer NOT NULL DEFAULT 1;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS phase integer NOT NULL DEFAULT 1;

ALTER TABLE public.medication_orders
  ADD COLUMN IF NOT EXISTS phase integer NOT NULL DEFAULT 1;

ALTER TABLE public.medication_administrations
  ADD COLUMN IF NOT EXISTS phase integer NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_clinical_documents_case_phase
  ON public.clinical_documents (case_id, phase);

CREATE INDEX IF NOT EXISTS idx_orders_case_phase
  ON public.orders (case_id, phase);

CREATE INDEX IF NOT EXISTS idx_medication_orders_case_phase
  ON public.medication_orders (case_id, phase);

CREATE INDEX IF NOT EXISTS idx_medication_administrations_case_phase
  ON public.medication_administrations (case_id, phase);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.pubname = 'supabase_realtime'
      AND n.nspname = 'public'
      AND c.relname = 'case_sessions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.case_sessions;
  END IF;
END
$$;

GRANT SELECT ON public.case_sessions TO authenticated;
GRANT ALL ON public.case_sessions TO service_role;

DROP VIEW IF EXISTS public.all_clinical_documents;

CREATE VIEW public.all_clinical_documents AS
SELECT
  id,
  case_id,
  NULL::uuid AS case_session_id,
  is_in_presim,
  phase,
  category,
  specialty,
  author,
  time_offset,
  doc_text,
  'case_document'::text AS source_type
FROM public.clinical_documents

UNION ALL

SELECT
  id,
  case_id,
  case_session_id,
  is_in_presim,
  1 AS phase,
  category,
  specialty,
  author,
  time_offset,
  doc_text,
  'student_document'::text AS source_type
FROM public.editable_clinical_documents;

DROP VIEW IF EXISTS public.all_medication_administrations;

CREATE VIEW public.all_medication_administrations AS
SELECT
  case_id,
  NULL::uuid AS case_session_id,
  medication_order_id,
  administrator,
  time_offset,
  status,
  notes,
  administered_dose,
  infusion_rate,
  is_in_presim,
  phase,
  'case_administration'::text AS source_type
FROM public.medication_administrations

UNION ALL

SELECT
  case_id,
  case_session_id,
  medication_order_id,
  administrator,
  time_offset,
  status,
  notes,
  administered_dose,
  infusion_rate,
  is_in_presim,
  1 AS phase,
  'student_administration'::text AS source_type
FROM public.student_medication_administrations;
