import { createSupabaseServerClient } from "@/lib/supabase/server";
import RescheduleForm from "@/app/bookings/[bookingId]/reschedule-form";
import CancelBookingButton from "@/app/bookings/[bookingId]/cancel-booking-button";

type BookingDetail = {
  id: string;
  status: string;
  total_price: number;
  pnr_code: string;
  flight_id: string;
  flights: {
    flight_no: string;
    origin: string;
    destination: string;
    departs_at: string;
  } | null;
  seats: {
    seat_number: string;
    class: "economy" | "business" | "first";
  } | null;
};

type RescheduleOption = {
  flightId: string;
  flightNo: string;
  departsAt: string;
  arrivesAt: string;
  basePrice: number;
  seatId: string;
  seatFee: number;
};

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createSupabaseServerClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, status, total_price, pnr_code, flight_id, flights:flight_id (flight_no, origin, destination, departs_at), seats:seat_id (seat_number, class)",
    )
    .eq("id", resolvedParams.bookingId)
    .single<BookingDetail>();

  if (!booking || !booking.flights || !booking.seats) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-700">
          Booking not found.
        </div>
      </section>
    );
  }

  const { data: flights } = await supabase
    .from("flights")
    .select(
      "id, flight_no, origin, destination, departs_at, arrives_at, base_price",
    )
    .eq("origin", booking.flights.origin)
    .eq("destination", booking.flights.destination)
    .neq("id", booking.flight_id)
    .gte("departs_at", new Date().toISOString())
    .order("departs_at", { ascending: true });

  const flightIds = (flights ?? []).map((flight) => flight.id);
  const { data: availableSeats } = await supabase
    .from("seats")
    .select("id, flight_id, extra_fee")
    .eq("class", booking.seats.class)
    .eq("is_available", true)
    .in("flight_id", flightIds);

  const seatMap = new Map<string, { seatId: string; seatFee: number }>();
  availableSeats?.forEach((seat) => {
    if (!seatMap.has(seat.flight_id)) {
      seatMap.set(seat.flight_id, {
        seatId: seat.id,
        seatFee: Number(seat.extra_fee),
      });
    }
  });

  const options: RescheduleOption[] = (flights ?? [])
    .filter((flight) => seatMap.has(flight.id))
    .map((flight) => {
      const seatInfo = seatMap.get(flight.id)!;
      return {
        flightId: flight.id,
        flightNo: flight.flight_no,
        departsAt: flight.departs_at,
        arrivesAt: flight.arrives_at,
        basePrice: Number(flight.base_price),
        seatId: seatInfo.seatId,
        seatFee: seatInfo.seatFee,
      };
    });

  const isCancelled = booking.status === "cancelled";

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_26px_80px_-70px_rgba(15,23,42,0.6)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            Booking
          </p>
          <h1 className="font-display text-3xl text-slate-900">
            {booking.flights.origin} → {booking.flights.destination}
          </h1>
          <p className="text-sm text-slate-600">
            {booking.flights.flight_no} · Seat {booking.seats.seat_number} · PNR
            {` ${booking.pnr_code}`}
          </p>
        </div>

        <div className="mt-8 grid gap-6">
          {isCancelled ? (
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-5 text-sm text-slate-600">
              This booking is already cancelled.
            </div>
          ) : (
            <>
              <RescheduleForm bookingId={booking.id} options={options} />
              <CancelBookingButton bookingId={booking.id} />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
