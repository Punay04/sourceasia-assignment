"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const STORAGE_KEY = "flightdesk-install-dismissed";

export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const alreadyDismissed = window.localStorage.getItem(STORAGE_KEY);
      if (alreadyDismissed) {
        return;
      }

      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    await promptEvent.userChoice;
    setIsVisible(false);
    window.localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleDismiss = () => {
    setIsVisible(false);
    window.localStorage.setItem(STORAGE_KEY, "true");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="border-b border-white/20 bg-slate-950 text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300">
            Install
          </p>
          <p className="text-sm font-semibold">FlightDesk works offline.</p>
          <p className="text-xs text-slate-300">
            Add the app to your home screen for faster bookings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleInstall}
            className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-widest text-slate-900"
          >
            Install
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="text-xs font-semibold uppercase tracking-widest text-slate-300"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
