create or replace function public.reschedule_booking(
  p_booking_id uuid,
  p_new_flight_id uuid,
  p_new_seat_id uuid,
  p_fee_charged numeric,
  p_new_total_price numeric
) returns void language plpgsql security definer set search_path = public as $$
declare
  v_user_id uuid;
  v_old_flight_id uuid;
  v_old_seat_id uuid;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Unauthorized';
  end if;

  select flight_id, seat_id
    into v_old_flight_id, v_old_seat_id
  from public.bookings
  where id = p_booking_id and user_id = v_user_id
  for update;

  if v_old_flight_id is null then
    raise exception 'Booking not found';
  end if;

  perform 1
  from public.seats
  where id = p_new_seat_id
    and flight_id = p_new_flight_id
    and is_available = true
  for update;

  if not found then
    raise exception 'Seat not available';
  end if;

  update public.seats
    set is_available = true
  where id = v_old_seat_id;

  update public.seats
    set is_available = false
  where id = p_new_seat_id;

  insert into public.reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  values (p_booking_id, v_old_flight_id, p_new_flight_id, p_fee_charged);

  update public.bookings
    set flight_id = p_new_flight_id,
        seat_id = p_new_seat_id,
        status = 'rescheduled',
        total_price = p_new_total_price
  where id = p_booking_id and user_id = v_user_id;
end;
$$;

revoke all on function public.reschedule_booking(uuid, uuid, uuid, numeric, numeric) from public;
grant execute on function public.reschedule_booking(uuid, uuid, uuid, numeric, numeric) to authenticated;
