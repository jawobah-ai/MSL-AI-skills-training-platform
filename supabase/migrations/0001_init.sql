-- MSL AI Skills: core schema with row-level security.
-- Learners see only their own records; graders see submissions, grades and the audit log.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  role text not null default 'learner' check (role in ('learner', 'grader')),
  created_at timestamptz not null default now()
);

create or replace function public.is_grader() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'grader');
$$;

create table public.unit_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  gate_id text not null,
  unit_id text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, gate_id, unit_id)
);

create table public.drill_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  gate_id text not null,
  answers jsonb not null,
  passed boolean not null,
  score int not null,
  max_score int not null,
  feedback jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  gate_id text not null,
  attempt int not null check (attempt in (1, 2)),
  fields jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'passed', 'failed')),
  created_at timestamptz not null default now(),
  unique (user_id, gate_id, attempt)
);

create table public.grades (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.submissions (id) on delete cascade,
  grader_id uuid not null references public.profiles (id),
  scores jsonb not null,
  critical_failures jsonb not null,
  total int not null,
  passed boolean not null,
  reasons jsonb not null default '[]',
  feedback text not null default '',
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles (id),
  action text not null,
  target text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.unit_progress enable row level security;
alter table public.drill_attempts enable row level security;
alter table public.submissions enable row level security;
alter table public.grades enable row level security;
alter table public.audit_log enable row level security;

-- Profiles: read your own (graders read all). Role changes are made by an admin with the service key.
create policy "profiles self read" on public.profiles for select using (id = auth.uid() or public.is_grader());

-- Progress and drill attempts: learners own them.
create policy "progress own" on public.unit_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "drills own read" on public.drill_attempts for select using (user_id = auth.uid() or public.is_grader());
create policy "drills own insert" on public.drill_attempts for insert with check (user_id = auth.uid());

-- Submissions: learners create and read their own; graders read all and set status.
create policy "submissions read" on public.submissions for select using (user_id = auth.uid() or public.is_grader());
create policy "submissions insert" on public.submissions for insert with check (user_id = auth.uid() and status = 'pending');
create policy "submissions grade" on public.submissions for update using (public.is_grader()) with check (public.is_grader());

-- Grades: graders write; the learner reads the grade on their own submission. No grader grades their own work.
create policy "grades read" on public.grades for select using (
  public.is_grader() or exists (select 1 from public.submissions s where s.id = submission_id and s.user_id = auth.uid())
);
create policy "grades insert" on public.grades for insert with check (
  public.is_grader() and grader_id = auth.uid()
  and not exists (select 1 from public.submissions s where s.id = submission_id and s.user_id = auth.uid())
);

-- Audit: anyone signed in appends as themselves; only graders read. No updates or deletes.
create policy "audit append" on public.audit_log for insert with check (actor_id = auth.uid());
create policy "audit read" on public.audit_log for select using (public.is_grader());

-- New sign-ups get a learner profile.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name) values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();
