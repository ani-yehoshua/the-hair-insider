-- REVIEWABLE MIGRATION. Not applied by this PR. Validate in staging before release.
-- Apply manually only after Josh approves; never run during builds or startup.
-- Adds a separate progress table; does not modify assessments, entitlements,
-- courses, pricing, Stripe, checkout, or existing buyer access rules.
begin;
create table if not exists public.growth_edit_routine_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_key text not null check (plan_key ~ '^map1-[a-f0-9]{8}$'),
  revision integer not null default 1 check (revision > 0),
  progress jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, plan_key),
  check (jsonb_typeof(progress) = 'object'),
  check (progress ?& array['version','planKey','revision','firstName','startDate','completedDays','checkIns']),
  check (jsonb_typeof(progress->'completedDays') = 'array'),
  check (jsonb_array_length(progress->'completedDays') <= 30),
  check (jsonb_typeof(progress->'checkIns') = 'object'),
  check (length(progress->>'firstName') <= 60),
  check ((progress->>'version')::integer = 1),
  check (progress->>'planKey' = plan_key),
  check ((progress->>'revision')::integer = revision),
  check (octet_length(progress::text) <= 100000)
);
alter table public.growth_edit_routine_progress enable row level security;
revoke all on public.growth_edit_routine_progress from PUBLIC, anon, authenticated;
grant select, insert, update on public.growth_edit_routine_progress to authenticated;

create policy growth_edit_progress_owner on public.growth_edit_routine_progress
for all to authenticated
using (
  user_id = auth.uid() and exists (
    select 1 from public.entitlements e join public.courses c on c.id = e.course_id
    where e.user_id = auth.uid() and e.status = 'active'
      and c.slug = 'hair-growth-edit' and c.is_published = true
  )
)
with check (
  user_id = auth.uid() and exists (
    select 1 from public.entitlements e join public.courses c on c.id = e.course_id
    where e.user_id = auth.uid() and e.status = 'active'
      and c.slug = 'hair-growth-edit' and c.is_published = true
  )
);

create function public.validate_growth_edit_progress_update() returns trigger
language plpgsql set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if new.user_id <> old.user_id or new.plan_key <> old.plan_key
      or new.revision <> old.revision + 1 then
      raise exception 'Invalid progress revision';
    end if;
    if new.progress->>'startDate' is distinct from old.progress->>'startDate'
      and (jsonb_array_length(old.progress->'completedDays') > 0
        or old.progress->'checkIns' <> '{}'::jsonb) then
      raise exception 'Start date is locked after logging begins';
    end if;
    if exists (select 1 from jsonb_object_keys(old.progress->'checkIns') as k
      where not (new.progress->'checkIns' ? k)) then
      raise exception 'Cannot accidentally delete a saved check-in';
    end if;
  elsif new.revision <> 1 then
    raise exception 'Initial progress revision must be 1';
  end if;
  new.updated_at = now();
  return new;
end;
$$;
create trigger validate_growth_edit_progress_before_write
before insert or update on public.growth_edit_routine_progress
for each row execute function public.validate_growth_edit_progress_update();
commit;
