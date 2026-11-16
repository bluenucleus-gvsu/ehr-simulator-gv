ALTER TABLE public.case_images
  ADD COLUMN phase integer NOT NULL DEFAULT 1,
  ADD COLUMN is_in_presim boolean NOT NULL DEFAULT true;

CREATE TABLE public.case_image_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES public.case_sessions(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.case_images(id) ON DELETE CASCADE,
  released_at timestamptz NOT NULL DEFAULT now(),
  released_by uuid REFERENCES auth.users(id),
  UNIQUE (session_id, item_id)
);

CREATE INDEX idx_case_image_releases_item
  ON public.case_image_releases (item_id);

ALTER TABLE public.case_image_releases REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_rel pr
    JOIN pg_publication p ON p.oid = pr.prpubid
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.pubname = 'supabase_realtime'
      AND n.nspname = 'public'
      AND c.relname = 'case_image_releases'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.case_image_releases;
  END IF;
END
$$;

CREATE OR REPLACE FUNCTION public.case_builder_replace_media(p_case_id uuid, p_rows jsonb)
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  PERFORM 1 FROM public.cases WHERE id = p_case_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Case % was not found', p_case_id; END IF;
  DELETE FROM public.case_images WHERE case_id = p_case_id;
  INSERT INTO public.case_images(case_id, preview_url, file_path, phase, is_in_presim)
  SELECT p_case_id,
         item->>'preview_url',
         item->>'file_path',
         COALESCE((item->>'phase')::integer, 1),
         COALESCE((item->>'is_in_presim')::boolean, true)
  FROM jsonb_array_elements(COALESCE(p_rows, '[]'::jsonb)) item;
  UPDATE public.cases SET updated_at = now() WHERE id = p_case_id;
END;
$$;
