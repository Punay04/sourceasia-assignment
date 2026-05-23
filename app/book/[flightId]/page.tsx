import { createSupabaseServerClient } from "@/lib/supabase/server";
import BookingForm from "@/app/book/[flightId]/booking-form";
import type { FlightDetails, SeatRecord } from "@/lib/types";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ flightId: string }>;
}) {
  const resolvedParams = await params;
  const supabase = await createSupabaseServerClient();

  const { data: flight } = await supabase
    .from("flights")
    .select(
      "id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, base_price",
    )
    .eq("id", resolvedParams.flightId)
    .single<FlightDetails>();

  const { data: seats } = await supabase
    .from("seats")
    .select("id, seat_number, class, extra_fee, is_available")
    .eq("flight_id", resolvedParams.flightId)
    .order("seat_number", { ascending: true })
    .returns<SeatRecord[]>();

  if (!flight) {
    return (
      <section className="mx-auto w-full max-w-5xl px-6 py-16">
        <div className="rounded-2xl border border-zinc-100 bg-white p-6 text-sm text-zinc-600">
          Flight not found.
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="rounded-[28px] border border-white/60 bg-white/80 p-6 shadow-[0_26px_80px_-70px_rgba(15,23,42,0.6)] backdrop-blur sm:p-8">
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
            {flight.flight_no} · {flight.aircraft_type}
          </p>
          <h1 className="font-display text-3xl text-slate-900">
            {flight.origin} to {flight.destination}
          </h1>
          <p className="text-sm text-slate-600">
            Base fare ${Number(flight.base_price).toFixed(2)}
          </p>
        </div>

        <div className="mt-8">
          <BookingForm flight={flight} seats={seats ?? []} />
        </div>
      </div>
    </section>
  );
}
