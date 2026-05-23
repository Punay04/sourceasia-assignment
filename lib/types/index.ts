export type ActionState = {
  error: string;
};

export type SeatClass = "economy" | "business" | "first";

export type FlightRecord = {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: string;
  base_price: number;
};

export type FlightDetails = Pick<
  FlightRecord,
  | "id"
  | "flight_no"
  | "origin"
  | "destination"
  | "departs_at"
  | "arrives_at"
  | "aircraft_type"
  | "base_price"
>;

export type FlightPrice = Pick<FlightRecord, "id" | "base_price">;

export type SeatRecord = {
  id: string;
  seat_number: string;
  class: SeatClass;
  extra_fee: number;
  is_available: boolean;
};
