ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Drop the FK constraint that ties users.id to auth.users.id.
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- Re-add the group_members FK with ON UPDATE CASCADE so that when a
-- pre-provisioned user's id is updated to their real auth UUID on first login,
-- the cascade keeps group membership data consistent.
ALTER TABLE public.group_members DROP CONSTRAINT IF EXISTS group_members_student_id_fkey;
ALTER TABLE public.group_members
  ADD CONSTRAINT group_members_student_id_fkey
  FOREIGN KEY (student_id) REFERENCES public.users(id)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Same for faculty_section.
ALTER TABLE public.faculty_section DROP CONSTRAINT IF EXISTS faculty_section_faculty_id_fkey;
ALTER TABLE public.faculty_section
  ADD CONSTRAINT faculty_section_faculty_id_fkey
  FOREIGN KEY (faculty_id) REFERENCES public.users(id)
  ON UPDATE CASCADE;

-- Update the trigger so that when a student who was pre-provisioned from a CSV
CREATE OR REPLACE FUNCTION public.link_new_user_profile()
RETURNS trigger AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.users WHERE LOWER(TRIM(email)) = LOWER(TRIM(new.email))) THEN
    UPDATE public.users
    SET
      id         = new.id,
      is_active  = true,
      full_name  = COALESCE(
                     full_name,
                     new.raw_user_meta_data->>'full_name',
                     new.raw_user_meta_data->>'name'
                   ),
      updated_at = now()
    WHERE LOWER(TRIM(email)) = LOWER(TRIM(new.email));
  ELSE
    INSERT INTO public.users (id, role, full_name, email, is_active)
    VALUES (
      new.id,
      'student',
      COALESCE(
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'name'
      ),
      LOWER(TRIM(new.email)),
      true
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CREATE TABLE public.editable_sim_data (
--     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
--     name text NOT NULL,
--     diagnosis text NOT NULL,
--     -- full copy of all data from case_data (labs, med orders, notes), or just editable data
--       -- editable data = documentation_results, clinical_documents, med-related content
--     -- labs table will reference this id as FK?
-- )

-- ALTER TABLE case_sessions ADD COLUMN editable_sim_data_id UUID REFERENCES editable_sim_data(id);


-- CREATE OR REPLACE FUNCTION create_group_sessions_on_assignment()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   -- Insert a new case_session for every group in the assigned section
--   INSERT INTO public.case_sessions (status, group_id, case_id)
--   SELECT 
--     'assigned',  
--     g.id,
--     -- editable_sim_data_id        
--     NEW.case_id  
--   FROM public.groups g
--   WHERE g.section_id = NEW.section_id;
--   -- AND NOT EXISTS (
--   --     SELECT 1 FROM public.case_sessions cs 
--   --     WHERE cs.group_id = g.id AND cs.case_id = NEW.case_id
--   -- );

--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;


-- CREATE TRIGGER trigger_create_group_sessions
-- AFTER INSERT ON public.section_assignments
-- FOR EACH ROW
-- EXECUTE FUNCTION create_group_sessions_on_assignment();

-- Add linkage from case_sessions to section_assignments
ALTER TABLE public.case_sessions
ADD COLUMN section_assignment_id UUID REFERENCES public.section_assignments(id) ON DELETE CASCADE;

-- Enforce one session per (section_assignment, group)
ALTER TABLE public.case_sessions
ADD CONSTRAINT case_sessions_unique_assignment_group
UNIQUE (section_assignment_id, group_id);

-- Function: when a section_assignment is created, create a case_session per group in that section
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
    ON CONFLICT (section_assignment_id, group_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Trigger on section_assignments to invoke the function after insert
CREATE TRIGGER section_assignments_after_insert_create_case_sessions
AFTER INSERT ON public.section_assignments
FOR EACH ROW
EXECUTE FUNCTION public.create_case_sessions_for_section_assignment();

-- Function: when a group is created, backfill case_sessions for existing section_assignments in that section
CREATE OR REPLACE FUNCTION public.create_case_sessions_for_new_group()
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
        NEW.id,
        sa.case_id,
        sa.id
    FROM public.section_assignments sa
    WHERE sa.section_id = NEW.section_id
    ON CONFLICT (section_assignment_id, group_id) DO NOTHING;

    RETURN NEW;
END;
$$;

-- Trigger on groups to invoke the backfill function after insert
CREATE TRIGGER groups_after_insert_create_case_sessions
AFTER INSERT ON public.groups
FOR EACH ROW
EXECUTE FUNCTION public.create_case_sessions_for_new_group();

CREATE UNIQUE INDEX users_email_unique_normalized
ON public.users (LOWER(TRIM(email)));
