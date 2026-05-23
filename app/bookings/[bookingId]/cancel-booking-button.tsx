"use client";

import { useActionState } from "react";
import { cancelBookingAction } from "@/app/actions/bookings";
import { useFlightStore } from "@/lib/stores/flight-store";
import type { ActionState } from "@/lib/types";

const initialState: ActionState = { error: "" };

export default function CancelBookingButton({
  bookingId,
}: {
  bookingId: string;
}) {
  const [state, formAction, isPending] = useActionState(
    cancelBookingAction,
    initialState,
  );
  const resetBooking = useFlightStore((store) => store.resetBooking);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm("Cancel this booking? This cannot be undone.")) {
          event.preventDefault();
          return;
        }
        resetBooking();
      }}
      className="grid gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-5"
    >
      <input type="hidden" name="bookingId" value={bookingId} />
      <div>
        <h2 className="text-sm font-semibold text-rose-700">Cancel booking</h2>
      </div>

      {state.error ? (
        <p className="rounded-lg bg-white/80 px-3 py-2 text-xs text-rose-700">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:-translate-y-0.5 hover:bg-rose-500 disabled:opacity-60"
      >
        {isPending ? "Cancelling..." : "Cancel booking"}
      </button>
    </form>
  );
}
