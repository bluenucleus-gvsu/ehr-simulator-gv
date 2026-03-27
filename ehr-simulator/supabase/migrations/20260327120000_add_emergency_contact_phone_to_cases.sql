-- Optional phone for emergency contact (shown in sim Overview → Contacts)
ALTER TABLE public.cases
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
