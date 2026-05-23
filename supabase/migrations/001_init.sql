create extension if not exists "pgcrypto";

create table if not exists public.flights (
  id uuid primary key default gen_random_uuid(),
  flight_no text not null,
  origin text not null,
  destination text not null,
  departs_at timestamptz not null,
  arrives_at timestamptz not null,
  aircraft_type text not null,
  status text not null default 'scheduled',
  base_price numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

create table if not exists public.seats (
  id uuid primary key default gen_random_uuid(),
  flight_id uuid not null references public.flights(id) on delete cascade,
  seat_number text not null,
  class text not null check (class in ('economy', 'business', 'first')),
  is_available boolean not null default true,
  extra_fee numeric(10, 2) not null default 0,
  created_at timestamptz not null default now(),
  unique (flight_id, seat_number)
);

create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  flight_id uuid not null references public.flights(id) on delete restrict,
  seat_id uuid not null references public.seats(id) on delete restrict,
  status text not null default 'confirmed' check (status in ('confirmed', 'rescheduled', 'cancelled')),
  booked_at timestamptz not null default now(),
  total_price numeric(10, 2) not null,
  pnr_code text not null unique,
  unique (seat_id)
);

create table if not exists public.passengers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  full_name text not null,
  passport_no text not null,
  nationality text not null,
  dob date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reschedules (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  old_flight_id uuid not null references public.flights(id) on delete restrict,
  new_flight_id uuid not null references public.flights(id) on delete restrict,
  requested_at timestamptz not null default now(),
  fee_charged numeric(10, 2) not null default 0
);

alter table public.flights enable row level security;
alter table public.seats enable row level security;
alter table public.bookings enable row level security;
alter table public.passengers enable row level security;
alter table public.reschedules enable row level security;

create policy "flights_read_all" on public.flights
  for select to anon, authenticated
  using (true);

create policy "seats_read_all" on public.seats
  for select to anon, authenticated
  using (true);

create policy "bookings_read_own" on public.bookings
  for select to authenticated
  using (user_id = auth.uid());

create policy "bookings_insert_own" on public.bookings
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "bookings_update_own" on public.bookings
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "passengers_read_own" on public.passengers
  for select to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = passengers.booking_id and b.user_id = auth.uid()
    )
  );

create policy "passengers_insert_own" on public.passengers
  for insert to authenticated
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = passengers.booking_id and b.user_id = auth.uid()
    )
  );

create policy "passengers_update_own" on public.passengers
  for update to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = passengers.booking_id and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = passengers.booking_id and b.user_id = auth.uid()
    )
  );

create policy "reschedules_read_own" on public.reschedules
  for select to authenticated
  using (
    exists (
      select 1 from public.bookings b
      where b.id = reschedules.booking_id and b.user_id = auth.uid()
    )
  );

create policy "reschedules_insert_own" on public.reschedules
  for insert to authenticated
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = reschedules.booking_id and b.user_id = auth.uid()
    )
  );

create or replace function public.reserve_seat(
  p_flight_id uuid,
  p_seat_id uuid,
  p_total_price numeric,
  p_passengers jsonb
) returns table (
  booking_id uuid,
  seat_id uuid,
  pnr_code text
) language plpgsql security definer set search_path = public as $$
declare
  v_seat_id uuid;
  v_pnr text;
  v_booking_id uuid;
  v_user_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select id into v_seat_id
  from public.seats
  where id = p_seat_id
    and flight_id = p_flight_id
    and is_available = true
  for update;

  if v_seat_id is null then
    raise exception 'Seat not available';
  end if;

  update public.seats
    set is_available = false
  where id = v_seat_id;

  v_pnr := upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.bookings (user_id, flight_id, seat_id, total_price, pnr_code)
  values (v_user_id, p_flight_id, v_seat_id, p_total_price, v_pnr)
  returning id into v_booking_id;

  insert into public.passengers (booking_id, full_name, passport_no, nationality, dob)
  select
    v_booking_id,
    p.value->>'full_name',
    p.value->>'passport_no',
    p.value->>'nationality',
    (p.value->>'dob')::date
  from jsonb_array_elements(p_passengers) as p(value);

  return query select v_booking_id, v_seat_id, v_pnr;
end;
$$;

create or replace function public.cancel_booking(
  p_booking_id uuid
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid;
  v_seat_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select seat_id into v_seat_id
  from public.bookings
  where id = p_booking_id and user_id = v_user_id
  for update;

  if v_seat_id is null then
    raise exception 'Booking not found';
  end if;

  update public.bookings
    set status = 'cancelled'
  where id = p_booking_id and user_id = v_user_id;

  update public.seats
    set is_available = true
  where id = v_seat_id;
end;
$$;

revoke all on function public.reserve_seat(uuid, uuid, numeric, jsonb) from public;
grant execute on function public.reserve_seat(uuid, uuid, numeric, jsonb) to authenticated;

revoke all on function public.cancel_booking(uuid) from public;
grant execute on function public.cancel_booking(uuid) to authenticated;

create or replace function public.prevent_late_cancellation()
returns trigger language plpgsql as $$
declare
  v_departs_at timestamptz;
begin
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    select departs_at into v_departs_at
    from public.flights
    where id = new.flight_id;

    if v_departs_at <= now() + interval '2 hours' then
      raise exception 'Cancellations within 2 hours of departure are not allowed';
    end if;
  end if;

  return new;
end;
$$;

create trigger bookings_prevent_late_cancellation
before update on public.bookings
for each row execute function public.prevent_late_cancellation();
