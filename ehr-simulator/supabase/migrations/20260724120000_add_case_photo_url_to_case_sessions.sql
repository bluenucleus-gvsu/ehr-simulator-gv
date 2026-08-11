-- Per-session override of cases.case_photo_url (case-profile-photos bucket).
-- Null means the session falls back to the case's default photo.
ALTER TABLE public.case_sessions
  ADD COLUMN IF NOT EXISTS case_photo_url text;
