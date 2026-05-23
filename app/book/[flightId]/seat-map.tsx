"use client";

import type { SeatClass, SeatRecord } from "@/lib/types";

type SeatMapProps = {
  seats: SeatRecord[];
  selectedSeatId: string;
  onSelect: (seatId: string) => void;
};

const CLASS_ORDER: SeatClass[] = ["first", "business", "economy"];

function parseRow(seatNumber: string) {
  const match = seatNumber.match(/^(\d+)([A-Z])$/);
  if (!match) return null;
  return { row: Number(match[1]), letter: match[2] };
}

function sortSeatsByLetter(seats: SeatRecord[]) {
  return [...seats].sort((a, b) => {
    const aLetter = parseRow(a.seat_number)?.letter ?? "";
    const bLetter = parseRow(b.seat_number)?.letter ?? "";
    return aLetter.localeCompare(bLetter);
  });
}

function getSeatButtonStyles(seat: SeatRecord, isSelected: boolean) {
  if (!seat.is_available) {
    return "bg-slate-200 text-slate-500 cursor-not-allowed";
  }
  if (isSelected) {
    return "bg-emerald-500 text-white ring-2 ring-emerald-300";
  }
  return "bg-white text-slate-700 border border-slate-200 hover:border-emerald-300 hover:text-emerald-600";
}

function groupRows(seats: SeatRecord[]) {
  const rows = new Map<number, SeatRecord[]>();

  seats.forEach((seat) => {
    const parsed = parseRow(seat.seat_number);
    if (!parsed) return;
    const existing = rows.get(parsed.row) ?? [];
    existing.push(seat);
    rows.set(parsed.row, existing);
  });

  return Array.from(rows.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([row, rowSeats]) => ({ row, seats: sortSeatsByLetter(rowSeats) }));
}

function splitRowSeats(rowSeats: SeatRecord[]) {
  const letters = rowSeats.map(
    (seat) => parseRow(seat.seat_number)?.letter ?? "",
  );
  const hasSix = letters.includes("F") || letters.includes("E");
  const leftLetters = hasSix ? ["A", "B", "C"] : ["A", "B"];
  const rightLetters = hasSix ? ["D", "E", "F"] : ["C", "D"];

  const left = rowSeats.filter((seat) =>
    leftLetters.includes(parseRow(seat.seat_number)?.letter ?? ""),
  );
  const right = rowSeats.filter((seat) =>
    rightLetters.includes(parseRow(seat.seat_number)?.letter ?? ""),
  );

  return { left, right };
}

export default function SeatMap({
  seats,
  selectedSeatId,
  onSelect,
}: SeatMapProps) {
  const seatsByClass = CLASS_ORDER.map((className) => ({
    className,
    rows: groupRows(seats.filter((seat) => seat.class === className)),
  }));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4">
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded border border-slate-200 bg-white" />
          Available
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-emerald-500" /> Selected
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-slate-200" /> Occupied
        </span>
      </div>

      <div className="mt-4 max-h-[60vh] space-y-6 overflow-y-auto overflow-x-auto pr-2">
        {seatsByClass.map(({ className, rows }) => (
          <div key={className} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              {className} cabin
            </p>
            <div className="space-y-2">
              {rows.map((row) => {
                const { left, right } = splitRowSeats(row.seats);
                return (
                  <div key={row.row} className="flex items-center gap-3">
                    <span className="w-8 text-xs text-slate-400">
                      {row.row}
                    </span>
                    <div className="flex items-center gap-1">
                      {left.map((seat) => {
                        const isSelected = seat.id === selectedSeatId;
                        return (
                          <button
                            key={seat.id}
                            type="button"
                            disabled={!seat.is_available}
                            title={`${seat.class} · +$${Number(seat.extra_fee).toFixed(2)}`}
                            onClick={() => onSelect(seat.id)}
                            className={`flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-semibold transition ${getSeatButtonStyles(
                              seat,
                              isSelected,
                            )}`}
                          >
                            {seat.seat_number}
                          </button>
                        );
                      })}
                    </div>
                    <span className="w-4" />
                    <div className="flex items-center gap-1">
                      {right.map((seat) => {
                        const isSelected = seat.id === selectedSeatId;
                        return (
                          <button
                            key={seat.id}
                            type="button"
                            disabled={!seat.is_available}
                            title={`${seat.class} · +$${Number(seat.extra_fee).toFixed(2)}`}
                            onClick={() => onSelect(seat.id)}
                            className={`flex h-9 w-9 items-center justify-center rounded-xl text-[10px] font-semibold transition ${getSeatButtonStyles(
                              seat,
                              isSelected,
                            )}`}
                          >
                            {seat.seat_number}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
