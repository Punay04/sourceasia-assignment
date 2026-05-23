import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type BookingRow = {
  id: string;
  status: string;
  booked_at: string;
  total_price: number;
  pnr_code: string;
  flights: {
    flight_no: string;
    origin: string;
    destination: string;
    departs_at: string;
  } | null;
  seats: {
    seat_number: string;
    class: string;
  } | null;
};

function statusBadge(status: string) {
  if (status === "cancelled") return "bg-rose-50 text-rose-600";
  if (status === "rescheduled") return "bg-amber-50 text-amber-700";
  return "bg-emerald-50 text-emerald-700";
}

export default async function BookingsPage() {
  const supabase = await createSupabaseServerClient();
  const { data: user } = await supabase.auth.getUser();

  if (!user.user) {
    return (
      <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6 text-sm text-amber-700">
          Sign in to view your bookings.
        </div>
      </section>
    );
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      "id, status, booked_at, total_price, pnr_code, flights:flight_id (flight_no, origin, destination, departs_at), seats:seat_id (seat_number, class)",
    )
    .order("booked_at", { ascending: false })
    .returns<BookingRow[]>();

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_24px_70px_-60px_rgba(15,23,42,0.55)] backdrop-blur sm:p-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Overview
          </p>
          <h1 className="font-display text-3xl text-slate-900">My bookings</h1>
        </div>
        <Link
          href="/search"
          className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          New search
        </Link>
      </div>

      <div className="mt-8 grid gap-4">
        {bookings && bookings.length > 0 ? (
          bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.5)] transition hover:-translate-y-1 hover:border-slate-200 sm:p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {booking.flights?.origin} → {booking.flights?.destination}
                  </p>
                  <p className="text-xs text-slate-500">
                    {booking.flights?.flight_no} · Seat{" "}
                    {booking.seats?.seat_number}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(
                      booking.status,
                    )}`}
                  >
                    {booking.status}
                  </span>
                  <span className="text-sm font-semibold text-slate-900">
                    ${Number(booking.total_price).toFixed(2)}
                  </span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            You do not have any bookings yet.
          </div>
        )}
      </div>
    </section>
  );
}
