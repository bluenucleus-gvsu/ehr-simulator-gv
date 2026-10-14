-- 1. Remove the dead 'unassigned' status
UPDATE public.case_sessions
SET status = 'assigned'
WHERE status = 'unassigned';

ALTER TABLE public.case_sessions
  DROP CONSTRAINT IF EXISTS case_sessions_status_check;

ALTER TABLE public.case_sessions
  ADD CONSTRAINT case_sessions_status_check
  CHECK (status IN ('assigned', 'in progress', 'completed', 'archived'));


-- 2. Add archived_at so archival time is recorded similar to complete & completed_at.
ALTER TABLE public.case_sessions
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

UPDATE public.case_sessions cs
SET archived_at = sa.sim_time
FROM public.section_assignments sa
WHERE sa.id = cs.section_assignment_id
  AND cs.status = 'archived'
  AND cs.archived_at IS NULL;


-- 3. Drop get_user_courses: replaced by the server action in src/actions/getUserCourses.ts
DROP FUNCTION IF EXISTS public.get_user_courses(p_user_id uuid);

-- 4. Create postgres cron job to auto-archive old (>24hr) case_sessions
CREATE EXTENSION IF NOT EXISTS pg_cron;

CREATE OR REPLACE FUNCTION public.archive_due_case_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  archived integer;
BEGIN
  WITH due AS (
    SELECT DISTINCT sa.id
    FROM public.section_assignments sa
    JOIN public.case_sessions cs ON cs.section_assignment_id = sa.id
    WHERE sa.sim_time + interval '24 hours' < now()
      AND cs.status NOT IN ('completed', 'archived')
  )
  UPDATE public.case_sessions cs
  SET status = 'archived',
      archived_at = now(),
      completed_at = NULL
  WHERE cs.section_assignment_id IN (SELECT id FROM due);

  GET DIAGNOSTICS archived = ROW_COUNT;
  RETURN archived;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.archive_due_case_sessions() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.archive_due_case_sessions() TO service_role;

-- Schedule every 15 minutes
SELECT cron.schedule(
  'archive-due-case-sessions',
  '*/15 * * * *',
  $$SELECT public.archive_due_case_sessions()$$
);




