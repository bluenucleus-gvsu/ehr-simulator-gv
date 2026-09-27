CREATE INDEX IF NOT EXISTS idx_case_sessions_group_status
  ON public.case_sessions (group_id, status);

CREATE INDEX IF NOT EXISTS idx_editable_clinical_documents_case_session
  ON public.editable_clinical_documents (case_id, case_session_id);

CREATE INDEX IF NOT EXISTS idx_group_members_student_active
  ON public.group_members (student_id, active);

CREATE INDEX IF NOT EXISTS idx_group_members_group_student
  ON public.group_members (group_id, student_id);

CREATE INDEX IF NOT EXISTS idx_documentation_results_case_time
  ON public.documentation_results (case_id, time_offset, created_at);

CREATE INDEX IF NOT EXISTS idx_imaging_reports_case_created
  ON public.imaging_reports (case_id, created_at);

CREATE INDEX IF NOT EXISTS idx_microbiology_reports_case_created
  ON public.microbiology_reports (case_id, created_at);

CREATE INDEX IF NOT EXISTS idx_student_med_admin_case_session
  ON public.student_medication_administrations (case_id, case_session_id);

CREATE INDEX IF NOT EXISTS idx_editable_documentation_case_session
  ON public.editable_documentation_results (case_id, case_session_id);