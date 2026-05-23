"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "@/app/components/logout-button";

type SiteHeaderClientProps = {
  userEmail?: string | null;
};

export default function SiteHeaderClient({ userEmail }: SiteHeaderClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/40 bg-white/70 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-semibold text-slate-900"
            onClick={handleNavClick}
          >
            <span className="font-display text-xl text-gradient">
              FlightDesk
            </span>
          </Link>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900 sm:hidden"
            aria-expanded={isOpen}
            aria-controls="primary-nav"
            onClick={() => setIsOpen((current) => !current)}
          >
            {isOpen ? "Close" : "Menu"}
          </button>
        </div>

        <nav
          id="primary-nav"
          className={`${isOpen ? "flex" : "hidden"} mt-3 flex-col gap-3 text-xs font-semibold text-slate-600 sm:mt-0 sm:flex sm:flex-row sm:items-center sm:justify-end sm:text-sm`}
        >
          <Link
            href="/search"
            className="transition hover:text-slate-900"
            onClick={handleNavClick}
          >
            Search
          </Link>
          <Link
            href="/bookings"
            className="transition hover:text-slate-900"
            onClick={handleNavClick}
          >
            My bookings
          </Link>
          {userEmail ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-xs text-slate-500">{userEmail}</span>
              <div onClick={handleNavClick}>
                <LogoutButton />
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              onClick={handleNavClick}
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
