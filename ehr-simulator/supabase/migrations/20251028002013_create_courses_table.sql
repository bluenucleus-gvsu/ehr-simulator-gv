
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null,
  semester text not null,
  active boolean default true,
  start_date date,
  end_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamptz default now()
);

create unique index if not exists courses_name_code_semester_uidx
  on public.courses (name, code, semester);

insert into public.courses (name, code, semester, active, start_date, end_date)
values
  ('Clinical Judgment In Adult Health', 'NUR 335', 'W26', true, '2026-01-12', '2026-04-25'),
  ('Client Playground (Click Here!)', 'NUR 101', 'F25', true, '2025-08-30', '2025-12-15'),
  ('Test Course - Does not exist', 'NUR 1234', 'F25', false, '2025-07-25', '2025-12-13')
on conflict (name, code, semester) do nothing;
