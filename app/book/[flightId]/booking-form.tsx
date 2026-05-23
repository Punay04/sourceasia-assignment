"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { reserveSeatAction } from "@/app/actions/booking";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import SeatMap from "@/app/book/[flightId]/seat-map";
import { useFlightStore } from "@/lib/stores/flight-store";
import type { ActionState, FlightPrice, SeatRecord } from "@/lib/types";

const initialState: ActionState = { error: "" };

export default function BookingForm({
  flight,
  seats,
}: {
  flight: FlightPrice;
  seats: SeatRecord[];
}) {
  const [seatState, setSeatState] = useState<SeatRecord[]>(seats);
  const [selectedSeatId, setSelectedSeatId] = useState(
    seats.find((seat) => seat.is_available)?.id ?? "",
  );
  const passengerForm = useFlightStore((state) => state.passengerForm);
  const setPassengerForm = useFlightStore((state) => state.setPassengerForm);
  const setSelectedSeat = useFlightStore((state) => state.setSelectedSeat);
  const setBookingStep = useFlightStore((state) => state.setBookingStep);
  const [state, formAction, isPending] = useActionState(
    reserveSeatAction,
    initialState,
  );

  const resolvedSeatId = useMemo(() => {
    const stillAvailable = seatState.find(
      (seat) => seat.id === selectedSeatId && seat.is_available,
    );
    if (stillAvailable) {
      return selectedSeatId;
    }
    const nextSeat = seatState.find((seat) => seat.is_available);
    return nextSeat?.id ?? "";
  }, [seatState, selectedSeatId]);

  const selectedSeat = useMemo(
    () => seatState.find((seat) => seat.id === resolvedSeatId),
    [seatState, resolvedSeatId],
  );

  useEffect(() => {
    setBookingStep("seat");
  }, [setBookingStep]);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel(`seats:${flight.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "seats",
          filter: `flight_id=eq.${flight.id}`,
        },
        (payload) => {
          const updatedSeat = payload.new as SeatRecord;
          setSeatState((current) => {
            const existingIndex = current.findIndex(
              (seat) => seat.id === updatedSeat.id,
            );
            if (existingIndex === -1) {
              return [...current, updatedSeat];
            }
            return current.map((seat) =>
              seat.id === updatedSeat.id ? updatedSeat : seat,
            );
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [flight.id]);

  useEffect(() => {
    if (!selectedSeat) {
      setSelectedSeat(null);
      return;
    }

    setSelectedSeat({
      id: selectedSeat.id,
      seatNumber: selectedSeat.seat_number,
      class: selectedSeat.class,
      extraFee: Number(selectedSeat.extra_fee),
    });
  }, [selectedSeat, setSelectedSeat]);

  const totalPrice =
    Number(flight.base_price) + Number(selectedSeat?.extra_fee ?? 0);

  const hasAvailableSeat = seatState.some((seat) => seat.is_available);

  return (
    <form action={formAction} className="grid gap-6">
      <input type="hidden" name="flightId" value={flight.id} />
      <input type="hidden" name="seatId" value={resolvedSeatId} />

      <div className="grid gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Select a seat
          </h2>
          <p className="text-xs text-slate-500">
            Tap any available seat to reserve it.
          </p>
        </div>
        <SeatMap
          seats={seatState}
          selectedSeatId={resolvedSeatId}
          onSelect={(seatId) => setSelectedSeatId(seatId)}
        />
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-white/70 p-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Full name
          <input
            name="fullName"
            required
            value={passengerForm.fullName}
            onChange={(event) =>
              setPassengerForm({ fullName: event.target.value })
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Passport number
          <input
            name="passportNo"
            required
            value={passengerForm.passportNo}
            onChange={(event) =>
              setPassengerForm({ passportNo: event.target.value })
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Nationality
          <input
            name="nationality"
            required
            value={passengerForm.nationality}
            onChange={(event) =>
              setPassengerForm({ nationality: event.target.value })
            }
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Date of birth
          <input
            type="date"
            name="dob"
            required
            value={passengerForm.dob}
            onChange={(event) => setPassengerForm({ dob: event.target.value })}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 focus:border-slate-400 focus:outline-none"
          />
        </label>
      </div>

      {!hasAvailableSeat ? (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          All seats are currently occupied for this flight.
        </p>
      ) : null}

      {state.error ? (
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-600">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4 text-sm text-slate-600">
        <div className="flex items-center justify-between">
          <span>Base fare</span>
          <span>${Number(flight.base_price).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Seat fee</span>
          <span>${Number(selectedSeat?.extra_fee ?? 0).toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold text-slate-900">
          <span>Total</span>
          <span>${totalPrice.toFixed(2)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !resolvedSeatId || !hasAvailableSeat}
        className="rounded-full bg-slate-900 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-60"
      >
        {isPending ? "Confirming..." : "Confirm booking"}
      </button>
    </form>
  );
}
