DROP INDEX IF EXISTS public.idx_orders_case_phase;
DROP INDEX IF EXISTS public.idx_lab_results_case_phase;
DROP INDEX IF EXISTS public.idx_medication_orders_case_phase;
DROP INDEX IF EXISTS public.idx_medication_administrations_case_phase;

ALTER TABLE public.lab_results
  DROP CONSTRAINT IF EXISTS lab_results_case_id_phase_time_offset_key;

ALTER TABLE public.lab_results
  ADD CONSTRAINT lab_results_case_id_time_offset_key
  UNIQUE (case_id, time_offset);

ALTER TABLE public.case_sessions
  DROP CONSTRAINT IF EXISTS case_sessions_current_phase_check;

ALTER TABLE public.case_sessions
  DROP COLUMN IF EXISTS current_phase;

ALTER TABLE public.medication_administrations
  DROP COLUMN IF EXISTS phase;

ALTER TABLE public.medication_orders
  DROP COLUMN IF EXISTS phase;

ALTER TABLE public.lab_results
  DROP COLUMN IF EXISTS phase;

ALTER TABLE public.orders
  DROP COLUMN IF EXISTS phase;

ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_phase_count_check;

ALTER TABLE public.cases
  DROP COLUMN IF EXISTS phase_count;

