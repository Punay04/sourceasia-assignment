export default function Home() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-20">
      <div className="grid gap-10 rounded-[32px] border border-white/60 bg-white/70 p-10 shadow-[0_40px_120px_-80px_rgba(15,23,42,0.6)] backdrop-blur md:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
            Flight Management Platform
          </p>
          <h1 className="font-display text-4xl leading-tight text-slate-900 sm:text-5xl">
            Move passengers with confidence.
            <span className="block text-gradient">
              Seats update in real time.
            </span>
          </h1>
          <p className="max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Search routes, lock seats as they are selected, and keep every
            booking synced across devices. Built for passengers who want clarity
            at every step.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white">
              Fast booking
            </span>
            <span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-600">
              Realtime seats
            </span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-amber-700">
              PWA ready
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4 rounded-3xl bg-slate-950 p-6 text-white">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-300">
              Today
            </p>
            <span className="text-xs text-slate-300">Live cabin feed</span>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-sm font-semibold">Flight SA101</p>
            <p className="text-xs text-slate-300">LAX → SFO · 14:00</p>
            <div className="mt-4 grid grid-cols-6 gap-2">
              {Array.from({ length: 18 }).map((_, index) => (
                <span
                  key={index}
                  className={`h-3 rounded-full ${
                    index % 5 === 0
                      ? "bg-amber-300"
                      : index % 4 === 0
                        ? "bg-slate-700"
                        : "bg-emerald-400"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">
              Performance
            </p>
            <p className="mt-2 text-2xl font-semibold">98% on-time updates</p>
            <p className="text-xs text-slate-400">
              Realtime sync across cabins
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
