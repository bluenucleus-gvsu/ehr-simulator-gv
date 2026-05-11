ALTER TABLE IF EXISTS public.cases
ADD COLUMN emergency_contact_name text,
ADD COLUMN emergency_contact_relationship text;
