import { createSupabaseServerClient } from "@/lib/supabase/server";
import FlightCard from "@/app/search/results/flight-card";
import type { FlightRecord } from "@/lib/types";

type SearchParams = {
  origin?: string;
  destination?: string;
  date?: string;
  passengers?: string;
};

function formatTime(value: string) {
  const date = new Date(value);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDuration(departsAt: string, arrivesAt: string) {
  const departs = new Date(departsAt).getTime();
  const arrives = new Date(arrivesAt).getTime();
  const minutes = Math.max(0, Math.round((arrives - departs) / 60000));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${hours}h ${remainder}m`;
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const origin = resolvedSearchParams.origin?.toUpperCase();
  const destination = resolvedSearchParams.destination?.toUpperCase();
  const date = resolvedSearchParams.date;
  const passengers = Number(resolvedSearchParams.passengers ?? "1");

  if (!origin || !destination || !date) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-700">
          Missing search details. Return to the search page to try again.
        </div>
      </section>
    );
  }

  const start = new Date(`${date}T00:00:00Z`).toISOString();
  const end = new Date(`${date}T23:59:59Z`).toISOString();

  const supabase = await createSupabaseServerClient();
  const { data: flights, error } = await supabase
    .from("flights")
    .select(
      "id, flight_no, origin, destination, departs_at, arrives_at, base_price, aircraft_type, status",
    )
    .eq("origin", origin)
    .eq("destination", destination)
    .gte("departs_at", start)
    .lte("departs_at", end)
    .order("departs_at", { ascending: true })
    .returns<FlightRecord[]>();

  if (error) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-rose-100 bg-rose-50 p-6 text-sm text-rose-600">
          {error.message}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_24px_70px_-60px_rgba(15,23,42,0.55)] backdrop-blur sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Results
          </p>
          <h1 className="font-display text-3xl text-slate-900">
            Available flights
          </h1>
        </div>
        <p className="text-sm text-slate-600">
          {origin} to {destination} · {formatDate(start)} · {passengers}{" "}
          passenger
          {passengers > 1 ? "s" : ""}
        </p>
      </div>

      <div className="mt-8 grid gap-4">
        {flights && flights.length > 0 ? (
          flights.map((flight) => (
            <FlightCard
              key={flight.id}
              flight={flight}
              passengers={passengers}
              durationLabel={formatDuration(
                flight.departs_at,
                flight.arrives_at,
              )}
              departLabel={formatTime(flight.departs_at)}
              arriveLabel={formatTime(flight.arrives_at)}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            No flights match this route and date yet.
          </div>
        )}
      </div>
    </section>
  );
}
