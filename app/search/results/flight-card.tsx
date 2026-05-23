"use client";

import { useRouter } from "next/navigation";
import { useFlightStore } from "@/lib/stores/flight-store";
import type { FlightRecord } from "@/lib/types";

type FlightCardProps = {
  flight: FlightRecord;
  passengers: number;
  durationLabel: string;
  departLabel: string;
  arriveLabel: string;
};

export default function FlightCard({
  flight,
  passengers,
  durationLabel,
  departLabel,
  arriveLabel,
}: FlightCardProps) {
  const router = useRouter();
  const setSelectedFlight = useFlightStore((state) => state.setSelectedFlight);
  const setBookingStep = useFlightStore((state) => state.setBookingStep);

  const handleSelect = () => {
    setSelectedFlight({
      id: flight.id,
      flightNo: flight.flight_no,
      origin: flight.origin,
      destination: flight.destination,
      departsAt: flight.departs_at,
      arrivesAt: flight.arrives_at,
      aircraftType: flight.aircraft_type,
      basePrice: Number(flight.base_price),
    });
    setBookingStep("seat");
    router.push(`/book/${flight.id}?passengers=${passengers}`);
  };

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_26px_70px_-60px_rgba(15,23,42,0.5)] backdrop-blur sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,165,0.12),_transparent_60%)] opacity-0 transition group-hover:opacity-100" />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            {flight.status}
          </p>
          <p className="text-lg font-semibold text-slate-900">
            {flight.flight_no} · {flight.aircraft_type}
          </p>
          <p className="text-xs text-slate-500">
            {flight.origin} → {flight.destination}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700">
          <div>
            <p className="text-xs text-slate-400">Depart</p>
            <p className="font-semibold">{departLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Arrive</p>
            <p className="font-semibold">{arriveLabel}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Duration</p>
            <p className="font-semibold">{durationLabel}</p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <p className="text-xl font-semibold text-slate-900">
            ${Number(flight.base_price).toFixed(2)}
          </p>
          <button
            type="button"
            onClick={handleSelect}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
          >
            Select
          </button>
        </div>
      </div>
    </article>
  );
}
