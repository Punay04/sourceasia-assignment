export default function OfflinePage() {
  return (
    <section className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-6 py-20">
      <div className="rounded-[28px] border border-white/60 bg-white/80 p-10 shadow-[0_30px_90px_-70px_rgba(15,23,42,0.6)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
          Offline
        </p>
        <h1 className="mt-4 font-display text-3xl text-slate-900">
          You are offline
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Check your connection to search new flights. Your saved bookings will
          still be available when cached.
        </p>
      </div>
    </section>
  );
}
