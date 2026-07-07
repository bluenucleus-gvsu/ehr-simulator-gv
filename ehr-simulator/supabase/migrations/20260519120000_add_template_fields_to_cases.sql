-- is_template: marks a case as a reusable starting point for new cases.
-- created_by: references the admin who created the case (used in template browser).
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS is_template BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS cases_is_template_idx ON cases (is_template) WHERE is_template = true;
