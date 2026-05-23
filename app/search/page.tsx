import SearchForm from "@/app/search/search-form";

export default function SearchPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-8 rounded-[28px] border border-white/60 bg-white/70 p-6 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.6)] backdrop-blur sm:gap-10 sm:p-10 md:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Route Search
          </p>
          <h1 className="font-display text-3xl text-slate-900">
            Find your next flight.
          </h1>
          <p className="text-sm text-slate-600">
            Filter by route and date. We will pull live availability and keep
            seat maps synced.
          </p>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
            <SearchForm />
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl bg-slate-950 p-5 text-white sm:p-6">
          <p className="text-xs uppercase tracking-[0.25em] text-amber-300">
            Smart hints
          </p>
          <div className="space-y-3 text-sm text-slate-300">
            <p>- Use airport codes (LAX, SFO, JFK) for faster matches.</p>
            <p>
              - Seat availability updates instantly while you browse results.
            </p>
            <p>- Bookings sync to your device even after refresh.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
