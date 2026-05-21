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
      c.name AS course_name,
      c.code AS course_code,
      gm.active AS member_active
    FROM public.group_members gm
    JOIN public.groups g ON g.id = gm.group_id
    JOIN public.sections s ON s.id = g.section_id
    JOIN public.courses c ON c.id = s.course_id
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
          WHERE gm2.group_id = ss.group_id
            AND gm2.student_id != p_user_id
        )
      )) AS cases
    FROM student_sections ss
    JOIN public.section_assignments sa ON sa.section_id = ss.section_id
    JOIN public.cases cd ON cd.id = sa.case_id
    LEFT JOIN public.case_sessions cs
      ON cs.section_assignment_id = sa.id
     AND cs.group_id = ss.group_id
     AND cs.status NOT IN ('completed', 'archived')
    WHERE ss.member_active = true
      AND NOT EXISTS (
        SELECT 1
        FROM public.case_sessions cs_terminal
        WHERE cs_terminal.section_assignment_id = sa.id
          AND cs_terminal.group_id = ss.group_id
          AND cs_terminal.status IN ('completed', 'archived')
      )
    GROUP BY ss.course_id
  ),
  completed_sessions AS (
    SELECT DISTINCT
      ss.course_id,
      cs.id AS session_id,
      cd.name AS case_name,
      cs.completed_at,
      cs.feedback,
      cs.group_id
    FROM student_sections ss
    JOIN public.case_sessions cs ON cs.group_id = ss.group_id
    JOIN public.cases cd ON cd.id = cs.case_id
    WHERE cs.status = 'completed'
  ),
  expired_sessions AS (
    SELECT DISTINCT
      ss.course_id,
      cs.id AS session_id,
      cd.name AS case_name,
      sa.sim_time AS expired_at,
      cs.feedback,
      cs.group_id
    FROM student_sections ss
    JOIN public.case_sessions cs ON cs.group_id = ss.group_id
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
