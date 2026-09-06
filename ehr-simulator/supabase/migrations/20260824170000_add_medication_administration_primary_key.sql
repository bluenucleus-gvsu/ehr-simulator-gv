BEGIN;

ALTER TABLE public.medication_administrations
  ADD COLUMN id UUID;

UPDATE public.medication_administrations
SET id = gen_random_uuid()
WHERE id IS NULL;

ALTER TABLE public.medication_administrations
  ALTER COLUMN id SET DEFAULT gen_random_uuid(),
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE public.medication_administrations
  ADD CONSTRAINT medication_administrations_pkey PRIMARY KEY (id);

COMMIT;
