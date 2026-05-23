"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type UserSession = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
  userId: string | null;
};

type BookingSummary = {
  id: string;
  pnrCode: string;
  origin: string;
  destination: string;
  status: string;
};

type UserStore = {
  session: UserSession | null;
  cachedBookings: BookingSummary[];
  setSession: (session: UserSession | null) => void;
  setCachedBookings: (bookings: BookingSummary[]) => void;
  resetUser: () => void;
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      session: null,
      cachedBookings: [],
      setSession: (session) => set({ session }),
      setCachedBookings: (bookings) => set({ cachedBookings: bookings }),
      resetUser: () => set({ session: null, cachedBookings: [] }),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        session: state.session,
      }),
    },
  ),
);
