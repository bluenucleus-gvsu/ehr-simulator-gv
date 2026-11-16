CREATE TABLE IF NOT EXISTS public.case_session_participants (
  case_session_id UUID NOT NULL REFERENCES public.case_sessions(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (case_session_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_csp_student
  ON public.case_session_participants (student_id);

GRANT SELECT ON public.case_session_participants TO authenticated;
GRANT ALL ON public.case_session_participants TO service_role;

-- Track participants of everytime a case_session is started to managed student's history
CREATE OR REPLACE FUNCTION public.snapshot_session_participants()
RETURNS trigger AS $$
BEGIN
  IF NEW.started_at IS NOT NULL AND OLD.started_at IS NULL AND NEW.group_id IS NOT NULL THEN
    INSERT INTO public.case_session_participants (case_session_id, student_id)
    SELECT NEW.id, gm.student_id
    FROM public.group_members gm
    WHERE gm.group_id = NEW.group_id
      AND gm.active = true
      AND gm.student_id IS NOT NULL
    ON CONFLICT (case_session_id, student_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_snapshot_session_participants ON public.case_sessions;
CREATE TRIGGER trg_snapshot_session_participants
AFTER UPDATE OF started_at ON public.case_sessions
FOR EACH ROW EXECUTE FUNCTION public.snapshot_session_participants();

-- Backfill case_session participants for sessions that have already been started/completed
INSERT INTO public.case_session_participants (case_session_id, student_id)
SELECT cs.id, gm.student_id
FROM public.case_sessions cs
JOIN public.group_members gm ON gm.group_id = cs.group_id AND gm.active = true
WHERE cs.group_id IS NOT NULL
  AND (cs.started_at IS NOT NULL OR cs.status IN ('completed', 'archived'))
ON CONFLICT (case_session_id, student_id) DO NOTHING;

-- Enable soft-delete of sections and groups so student history can be maintained
-- (The only truly destructuve delete action regarding courses/sections/groups is 
-- the full deletion of a course, which cascades to all FKs)
ALTER TABLE public.sections ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.groups   ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.group_members ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;

-- Enforce student membership in groups
DELETE FROM public.group_members WHERE student_id IS NULL;
ALTER TABLE public.group_members ALTER COLUMN student_id SET NOT NULL;

-- If a group is deleted via overall course deletion, all case_sessions assigned to the
-- group must also be delete via cascade
ALTER TABLE public.case_sessions DROP CONSTRAINT IF EXISTS case_sessions_group_id_fkey;
ALTER TABLE public.case_sessions
  ADD CONSTRAINT case_sessions_group_id_fkey
  FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;

-- Deduplicate student-group membership prior to enforcing unique constraint
DELETE FROM public.group_members a
USING public.group_members b
WHERE a.group_id = b.group_id
  AND a.student_id = b.student_id
  AND (b.active, b.created_at, b.id) > (a.active, a.created_at, a.id);

CREATE UNIQUE INDEX IF NOT EXISTS group_members_group_student_unique
  ON public.group_members (group_id, student_id);

-- Update case_session creation triggers so that they do not create new case_sessions
-- for inactive groups
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
    WHERE g.section_id = NEW.section_id
      AND g.active = true
    ON CONFLICT (section_assignment_id, group_id) DO NOTHING;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.create_case_sessions_for_new_group()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM public.sections s
      WHERE s.id = NEW.section_id AND s.active = true
    ) THEN
      RETURN NEW;
    END IF;

    INSERT INTO public.case_sessions (
        status,
        group_id,
        case_id,
        section_assignment_id
    )
    SELECT
        'assigned',
        NEW.id,
        sa.case_id,
        sa.id
    FROM public.section_assignments sa
    WHERE sa.section_id = NEW.section_id
    ON CONFLICT (section_assignment_id, group_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Drop unused tables and cols
ALTER TABLE public.case_sessions DROP COLUMN IF EXISTS student_ids;
DROP TABLE IF EXISTS public.faculty_section;


-- Revert course/section/group schema. Move attributes from section
-- back to course.  
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS semester TEXT;

-- Backfill the new course-level values from their sections
UPDATE public.courses c
SET
  start_date = sub.start_date,
  end_date = sub.end_date,
  semester = sub.semester
FROM (
  SELECT
    course_id,
    MIN(start_date)::date AS start_date,
    MAX(end_date)::date   AS end_date,
    MIN(semester)         AS semester
  FROM public.sections
  WHERE course_id IS NOT NULL
  GROUP BY course_id
) sub
WHERE c.id = sub.course_id
  AND c.start_date IS NULL
  AND c.end_date IS NULL
  AND c.semester IS NULL;

-- Ensure all courses have a semester value. There shouldn't be any but the below default
-- value can be updated in the new editor
UPDATE public.courses SET semester = 'No Semester' WHERE semester IS NULL;
ALTER TABLE public.courses ALTER COLUMN semester SET NOT NULL;

ALTER TABLE public.sections DROP COLUMN IF EXISTS meeting_time;
ALTER TABLE public.sections DROP COLUMN IF EXISTS start_date;
ALTER TABLE public.sections DROP COLUMN IF EXISTS end_date;
ALTER TABLE public.sections DROP COLUMN IF EXISTS semester;

-- Recreate get_user_courses to match new course/section/group schema
DROP FUNCTION IF EXISTS public.get_user_courses(p_user_id uuid);

CREATE FUNCTION public.get_user_courses(p_user_id uuid)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
AS $$
  WITH active_courses AS (
    SELECT DISTINCT
      s.course_id,
      c.name AS course_name,
      c.code AS course_code
    FROM public.group_members gm
    JOIN public.groups g   ON g.id = gm.group_id AND g.active = true
    JOIN public.sections s ON s.id = g.section_id AND s.active = true
    JOIN public.courses c  ON c.id = s.course_id AND c.active = true
    WHERE gm.student_id = p_user_id AND gm.active = true
  ),
  past_courses AS (
    SELECT DISTINCT
      s.course_id,
      c.name AS course_name,
      c.code AS course_code
    FROM public.case_session_participants csp
    JOIN public.case_sessions cs       ON cs.id = csp.case_session_id
    JOIN public.section_assignments sa ON sa.id = cs.section_assignment_id
    JOIN public.sections s             ON s.id = sa.section_id
    JOIN public.courses c              ON c.id = s.course_id
    WHERE csp.student_id = p_user_id
      AND cs.status IN ('completed', 'archived')
  ),
  past_courses_open AS (
    SELECT DISTINCT
      s.course_id,
      c.name AS course_name,
      c.code AS course_code
    FROM public.case_session_participants csp
    JOIN public.case_sessions cs       ON cs.id = csp.case_session_id
    JOIN public.section_assignments sa ON sa.id = cs.section_assignment_id
    JOIN public.sections s             ON s.id = sa.section_id
    JOIN public.courses c              ON c.id = s.course_id
    WHERE csp.student_id = p_user_id
      AND cs.status NOT IN ('completed', 'archived')
  ),
  courses_distinct AS (
    SELECT
      u.course_id,
      u.course_name,
      u.course_code,
      (u.course_id IN (SELECT course_id FROM active_courses)) AS is_active
    FROM (
      SELECT course_id, course_name, course_code FROM active_courses
      UNION
      SELECT course_id, course_name, course_code FROM past_courses
      UNION
      SELECT course_id, course_name, course_code FROM past_courses_open
    ) u
  ),
  assigned_sessions AS (
    SELECT DISTINCT
      s.course_id,
      sa.id          AS assignment_id,
      sa.case_id     AS case_id,
      cs.id          AS session_id,
      cs.status      AS session_status,
      cd.name        AS name,
      sa.sim_time    AS sim_time,
      sa.presim_time AS presim_time,
      gm.group_id    AS group_id,
      cs.started_at  AS started_at,
      (g.section_id = sa.section_id) AS can_join
    FROM public.group_members gm
    JOIN public.groups g   ON g.id = gm.group_id AND g.active = true
    JOIN public.case_sessions cs
      ON cs.group_id = g.id
     AND cs.status NOT IN ('completed', 'archived')
    JOIN public.section_assignments sa ON sa.id = cs.section_assignment_id
    JOIN public.sections s ON s.id = sa.section_id
    JOIN public.cases cd ON cd.id = sa.case_id
    WHERE gm.student_id = p_user_id
      AND gm.active = true
      AND NOT EXISTS (
        SELECT 1
      -- archived rows are terminal history and should still render as completed.
        FROM public.case_session_participants csp
        JOIN public.case_sessions csx ON csx.id = csp.case_session_id
        WHERE csp.student_id = p_user_id
          AND csx.section_assignment_id = sa.id
          AND csx.status IN ('completed', 'archived')
      )
      AND NOT EXISTS (
        SELECT 1
        FROM public.case_sessions csx
        WHERE csx.section_assignment_id = sa.id
          AND csx.group_id = gm.group_id
          AND csx.status IN ('completed', 'archived')
      )
    UNION ALL
    SELECT DISTINCT
      s.course_id,
      sa.id          AS assignment_id,
      sa.case_id     AS case_id,
      cs.id          AS session_id,
      cs.status      AS session_status,
      cd.name        AS name,
      sa.sim_time    AS sim_time,
      sa.presim_time AS presim_time,
      cs.group_id    AS group_id,
      cs.started_at  AS started_at,
      false          AS can_join
    FROM public.case_session_participants csp
    JOIN public.case_sessions cs       ON cs.id = csp.case_session_id
    JOIN public.section_assignments sa ON sa.id = cs.section_assignment_id
    JOIN public.sections s             ON s.id = sa.section_id
    JOIN public.cases cd               ON cd.id = cs.case_id
    WHERE csp.student_id = p_user_id
      AND cs.started_at IS NOT NULL
      AND cs.status NOT IN ('completed', 'archived')
      AND NOT EXISTS (
        SELECT 1
        FROM public.group_members gm
        WHERE gm.group_id = cs.group_id
          AND gm.student_id = p_user_id
          AND gm.active = true
      )
  ),
  assigned_per_course AS (
    SELECT
      a.course_id,
      jsonb_agg(DISTINCT jsonb_build_object(
        'id', a.assignment_id,
        'case_id', a.case_id,
        'session_id', a.session_id,
        'session_status', a.session_status,
        'name', a.name,
        'sim_time', a.sim_time,
        'presim_time', a.presim_time,
        'started_at', a.started_at,
        'canJoin', a.can_join,
        'groupMembers', CASE WHEN a.started_at IS NOT NULL THEN
          (
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
            FROM public.case_session_participants csp2
            JOIN public.users u2    ON u2.id = csp2.student_id
            JOIN auth.users au2     ON au2.id = csp2.student_id
            WHERE csp2.case_session_id = a.session_id
          )
        ELSE
          (
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
            WHERE gm2.group_id = a.group_id
              AND gm2.active = true
          )
        END
      )) AS cases
    FROM assigned_sessions a
    GROUP BY a.course_id
  ),
  completed_sessions AS (
    SELECT DISTINCT
      s.course_id,
      cs.id          AS session_id,
      cd.name        AS case_name,
      cs.completed_at,
      cs.feedback
    FROM public.case_session_participants csp
    JOIN public.case_sessions cs       ON cs.id = csp.case_session_id
    JOIN public.section_assignments sa ON sa.id = cs.section_assignment_id
    JOIN public.sections s             ON s.id = sa.section_id
    JOIN public.cases cd               ON cd.id = cs.case_id
    WHERE csp.student_id = p_user_id
      AND cs.status IN ('completed', 'archived')
  ),
  team_members_per_session AS (
    SELECT
      csp.case_session_id AS session_id,
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
    FROM public.case_session_participants csp
    JOIN public.users u    ON u.id = csp.student_id
    JOIN auth.users au     ON au.id = csp.student_id
    GROUP BY csp.case_session_id
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
  course_with_data AS (
    SELECT
      cd.course_id,
      cd.course_name,
      cd.course_code,
      cd.is_active,
      COALESCE(ac.cases, '[]'::jsonb) AS assigned,
      COALESCE(cp.cases, '[]'::jsonb) AS completed
    FROM courses_distinct cd
    LEFT JOIN assigned_per_course ac ON ac.course_id = cd.course_id
    LEFT JOIN completed_per_course cp ON cp.course_id = cd.course_id
  )
  SELECT jsonb_build_object(
    'activeCourses',
    COALESCE(
      (SELECT jsonb_agg(jsonb_build_object(
        'id', cwd.course_id,
        'name', cwd.course_name,
        'code', cwd.course_code,
        'assigned', cwd.assigned,
        'completed', cwd.completed
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
        'completed', cwd.completed
      ))
      FROM course_with_data cwd
      WHERE cwd.is_active = false),
      '[]'::jsonb
    )
  );
$$ LANGUAGE sql STABLE;

-- New RPC to atomically save course data
DROP FUNCTION IF EXISTS public.save_course_edits(p_course_id uuid, p_payload jsonb);

CREATE OR REPLACE FUNCTION public.save_course_edits(
  p_diff jsonb
)
RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  v_course_id uuid;
BEGIN
  -- 1. Course upsert
  IF (p_diff->'course'->>'id') IS NULL THEN
    INSERT INTO public.courses (name, code, semester, start_date, end_date)
    VALUES (
      p_diff->'course'->>'name',
      p_diff->'course'->>'code',
      NULLIF(btrim(p_diff->'course'->>'semester'), ''),
      (p_diff->'course'->>'start_date')::date,
      (p_diff->'course'->>'end_date')::date
    )
    RETURNING id INTO v_course_id;
  ELSE
    v_course_id := (p_diff->'course'->>'id')::uuid;

    UPDATE public.courses SET
      name       = p_diff->'course'->>'name',
      code       = p_diff->'course'->>'code',
      semester   = NULLIF(btrim(p_diff->'course'->>'semester'), ''),
      start_date = (p_diff->'course'->>'start_date')::date,
      end_date   = (p_diff->'course'->>'end_date')::date,
      updated_at = now()
    WHERE id = v_course_id;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Course % not found', v_course_id;
    END IF;
  END IF;

  -- 2. Deactivate removed sections
  UPDATE public.sections s
  SET active = false, updated_at = now()
  WHERE s.active
    AND s.course_id = v_course_id
    AND s.id IN (
      SELECT value::uuid
      FROM jsonb_array_elements_text(COALESCE(p_diff->'sections_to_deactivate', '[]'::jsonb)) AS value
    );

  -- 3. Deactivate removed groups and end student's memberships 
  WITH dead_groups AS (
    SELECT value::uuid AS id
    FROM jsonb_array_elements_text(COALESCE(p_diff->'groups_to_deactivate', '[]'::jsonb)) AS value
  ),
  ended_members AS (
    UPDATE public.group_members gm
    SET active = false, ended_at = now()
    FROM dead_groups dg
    WHERE gm.group_id = dg.id
      AND gm.active
  )
  UPDATE public.groups g
  SET active = false, updated_at = now()
  FROM dead_groups dg
  WHERE g.id = dg.id
    AND g.active;

  -- 4. Upsert existing sections
  UPDATE public.sections sec
  SET name = payload.name, updated_at = now()
  FROM (
    SELECT (j->>'id')::uuid AS id, btrim(j->>'name') AS name
    FROM jsonb_array_elements(COALESCE(p_diff->'sections_upsert', '[]'::jsonb)) AS j
  ) AS payload
  WHERE sec.id = payload.id
    AND sec.course_id = v_course_id;

  -- Inserts insert new sections so that groups under these
  -- sections will pick up case sessions via the create_case_sessions trigger.
  INSERT INTO public.sections (id, course_id, name)
  SELECT (j->>'id')::uuid, v_course_id, btrim(j->>'name')
  FROM jsonb_array_elements(COALESCE(p_diff->'sections_upsert', '[]'::jsonb)) AS j
  WHERE NOT EXISTS (
    SELECT 1 FROM public.sections sec WHERE sec.id = (j->>'id')::uuid
  );

  -- Abort on invalid section
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(COALESCE(p_diff->'sections_upsert', '[]'::jsonb)) AS j
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.sections sec
      WHERE sec.id = (j->>'id')::uuid
        AND sec.course_id = v_course_id
        AND sec.active
    )
  ) THEN
    RAISE EXCEPTION 'Section payload references a section that does not exist in this course';
  END IF;

  -- 5. Upsert existing groups
  UPDATE public.groups g
  SET name = payload.name, section_id = payload.section_id, updated_at = now()
  FROM (
    SELECT
      (j->>'id')::uuid         AS id,
      btrim(j->>'name')        AS name,
      (j->>'section_id')::uuid AS section_id
    FROM jsonb_array_elements(COALESCE(p_diff->'groups_upsert', '[]'::jsonb)) AS j
  ) AS payload
  WHERE g.id = payload.id
    AND EXISTS (
      SELECT 1
      FROM public.sections sec
      WHERE sec.id = g.section_id
        AND sec.course_id = v_course_id
    );

  -- Inserts new groups so that 'create_case_sessions_for_new_group' trigger creates
  -- sessions for this section's existing assignments automatically.
  INSERT INTO public.groups (id, section_id, name)
  SELECT (j->>'id')::uuid, (j->>'section_id')::uuid, btrim(j->>'name')
  FROM jsonb_array_elements(COALESCE(p_diff->'groups_upsert', '[]'::jsonb)) AS j
  WHERE NOT EXISTS (
    SELECT 1 FROM public.groups g WHERE g.id = (j->>'id')::uuid
  );

  -- Abort on invalid groups.
  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(COALESCE(p_diff->'groups_upsert', '[]'::jsonb)) AS j
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.groups g
      JOIN public.sections sec ON sec.id = g.section_id
      WHERE g.id = (j->>'id')::uuid
        AND g.active
        AND sec.course_id = v_course_id
        AND sec.active
    )
  ) THEN
    RAISE EXCEPTION 'Group payload references a group or section that does not exist in this course';
  END IF;

  -- 6. Update group memberships: deactivate members no longer in their group's roster
  UPDATE public.group_members gm
  SET active = false, ended_at = now()
  FROM (
    SELECT (m->>'membership_id')::uuid AS id
    FROM jsonb_array_elements(COALESCE(p_diff->'members_to_deactivate', '[]'::jsonb)) AS m
  ) AS targets
  WHERE gm.id = targets.id
    AND gm.active
    AND EXISTS (
      SELECT 1
      FROM public.groups g
      JOIN public.sections sec ON sec.id = g.section_id
      WHERE g.id = gm.group_id
        AND sec.course_id = v_course_id
    );

  -- Reactivate returning members: original row restored, ended_at cleared.
  UPDATE public.group_members gm
  SET active = true, ended_at = NULL, updated_at = now()
  FROM (
    SELECT (m->>'membership_id')::uuid AS id
    FROM jsonb_array_elements(COALESCE(p_diff->'members_to_reactivate', '[]'::jsonb)) AS m
  ) AS targets
  WHERE gm.id = targets.id
    AND NOT gm.active
    AND EXISTS (
      SELECT 1
      FROM public.groups g
      JOIN public.sections sec ON sec.id = g.section_id
      WHERE g.id = gm.group_id
        AND sec.course_id = v_course_id
    );

  -- Insert brand-new members.
  INSERT INTO public.group_members (group_id, student_id, active)
  SELECT ins.group_id, ins.student_id, true
  FROM (
    SELECT (m->>'group_id')::uuid AS group_id, (m->>'student_id')::uuid AS student_id
    FROM jsonb_array_elements(COALESCE(p_diff->'members_to_insert', '[]'::jsonb)) AS m
  ) AS ins
  JOIN public.groups g ON g.id = ins.group_id
  JOIN public.sections sec ON sec.id = g.section_id
  WHERE sec.course_id = v_course_id
  ON CONFLICT (group_id, student_id) DO UPDATE
    SET active = true, ended_at = NULL, updated_at = now();

  -- 7. Update case_session assignments for groups that moved between sections
  INSERT INTO public.case_sessions (status, group_id, case_id, section_assignment_id)
  SELECT 'assigned', mv.group_id, sa.case_id, sa.id
  FROM (
    SELECT
      (m->>'group_id')::uuid      AS group_id,
      (m->>'to_section_id')::uuid AS to_section_id
    FROM jsonb_array_elements(COALESCE(p_diff->'group_section_moves', '[]'::jsonb)) AS m
  ) AS mv
  JOIN public.section_assignments sa ON sa.section_id = mv.to_section_id
  ON CONFLICT (section_assignment_id, group_id) DO NOTHING;

  -- Delete never-started sessions tied to the old section 
  DELETE FROM public.case_sessions cs
  USING (
    SELECT
      (m->>'group_id')::uuid         AS group_id,
      (m->>'from_section_id')::uuid  AS from_section_id
    FROM jsonb_array_elements(COALESCE(p_diff->'group_section_moves', '[]'::jsonb)) AS m
  ) AS mv
  WHERE cs.group_id = mv.group_id
    AND cs.started_at IS NULL
    AND cs.status NOT IN ('completed', 'archived')
    AND cs.section_assignment_id IN (
      SELECT sa.id FROM public.section_assignments sa WHERE sa.section_id = mv.from_section_id
    );

  RETURN v_course_id;
END;
$$;

