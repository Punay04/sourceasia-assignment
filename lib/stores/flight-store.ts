"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type BookingStep = "search" | "results" | "seat" | "passenger" | "confirmation";

type SearchQuery = {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
};

type SelectedFlight = {
  id: string;
  flightNo: string;
  origin: string;
  destination: string;
  departsAt: string;
  arrivesAt: string;
  aircraftType: string;
  basePrice: number;
};

type SelectedSeat = {
  id: string;
  seatNumber: string;
  class: "economy" | "business" | "first";
  extraFee: number;
};

type PassengerForm = {
  fullName: string;
  passportNo: string;
  nationality: string;
  dob: string;
};

type FlightStore = {
  searchQuery: SearchQuery | null;
  selectedFlight: SelectedFlight | null;
  selectedSeat: SelectedSeat | null;
  bookingStep: BookingStep;
  passengerForm: PassengerForm;
  setSearchQuery: (query: SearchQuery) => void;
  setSelectedFlight: (flight: SelectedFlight | null) => void;
  setSelectedSeat: (seat: SelectedSeat | null) => void;
  setBookingStep: (step: BookingStep) => void;
  setPassengerForm: (form: Partial<PassengerForm>) => void;
  resetBooking: () => void;
};

const initialPassengerForm: PassengerForm = {
  fullName: "",
  passportNo: "",
  nationality: "",
  dob: "",
};

export const useFlightStore = create<FlightStore>()(
  persist(
    (set) => ({
      searchQuery: null,
      selectedFlight: null,
      selectedSeat: null,
      bookingStep: "search",
      passengerForm: initialPassengerForm,
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),
      setSelectedSeat: (seat) => set({ selectedSeat: seat }),
      setBookingStep: (step) => set({ bookingStep: step }),
      setPassengerForm: (form) =>
        set((state) => ({
          passengerForm: { ...state.passengerForm, ...form },
        })),
      resetBooking: () =>
        set({
          searchQuery: null,
          selectedFlight: null,
          selectedSeat: null,
          bookingStep: "search",
          passengerForm: initialPassengerForm,
        }),
    }),
    {
      name: "flight-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        bookingStep: state.bookingStep,
        passengerForm: {
          ...state.passengerForm,
          passportNo: "",
        },
      }),
    },
  ),
);
