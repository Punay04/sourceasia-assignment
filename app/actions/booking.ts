"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/lib/types";

export async function reserveSeatAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const flightId = formData.get("flightId")?.toString();
  const seatId = formData.get("seatId")?.toString();
  const fullName = formData.get("fullName")?.toString();
  const passportNo = formData.get("passportNo")?.toString();
  const nationality = formData.get("nationality")?.toString();
  const dob = formData.get("dob")?.toString();

  if (
    !flightId ||
    !seatId ||
    !fullName ||
    !passportNo ||
    !nationality ||
    !dob
  ) {
    return { error: "Please complete all passenger details." };
  }

  const supabase = await createSupabaseServerClient();

  const { data: flight, error: flightError } = await supabase
    .from("flights")
    .select("id, base_price")
    .eq("id", flightId)
    .single();

  if (flightError || !flight) {
    return { error: "Flight not found." };
  }

  const { data: seat, error: seatError } = await supabase
    .from("seats")
    .select("id, extra_fee")
    .eq("id", seatId)
    .single();

  if (seatError || !seat) {
    return { error: "Seat not found." };
  }

  const totalPrice = Number(flight.base_price) + Number(seat.extra_fee);

  const { data, error } = await supabase.rpc("reserve_seat", {
    p_flight_id: flightId,
    p_seat_id: seatId,
    p_total_price: totalPrice,
    p_passengers: [
      {
        full_name: fullName,
        passport_no: passportNo,
        nationality,
        dob,
      },
    ],
  });

  if (error) {
    return { error: error.message };
  }

  const reservation = Array.isArray(data) ? data[0] : data;

  if (!reservation?.booking_id) {
    return { error: "Reservation failed. Please try again." };
  }

  redirect(`/confirmation/${reservation.booking_id}`);
}
