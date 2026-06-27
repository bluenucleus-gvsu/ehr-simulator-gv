-- Multi-phase case content: Orders, Labs, MAR vary per phase.
-- cases.phase_count controls visible phases; orphan rows (phase > phase_count) are soft-hidden.
-- case_sessions.current_phase is for faculty sim advancement (wired in a follow-up).

ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS phase_count integer NOT NULL DEFAULT 1;

ALTER TABLE public.cases
  DROP CONSTRAINT IF EXISTS cases_phase_count_check;

ALTER TABLE public.cases
  ADD CONSTRAINT cases_phase_count_check
  CHECK (phase_count >= 1 AND phase_count <= 10);

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS phase integer NOT NULL DEFAULT 1;

ALTER TABLE public.lab_results
  ADD COLUMN IF NOT EXISTS phase integer NOT NULL DEFAULT 1;

ALTER TABLE public.medication_orders
  ADD COLUMN IF NOT EXISTS phase integer NOT NULL DEFAULT 1;

ALTER TABLE public.medication_administrations
  ADD COLUMN IF NOT EXISTS phase integer NOT NULL DEFAULT 1;

ALTER TABLE public.case_sessions
  ADD COLUMN IF NOT EXISTS current_phase integer NOT NULL DEFAULT 1;

ALTER TABLE public.case_sessions
  DROP CONSTRAINT IF EXISTS case_sessions_current_phase_check;

ALTER TABLE public.case_sessions
  ADD CONSTRAINT case_sessions_current_phase_check
  CHECK (current_phase >= 1);

-- lab_results: unique per (case, phase, time_offset)
ALTER TABLE public.lab_results
  DROP CONSTRAINT IF EXISTS lab_results_case_id_time_offset_key;

ALTER TABLE public.lab_results
  ADD CONSTRAINT lab_results_case_id_phase_time_offset_key
  UNIQUE (case_id, phase, time_offset);

CREATE INDEX IF NOT EXISTS idx_orders_case_phase ON public.orders (case_id, phase);
CREATE INDEX IF NOT EXISTS idx_lab_results_case_phase ON public.lab_results (case_id, phase);
CREATE INDEX IF NOT EXISTS idx_medication_orders_case_phase ON public.medication_orders (case_id, phase);
CREATE INDEX IF NOT EXISTS idx_medication_administrations_case_phase ON public.medication_administrations (case_id, phase);
