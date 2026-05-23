import { createSupabaseServerClient } from "@/lib/supabase/server";

type BookingDetails = {
  id: string;
  pnr_code: string;
  total_price: number;
  status: string;
  flights: {
    flight_no: string;
    origin: string;
    destination: string;
    departs_at: string;
    arrives_at: string;
    aircraft_type: string;
  } | null;
  seats: {
    seat_number: string;
    class: string;
  } | null;
  passengers: {
    full_name: string;
    passport_no: string;
    nationality: string;
    dob: string;
  }[];
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createSupabaseServerClient();

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, pnr_code, total_price, status, flights:flight_id (flight_no, origin, destination, departs_at, arrives_at, aircraft_type), seats:seat_id (seat_number, class), passengers (full_name, passport_no, nationality, dob)",
    )
    .eq("id", resolvedParams.bookingId)
    .single<BookingDetails>();

  if (!booking) {
    return (
      <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-700">
          Booking not found.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_26px_80px_-70px_rgba(15,23,42,0.6)] backdrop-blur sm:p-8">
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
          Confirmed
        </p>
        <h1 className="mt-2 font-display text-3xl text-slate-900">
          Booking {booking.pnr_code}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Seat {booking.seats?.seat_number} · {booking.seats?.class} · Total $
          {Number(booking.total_price).toFixed(2)}
        </p>

        <div className="mt-6 grid gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
          <div>
            <p className="text-xs text-slate-400">Flight</p>
            <p className="font-medium text-slate-900">
              {booking.flights?.flight_no} · {booking.flights?.aircraft_type}
            </p>
            <p>
              {booking.flights?.origin} → {booking.flights?.destination}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Passengers</p>
            <div className="mt-2 grid gap-2">
              {booking.passengers.map((passenger) => (
                <div key={passenger.passport_no}>
                  <p className="font-medium text-slate-900">
                    {passenger.full_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {passenger.nationality} · {passenger.passport_no}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
