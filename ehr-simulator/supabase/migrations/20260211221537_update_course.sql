ALTER TABLE public.courses DROP COLUMN IF EXISTS start_date;
ALTER TABLE public.courses DROP COLUMN IF EXISTS end_date;
ALTER TABLE public.courses DROP COLUMN IF EXISTS semester;

ALTER TABLE public.sections ADD COLUMN IF NOT EXISTS start_date TIMESTAMPTZ;
ALTER TABLE public.sections ADD COLUMN IF NOT EXISTS end_date TIMESTAMPTZ;
ALTER TABLE public.sections ADD COLUMN IF NOT EXISTS semester TEXT;
