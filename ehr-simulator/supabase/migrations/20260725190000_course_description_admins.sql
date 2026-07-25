ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS description TEXT;

CREATE TABLE IF NOT EXISTS public.course_administrators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  admin_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (course_id, admin_id)
);

CREATE INDEX IF NOT EXISTS course_administrators_course_id_idx
  ON public.course_administrators (course_id);

CREATE INDEX IF NOT EXISTS course_administrators_admin_id_idx
  ON public.course_administrators (admin_id);
