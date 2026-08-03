ALTER TABLE public.groups
  ADD COLUMN IF NOT EXISTS section_assignment_id UUID REFERENCES public.section_assignments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS groups_section_assignment_id_idx
  ON public.groups (section_assignment_id);

CREATE TABLE IF NOT EXISTS public.section_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (section_id, student_id)
);

CREATE INDEX IF NOT EXISTS section_enrollments_section_id_idx
  ON public.section_enrollments (section_id);

INSERT INTO public.section_enrollments (section_id, student_id, active)
SELECT DISTINCT g.section_id, gm.student_id, COALESCE(gm.active, true)
FROM public.groups g
JOIN public.group_members gm ON gm.group_id = g.id
WHERE g.section_id IS NOT NULL
  AND gm.student_id IS NOT NULL
ON CONFLICT (section_id, student_id) DO NOTHING;

DO $$
DECLARE
  assignment RECORD;
  template RECORD;
  new_group_id UUID;
  member RECORD;
BEGIN
  FOR assignment IN
    SELECT sa.id AS assignment_id, sa.section_id
    FROM public.section_assignments sa
    ORDER BY sa.created_at NULLS LAST, sa.id
  LOOP
    FOR template IN
      SELECT g.id, g.name, g.section_id
      FROM public.groups g
      WHERE g.section_id = assignment.section_id
        AND g.section_assignment_id IS NULL
    LOOP
      INSERT INTO public.groups (name, section_id, section_assignment_id, active)
      VALUES (template.name, template.section_id, assignment.assignment_id, true)
      RETURNING id INTO new_group_id;

      FOR member IN
        SELECT student_id, active
        FROM public.group_members
        WHERE group_id = template.id
          AND student_id IS NOT NULL
      LOOP
        INSERT INTO public.group_members (group_id, student_id, active)
        VALUES (new_group_id, member.student_id, COALESCE(member.active, true));
      END LOOP;

      UPDATE public.case_sessions
      SET group_id = new_group_id
      WHERE section_assignment_id = assignment.assignment_id
        AND group_id = template.id;
    END LOOP;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.create_case_sessions_for_section_assignment()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.case_sessions (
    status,
    group_id,
    case_id,
    section_assignment_id
  )
  SELECT
    'assigned',
    g.id,
    NEW.case_id,
    NEW.id
  FROM public.groups g
  WHERE g.section_assignment_id = NEW.id
    AND COALESCE(g.active, true)
  ON CONFLICT (section_assignment_id, group_id) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_case_sessions_for_new_group()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  assignment_case_id UUID;
BEGIN
  IF NEW.section_assignment_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF NOT COALESCE(NEW.active, true) THEN
    RETURN NEW;
  END IF;

  SELECT sa.case_id INTO assignment_case_id
  FROM public.section_assignments sa
  WHERE sa.id = NEW.section_assignment_id;

  IF assignment_case_id IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.case_sessions (
    status,
    group_id,
    case_id,
    section_assignment_id
  )
  VALUES (
    'assigned',
    NEW.id,
    assignment_case_id,
    NEW.section_assignment_id
  )
  ON CONFLICT (section_assignment_id, group_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.get_user_courses(p_user_id uuid);

CREATE FUNCTION public.get_user_courses(p_user_id uuid)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
AS $$
  WITH student_groups AS (
    SELECT
      gm.group_id,
      g.section_id,
      g.section_assignment_id,
      s.course_id,
      c.name AS course_name,
      c.code AS course_code,
      gm.active AS member_active
    FROM public.group_members gm
    JOIN public.groups g ON g.id = gm.group_id
    JOIN public.sections s ON s.id = g.section_id
    JOIN public.courses c ON c.id = s.course_id
    WHERE gm.student_id = p_user_id
      AND g.section_assignment_id IS NOT NULL
      AND COALESCE(g.active, true)
  ),
  enrolled_courses AS (
    SELECT DISTINCT
      s.course_id,
      c.name AS course_name,
      c.code AS course_code,
      se.active AS enrollment_active
    FROM public.section_enrollments se
    JOIN public.sections s ON s.id = se.section_id
    JOIN public.courses c ON c.id = s.course_id
    WHERE se.student_id = p_user_id
  ),
  active_course_ids AS (
    SELECT DISTINCT course_id FROM student_groups WHERE member_active = true
    UNION
    SELECT DISTINCT course_id FROM enrolled_courses WHERE enrollment_active = true
  ),
  courses_distinct AS (
    SELECT DISTINCT
      x.course_id,
      x.course_name,
      x.course_code,
      (x.course_id IN (SELECT course_id FROM active_course_ids)) AS is_active
    FROM (
      SELECT course_id, course_name, course_code FROM student_groups
      UNION
      SELECT course_id, course_name, course_code FROM enrolled_courses
    ) x
  ),
  assigned_per_course AS (
    SELECT
      sg.course_id,
      jsonb_agg(DISTINCT jsonb_build_object(
        'id', sa.id,
        'case_id', sa.case_id,
        'session_id', cs.id,
        'session_status', cs.status,
        'name', cd.name,
        'sim_time', sa.sim_time,
        'presim_time', sa.presim_time,
        'groupMembers', (
          SELECT COALESCE(
            jsonb_agg(
              COALESCE(
                au2.raw_user_meta_data->>'full_name',
                au2.raw_user_meta_data->>'name',
                u2.full_name,
                au2.email,
                u2.email
              )
            ) FILTER (WHERE
              au2.raw_user_meta_data->>'full_name' IS NOT NULL OR
              au2.raw_user_meta_data->>'name' IS NOT NULL OR
              u2.full_name IS NOT NULL OR
              au2.email IS NOT NULL OR
              u2.email IS NOT NULL
            ),
            '[]'::jsonb
          )
          FROM public.group_members gm2
          JOIN public.users u2 ON u2.id = gm2.student_id
          JOIN auth.users au2 ON au2.id = gm2.student_id
          WHERE gm2.group_id = sg.group_id
            AND gm2.student_id != p_user_id
        )
      )) AS cases
    FROM student_groups sg
    JOIN public.section_assignments sa ON sa.id = sg.section_assignment_id
    JOIN public.cases cd ON cd.id = sa.case_id
    LEFT JOIN public.case_sessions cs
      ON cs.section_assignment_id = sa.id
     AND cs.group_id = sg.group_id
     AND cs.status NOT IN ('completed', 'archived')
    WHERE sg.member_active = true
      AND NOT EXISTS (
        SELECT 1
        FROM public.case_sessions cs_terminal
        WHERE cs_terminal.section_assignment_id = sa.id
          AND cs_terminal.group_id = sg.group_id
          AND cs_terminal.status IN ('completed', 'archived')
      )
    GROUP BY sg.course_id
  ),
  completed_sessions AS (
    SELECT DISTINCT
      sg.course_id,
      cs.id AS session_id,
      cd.name AS case_name,
      cs.completed_at,
      cs.feedback,
      cs.group_id
    FROM student_groups sg
    JOIN public.case_sessions cs ON cs.group_id = sg.group_id
    JOIN public.cases cd ON cd.id = cs.case_id
    WHERE cs.status = 'completed'
  ),
  expired_sessions AS (
    SELECT DISTINCT
      sg.course_id,
      cs.id AS session_id,
      cd.name AS case_name,
      sa.sim_time AS expired_at,
      cs.feedback,
      cs.group_id
    FROM student_groups sg
    JOIN public.case_sessions cs ON cs.group_id = sg.group_id
    JOIN public.section_assignments sa ON sa.id = cs.section_assignment_id
    JOIN public.cases cd ON cd.id = cs.case_id
    WHERE cs.status = 'archived'
  ),
  team_members_per_session AS (
    SELECT
      session_union.session_id,
      COALESCE(
        jsonb_agg(
          COALESCE(
            au.raw_user_meta_data->>'full_name',
            au.raw_user_meta_data->>'name',
            u.full_name,
            au.email,
            u.email
          )
        ) FILTER (WHERE
          au.raw_user_meta_data->>'full_name' IS NOT NULL OR
          au.raw_user_meta_data->>'name' IS NOT NULL OR
          u.full_name IS NOT NULL OR
          au.email IS NOT NULL OR
          u.email IS NOT NULL
        ),
        '[]'::jsonb
      ) AS members
    FROM (
      SELECT session_id, group_id FROM completed_sessions
      UNION
      SELECT session_id, group_id FROM expired_sessions
    ) AS session_union
    JOIN public.group_members gm2 ON gm2.group_id = session_union.group_id
    JOIN public.users u ON u.id = gm2.student_id
    JOIN auth.users au ON au.id = gm2.student_id
    WHERE gm2.student_id != p_user_id
    GROUP BY session_union.session_id
  ),
  completed_per_course AS (
    SELECT
      csess.course_id,
      jsonb_agg(jsonb_build_object(
        'id', csess.session_id,
        'name', csess.case_name,
        'completed_at', csess.completed_at,
        'feedback', csess.feedback,
        'teamMembers', COALESCE(tm.members, '[]'::jsonb)
      )) AS cases
    FROM completed_sessions csess
    LEFT JOIN team_members_per_session tm ON tm.session_id = csess.session_id
    GROUP BY csess.course_id
  ),
  expired_per_course AS (
    SELECT
      esess.course_id,
      jsonb_agg(jsonb_build_object(
        'id', esess.session_id,
        'name', esess.case_name,
        'expired_at', esess.expired_at,
        'feedback', esess.feedback,
        'teamMembers', COALESCE(tm.members, '[]'::jsonb)
      )) AS cases
    FROM expired_sessions esess
    LEFT JOIN team_members_per_session tm ON tm.session_id = esess.session_id
    GROUP BY esess.course_id
  ),
  course_with_data AS (
    SELECT
      cd.course_id,
      cd.course_name,
      cd.course_code,
      cd.is_active,
      COALESCE(ac.cases, '[]'::jsonb) AS assigned,
      COALESCE(cp.cases, '[]'::jsonb) AS completed,
      COALESCE(ep.cases, '[]'::jsonb) AS expired
    FROM courses_distinct cd
    LEFT JOIN assigned_per_course ac ON ac.course_id = cd.course_id
    LEFT JOIN completed_per_course cp ON cp.course_id = cd.course_id
    LEFT JOIN expired_per_course ep ON ep.course_id = cd.course_id
  )
  SELECT jsonb_build_object(
    'activeCourses',
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id', cwd.course_id,
        'name', cwd.course_name,
        'code', cwd.course_code,
        'assigned', cwd.assigned,
        'completed', cwd.completed,
        'expired', cwd.expired
      ))
      FROM course_with_data cwd
      WHERE cwd.is_active = true),
      '[]'::jsonb
    ),
    'inactiveCourses',
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id', cwd.course_id,
        'name', cwd.course_name,
        'code', cwd.course_code,
        'assigned', cwd.assigned,
        'completed', cwd.completed,
        'expired', cwd.expired
      ))
      FROM course_with_data cwd
      WHERE cwd.is_active = false),
      '[]'::jsonb
    )
  );
$$ LANGUAGE sql STABLE;
