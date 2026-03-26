ALTER TABLE public.users
DROP CONSTRAINT IF EXISTS users_role_check;

ALTER TABLE public.users
ADD CONSTRAINT users_role_check
CHECK (role IN ('admin', 'student', 'faculty')); 

ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'student';
alter table public.users
add column if not exists status boolean default true;

CREATE TABLE IF NOT EXISTS case_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL
);

CREATE TABLE IF NOT EXISTS public.sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    name TEXT NOT NULL, 
    meeting_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
    -- semester, start and end times? 
);

CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.faculty_section ( 
    id uuid primary key default gen_random_uuid(),
    faculty_id UUID references public.users(id),
    section_id UUID references public.sections(id),
    active boolean default true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at timestamptz default now()
);  

CREATE TABLE IF NOT EXISTS public.section_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id UUID REFERENCES public.sections(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.case_data(id) ON DELETE CASCADE,
    sim_time TIMESTAMPTZ NOT NULL, 
    presim_time TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
    -- status text CHECK(status in ())
);

CREATE TABLE IF NOT EXISTS public.case_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status text CHECK(status in ('completed', 'in progress', 'unassigned', 'assigned', 'archived')),
    group_id UUID references public.groups(id) ON DELETE SET NULL,
    student_ids text, 
    case_id UUID REFERENCES public.case_data(id) ON DELETE SET NULL,
    feedback text,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.course_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    case_id UUID REFERENCES public.case_data(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(course_id, case_id)
);
