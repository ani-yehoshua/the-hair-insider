-- Non-destructive. Run in the existing production Supabase project.
-- Keep disabled until the cutover checklist in docs/growth-edit-founding-launch.md is complete.
begin;
create table if not exists public.growth_edit_founding_launch (
  id boolean primary key default true check (id),
  enabled boolean not null default false
);
insert into public.growth_edit_founding_launch (id) values (true) on conflict do nothing;

create table if not exists public.growth_edit_founding_slots (
  slot_id integer primary key check (slot_id between 1 and 100),
  state text not null default 'available' check (state in ('available', 'held', 'paid')),
  reservation_id uuid unique,
  checkout_session_id text unique,
  held_at timestamptz,
  paid_at timestamptz,
  imported_purchase boolean not null default false
);
-- Four historical purchases reported by the owner. They consume four slots ONCE.
-- Existing webhooks have no reservation metadata, so cannot count these twice.
-- Confirm this baseline against Stripe immediately before activating the launch.
insert into public.growth_edit_founding_slots (slot_id, state, imported_purchase)
select n, case when n <= 4 then 'paid' else 'available' end, n <= 4
from generate_series(1, 100) n on conflict do nothing;

alter table public.growth_edit_founding_launch enable row level security;
alter table public.growth_edit_founding_slots enable row level security;
revoke all on public.growth_edit_founding_launch, public.growth_edit_founding_slots from public, anon, authenticated;
grant select, update on public.growth_edit_founding_launch to service_role;
grant select, update on public.growth_edit_founding_slots to service_role;

create or replace function public.growth_edit_founding_status()
returns jsonb language sql security definer set search_path = public as $$
  select jsonb_build_object(
    'enabled', (select enabled from public.growth_edit_founding_launch where id),
    'claimed', count(*) filter (where state = 'paid'),
    'reserved', count(*) filter (where state = 'held'),
    'available', count(*) filter (where state = 'available')
  ) from public.growth_edit_founding_slots;
$$;

create or replace function public.reserve_growth_edit_founding_slot()
returns jsonb language plpgsql security definer set search_path = public as $$
declare target integer; token uuid; active boolean; paid integer;
begin
  -- Serialize allocations. Only 100 slots exist, including the four historical sales.
  select enabled into active from public.growth_edit_founding_launch where id for update;
  if active is distinct from true then raise exception 'Founding launch is not active'; end if;
  select slot_id into target from public.growth_edit_founding_slots
    where state = 'available' order by slot_id limit 1 for update;
  if target is null then
    select count(*) into paid from public.growth_edit_founding_slots where state = 'paid';
    return jsonb_build_object('state', case when paid = 100 then 'regular' else 'busy' end);
  end if;
  token := gen_random_uuid();
  update public.growth_edit_founding_slots set state = 'held', reservation_id = token,
    held_at = now(), checkout_session_id = null where slot_id = target;
  return jsonb_build_object('state', 'held', 'reservationId', token);
end;
$$;

create or replace function public.attach_growth_edit_founding_session(p_reservation_id uuid, p_session_id text)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  update public.growth_edit_founding_slots set checkout_session_id = p_session_id
    where reservation_id = p_reservation_id
    and (checkout_session_id is null or checkout_session_id = p_session_id)
    and state in ('held', 'paid');
  return found;
end;
$$;

create or replace function public.settle_growth_edit_founding_slot(
  p_reservation_id uuid, p_session_id text, p_outcome text
) returns boolean language plpgsql security definer set search_path = public as $$
declare slot public.growth_edit_founding_slots%rowtype;
begin
  if p_outcome not in ('paid', 'available') then raise exception 'Invalid outcome'; end if;
  select * into slot from public.growth_edit_founding_slots
    where reservation_id = p_reservation_id for update;
  if not found then return false; end if;
  if slot.checkout_session_id is not null and slot.checkout_session_id is distinct from p_session_id then
    return false;
  end if;
  -- Replayed paid webhooks are idempotent. Paid slots are never reopened by refunds/expiry.
  if slot.state = 'paid' then return p_outcome = 'paid'; end if;
  if slot.state <> 'held' then return false; end if;
  if p_outcome = 'paid' then
    if p_session_id is null then return false; end if;
    update public.growth_edit_founding_slots set state = 'paid',
      checkout_session_id = p_session_id, paid_at = now() where slot_id = slot.slot_id;
  else
    update public.growth_edit_founding_slots set state = 'available',
      reservation_id = null, checkout_session_id = null, held_at = null where slot_id = slot.slot_id;
  end if;
  return true;
end;
$$;

revoke all on function public.growth_edit_founding_status() from public, anon, authenticated;
revoke all on function public.reserve_growth_edit_founding_slot() from public, anon, authenticated;
revoke all on function public.attach_growth_edit_founding_session(uuid, text) from public, anon, authenticated;
revoke all on function public.settle_growth_edit_founding_slot(uuid, text, text) from public, anon, authenticated;
grant execute on function public.growth_edit_founding_status() to service_role;
grant execute on function public.reserve_growth_edit_founding_slot() to service_role;
grant execute on function public.attach_growth_edit_founding_session(uuid, text) to service_role;
grant execute on function public.settle_growth_edit_founding_slot(uuid, text, text) to service_role;
commit;
