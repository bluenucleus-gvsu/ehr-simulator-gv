-- Root cause fix: public.users.full_name and email are NULL for all users because
-- the link_new_user_profile trigger only inserted id + role.
--
-- This migration:
--   1. Fixes the trigger to sync full_name + email from auth.users on signup
--   2. Backfills all existing users from auth.users
--   3. Rebuilds get_user_courses with SECURITY DEFINER so it can read auth.users
--      and use it as the authoritative name source for team members

-- 1. Fix trigger for new signups
CREATE OR REPLACE FUNCTION public.link_new_user_profile()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, role, full_name, email)
  VALUES (
    new.id,
    'student',
    COALESCE(
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name'
    ),
    new.email
  )
  ON CONFLICT (id) DO UPDATE
    SET full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        email     = COALESCE(EXCLUDED.email,     public.users.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Backfill existing users whose full_name / email are still NULL
UPDATE public.users u
SET
  full_name = COALESCE(
    u.full_name,
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name'
  ),
  email = COALESCE(u.email, au.email)
FROM auth.users au
WHERE u.id = au.id
  AND (u.full_name IS NULL OR u.email IS NULL);

-- 3. Rebuild get_user_courses with SECURITY DEFINER so it can join auth.users
--    and reliably resolve display names for team members
DROP FUNCTION IF EXISTS public.get_user_courses(p_user_id uuid);

CREATE FUNCTION public.get_user_courses(p_user_id uuid)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
AS $$
  WITH student_sections AS (
    SELECT
      gm.group_id,
      g.section_id,
      s.course_id,
      c.name  AS course_name,
      c.code  AS course_code,
      gm.active AS member_active
    FROM public.group_members gm
    JOIN public.groups   g ON g.id = gm.group_id
    JOIN public.sections s ON s.id = g.section_id
    JOIN public.courses  c ON c.id = s.course_id
    WHERE gm.student_id = p_user_id
  ),
  active_course_ids AS (
    SELECT DISTINCT course_id FROM student_sections WHERE member_active = true
  ),
  courses_distinct AS (
    SELECT DISTINCT
      ss.course_id,
      ss.course_name,
      ss.course_code,
      (ss.course_id IN (SELECT course_id FROM active_course_ids)) AS is_active
    FROM student_sections ss
  ),
  assigned_per_course AS (
    SELECT
      ss.course_id,
      jsonb_agg(DISTINCT jsonb_build_object(
        'id',           sa.id,
        'name',         cd.name,
        'sim_time',     sa.sim_time,
        'presim_time',  sa.presim_time,
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
              au2.raw_user_meta_data->>'name'      IS NOT NULL OR
              u2.full_name IS NOT NULL OR
              au2.email    IS NOT NULL OR
              u2.email     IS NOT NULL
            ),
            '[]'::jsonb
          )
          FROM public.group_members gm2
          JOIN public.users u2  ON u2.id  = gm2.student_id
          JOIN auth.users   au2 ON au2.id = gm2.student_id
          WHERE gm2.group_id    = ss.group_id
            AND gm2.student_id != p_user_id
        )
      )) AS cases
    FROM student_sections ss
    JOIN public.section_assignments sa ON sa.section_id = ss.section_id
    JOIN public.cases           cd ON cd.id          = sa.case_id
    WHERE ss.member_active = true
    GROUP BY ss.course_id
  ),
  completed_sessions AS (
    SELECT DISTINCT
      ss.course_id,
      cs.id           AS session_id,
      cd.name         AS case_name,
      cs.completed_at,
      cs.feedback,
      cs.group_id
    FROM student_sections ss
    JOIN public.case_sessions cs ON cs.group_id = ss.group_id
    JOIN public.cases     cd ON cd.id        = cs.case_id
    WHERE cs.status = 'completed'
  ),
  team_members_per_session AS (
    -- Join auth.users as authoritative source; fall back chain:
    -- auth metadata full_name → auth metadata name → public.users.full_name → email
    SELECT
      csess.session_id,
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
          au.raw_user_meta_data->>'name'      IS NOT NULL OR
          u.full_name IS NOT NULL OR
          au.email    IS NOT NULL OR
          u.email     IS NOT NULL
        ),
        '[]'::jsonb
      ) AS members
    FROM completed_sessions csess
    JOIN public.group_members gm2 ON gm2.group_id = csess.group_id
    JOIN public.users         u   ON u.id          = gm2.student_id
    JOIN auth.users           au  ON au.id          = gm2.student_id
    WHERE gm2.student_id != p_user_id
    GROUP BY csess.session_id
  ),
  completed_per_course AS (
    SELECT
      csess.course_id,
      jsonb_agg(jsonb_build_object(
        'id',           csess.session_id,
        'name',         csess.case_name,
        'completed_at', csess.completed_at,
        'feedback',     csess.feedback,
        'teamMembers',  COALESCE(tm.members, '[]'::jsonb)
      )) AS cases
    FROM completed_sessions csess
    LEFT JOIN team_members_per_session tm ON tm.session_id = csess.session_id
    GROUP BY csess.course_id
  ),
  course_with_data AS (
    SELECT
      cd.course_id,
      cd.course_name,
      cd.course_code,
      cd.is_active,
      COALESCE(ac.cases, '[]'::jsonb) AS assigned,
      COALESCE(cp.cases, '[]'::jsonb) AS completed
    FROM courses_distinct cd
    LEFT JOIN assigned_per_course  ac ON ac.course_id = cd.course_id
    LEFT JOIN completed_per_course cp ON cp.course_id = cd.course_id
  )
  SELECT jsonb_build_object(
    'activeCourses',
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id',        cwd.course_id,
        'name',      cwd.course_name,
        'code',      cwd.course_code,
        'assigned',  cwd.assigned,
        'completed', cwd.completed
      ))
      FROM course_with_data cwd
      WHERE cwd.is_active = true),
      '[]'::jsonb
    ),
    'inactiveCourses',
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id',        cwd.course_id,
        'name',      cwd.course_name,
        'code',      cwd.course_code,
        'assigned',  cwd.assigned,
        'completed', cwd.completed
      ))
      FROM course_with_data cwd
      WHERE cwd.is_active = false),
      '[]'::jsonb
    )
  );
$$ LANGUAGE sql STABLE;
