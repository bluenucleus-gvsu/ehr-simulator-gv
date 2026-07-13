-- URL of the uploaded case profile photo (case-photos bucket)
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS case_photo_url text;
