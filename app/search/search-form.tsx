"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFlightStore } from "@/lib/stores/flight-store";

export default function SearchForm() {
  const router = useRouter();
  const searchQuery = useFlightStore((state) => state.searchQuery);
  const setSearchQuery = useFlightStore((state) => state.setSearchQuery);
  const setBookingStep = useFlightStore((state) => state.setBookingStep);

  const [origin, setOrigin] = useState(searchQuery?.origin ?? "");
  const [destination, setDestination] = useState(
    searchQuery?.destination ?? "",
  );
  const [date, setDate] = useState(searchQuery?.date ?? "");
  const [passengers, setPassengers] = useState(searchQuery?.passengers ?? 1);

  useEffect(() => {
    setBookingStep("search");
  }, [setBookingStep]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSearchQuery({
      origin,
      destination,
      date,
      passengers,
    });
    setBookingStep("results");

    const params = new URLSearchParams({
      origin,
      destination,
      date,
      passengers: String(passengers),
    });

    router.push(`/search/results?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Origin
        <input
          type="text"
          required
          value={origin}
          onChange={(event) => setOrigin(event.target.value.toUpperCase())}
          placeholder="LAX"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Destination
        <input
          type="text"
          required
          value={destination}
          onChange={(event) => setDestination(event.target.value.toUpperCase())}
          placeholder="SFO"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Departure date
        <input
          type="date"
          required
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
        />
      </label>
      <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
        Passengers
        <input
          type="number"
          min={1}
          max={6}
          value={passengers}
          onChange={(event) => setPassengers(Number(event.target.value))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
        />
      </label>
      <div className="sm:col-span-2">
        <button
          type="submit"
          className="w-full rounded-full bg-slate-900 px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Search flights
        </button>
      </div>
    </form>
  );
}
