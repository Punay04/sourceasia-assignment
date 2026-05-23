"use client";

import { useActionState, useMemo, useState } from "react";
import { rescheduleBookingAction } from "@/app/actions/bookings";
import type { ActionState } from "@/lib/types";

type RescheduleOption = {
  flightId: string;
  flightNo: string;
  departsAt: string;
  arrivesAt: string;
  basePrice: number;
  seatId: string;
  seatFee: number;
};

const initialState: ActionState = { error: "" };

function formatDateTime(value: string) {
  const date = new Date(value);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RescheduleForm({
  bookingId,
  options,
}: {
  bookingId: string;
  options: RescheduleOption[];
}) {
  const [selectedFlightId, setSelectedFlightId] = useState(
    options[0]?.flightId ?? "",
  );
  const [state, formAction, isPending] = useActionState(
    rescheduleBookingAction,
    initialState,
  );

  const selected = useMemo(
    () => options.find((option) => option.flightId === selectedFlightId),
    [options, selectedFlightId],
  );

  const estimatedTotal =
    Number(selected?.basePrice ?? 0) + Number(selected?.seatFee ?? 0);

  return (
    <form
      action={formAction}
      className="grid gap-4 rounded-2xl border border-slate-200 bg-white/70 p-5"
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="newFlightId" value={selectedFlightId} />
      <input type="hidden" name="newSeatId" value={selected?.seatId ?? ""} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Reschedule flight
          </h2>
          <p className="text-xs text-slate-500">
            Choose another flight on the same route.
          </p>
        </div>
      </div>

      {options.length === 0 ? (
        <p className="text-sm text-slate-500">
          No alternative flights with available seats are currently available.
        </p>
      ) : (
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Available options
          <select
            value={selectedFlightId}
            onChange={(event) => setSelectedFlightId(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
          >
            {options.map((option) => (
              <option key={option.flightId} value={option.flightId}>
                {option.flightNo} · {formatDateTime(option.departsAt)}
              </option>
            ))}
          </select>
        </label>
      )}

      {selected ? (
        <p className="text-xs text-slate-500">
          Estimated total ${estimatedTotal.toFixed(2)} · Seat fee +$
          {Number(selected.seatFee).toFixed(2)}
        </p>
      ) : null}

      {state.error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending || options.length === 0}
        className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60"
      >
        {isPending ? "Rescheduling..." : "Reschedule booking"}
      </button>
    </form>
  );
}
