ALTER TYPE clinical_doc_category_type ADD VALUE 'Student';

ALTER TABLE IF EXISTS public.section_assignments
  DROP CONSTRAINT IF EXISTS section_assignments_case_id_fkey,
  ADD CONSTRAINT section_assignments_case_id_fkey 
  FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;

ALTER TABLE IF EXISTS public.case_sessions
  DROP CONSTRAINT IF EXISTS case_sessions_case_id_fkey,
  ADD CONSTRAINT case_sessions_case_id_fkey 
  FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE SET NULL;

ALTER TABLE IF EXISTS public.course_cases
  DROP CONSTRAINT IF EXISTS course_cases_case_id_fkey,
  ADD CONSTRAINT course_cases_case_id_fkey 
  FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE CASCADE;