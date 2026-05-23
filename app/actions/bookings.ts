"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function rescheduleBookingAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const bookingId = formData.get("bookingId")?.toString();
  const newFlightId = formData.get("newFlightId")?.toString();
  const newSeatId = formData.get("newSeatId")?.toString();

  if (!bookingId || !newFlightId || !newSeatId) {
    return { error: "Select a new flight to reschedule." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .select("id, flight_id, total_price")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return { error: "Booking not found." };
  }

  const { data: newFlight, error: flightError } = await supabase
    .from("flights")
    .select("id, base_price")
    .eq("id", newFlightId)
    .single();

  if (flightError || !newFlight) {
    return { error: "Selected flight not found." };
  }

  const { data: newSeat, error: seatError } = await supabase
    .from("seats")
    .select("id, extra_fee")
    .eq("id", newSeatId)
    .single();

  if (seatError || !newSeat) {
    return { error: "Selected seat not found." };
  }

  const newTotal = Number(newFlight.base_price) + Number(newSeat.extra_fee);
  const fee = Math.max(0, newTotal - Number(booking.total_price));

  const { error } = await supabase.rpc("reschedule_booking", {
    p_booking_id: bookingId,
    p_new_flight_id: newFlightId,
    p_new_seat_id: newSeatId,
    p_fee_charged: fee,
    p_new_total_price: newTotal,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/bookings");
}

export async function cancelBookingAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const bookingId = formData.get("bookingId")?.toString();

  if (!bookingId) {
    return { error: "Booking id is required." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("cancel_booking", {
    p_booking_id: bookingId,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/bookings");
}
