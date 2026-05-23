-- Seed a test user
with user_row as (
  select gen_random_uuid() as id, 'test.user@demo.com'::text as email
)
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
select
  u.id,
  '00000000-0000-0000-0000-000000000000'::uuid,
  'authenticated',
  'authenticated',
  u.email,
  crypt('Passw0rd!', gen_salt('bf')),
  now(),
  jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
  jsonb_build_object(),
  now(),
  now()
from user_row u
on conflict (id) do nothing;

with user_row as (
  select id, email
  from auth.users
  where email = 'test.user@demo.com'
  limit 1
)
insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  gen_random_uuid(),
  u.id,
  u.id::text,
  jsonb_build_object('sub', u.id::text, 'email', u.email),
  'email',
  now(),
  now(),
  now()
from user_row u
on conflict do nothing;

-- Seed flights
with flights_seed as (
  select * from (values
    ('SA100', 'LAX', 'SFO', now() + interval '2 days 08:00', now() + interval '2 days 09:30', 'A320', 'scheduled', 120.00),
    ('SA101', 'LAX', 'SFO', now() + interval '3 days 14:00', now() + interval '3 days 15:30', 'A320', 'scheduled', 135.00),
    ('SA200', 'SFO', 'LAX', now() + interval '2 days 11:00', now() + interval '2 days 12:30', 'A320', 'scheduled', 120.00),
    ('SA201', 'SFO', 'LAX', now() + interval '3 days 18:00', now() + interval '3 days 19:30', 'A320', 'scheduled', 140.00),
    ('SA300', 'JFK', 'ATL', now() + interval '4 days 07:30', now() + interval '4 days 09:45', 'B737', 'scheduled', 180.00),
    ('SA301', 'JFK', 'ATL', now() + interval '5 days 16:00', now() + interval '5 days 18:15', 'B737', 'scheduled', 190.00),
    ('SA400', 'ATL', 'JFK', now() + interval '4 days 12:00', now() + interval '4 days 14:15', 'B737', 'scheduled', 185.00),
    ('SA401', 'ATL', 'JFK', now() + interval '5 days 19:00', now() + interval '5 days 21:15', 'B737', 'scheduled', 195.00)
  ) as t(flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
),
inserted as (
  insert into public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
  select * from flights_seed
  returning id
)
insert into public.seats (flight_id, seat_number, class, is_available, extra_fee)
select i.id, r::text || l.letter, 'first', true, 200.00
from inserted i
cross join generate_series(1, 2) as r
cross join (values ('A'), ('B'), ('C'), ('D')) as l(letter)
union all
select i.id, r::text || l.letter, 'business', true, 100.00
from inserted i
cross join generate_series(3, 6) as r
cross join (values ('A'), ('B'), ('C'), ('D')) as l(letter)
union all
select i.id, r::text || l.letter, 'economy', true, 0.00
from inserted i
cross join generate_series(7, 20) as r
cross join (values ('A'), ('B'), ('C'), ('D'), ('E'), ('F')) as l(letter);
