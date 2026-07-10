create type log_level as enum ('debug', 'info', 'warning', 'error', 'critical');
create type log_runtime as enum ('client', 'server');

create table logs (
  id uuid default gen_random_uuid() primary key,
  level log_level not null,
  message text not null,
  context jsonb default null,
  runtime log_runtime not null,
  route text,
  duplicate_count integer not null default 1,
  created_at timestamptz not null default now()
);

create index logs_level_created_at_idx
  on logs (level, created_at desc);

create index logs_route_level_created_at_idx
  on logs (route, level, created_at desc);

create index logs_runtime_level_created_at_idx
  on logs (runtime, level, created_at desc);