"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { FiClock, FiX } from "react-icons/fi";
import {
  isRestaurantOpen,
  getTodayHours,
  getBusinessHoursLines,
  getCurrentDayKey,
  isUserInRestaurantTimezone,
} from "@/app/lib/businessHours";
import type { BusinessHours } from "@/app/types";

interface BusinessHoursModalProps {
  businessHours?: BusinessHours | null;
  timezone?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function BusinessHoursModal({
  businessHours,
  timezone,
  isOpen,
  onClose,
}: BusinessHoursModalProps) {
  const [open, setOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const check = () => setOpen(isRestaurantOpen(businessHours, timezone));
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [businessHours, timezone]);

  if (!businessHours || !isOpen || !mounted) return null;

  const todayHours = getTodayHours(businessHours, timezone);
  const hoursLines = getBusinessHoursLines(businessHours);
  const todayKey = getCurrentDayKey(timezone);
  const sameTimezone = isUserInRestaurantTimezone(timezone);

  const modal = (
    <>
      <div
        className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed inset-x-4 top-1/2 z-[100] mx-auto max-w-sm -translate-y-1/2 rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
        role="dialog"
        aria-labelledby="horarios-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <FiClock className="h-5 w-5 text-neutral-500" />
            <h2 id="horarios-title" className="text-lg font-semibold text-neutral-900">
              Horários
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
            aria-label="Fechar"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        <div className="px-4 py-3">
          <div
            className={`mb-3 flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${open ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}
          >
            <span
              className={`size-2 shrink-0 rounded-full ${open ? "bg-emerald-500" : "bg-amber-500"}`}
            />
            <span className="font-medium">
              {open ? "Aberto" : "Fechado"} • Hoje: {todayHours}
            </span>
          </div>
          {!sameTimezone && timezone && (
            <p className="mb-3 text-xs text-neutral-500">
              Você está em outro fuso. Horários exibidos no fuso do restaurante.
            </p>
          )}
          <div className="divide-y divide-neutral-100 rounded-lg border border-neutral-100">
            {hoursLines.map(({ day, label, hours }) => {
              const isToday = day === todayKey;
              return (
                <div
                  key={day}
                  className={`flex items-center justify-between px-3 py-2.5 text-sm ${isToday ? "bg-neutral-50 font-medium" : ""}`}
                >
                  <span>
                    {label}
                    {isToday && (
                      <span className="ml-1 text-xs text-neutral-500">(hoje)</span>
                    )}
                  </span>
                  <span className="tabular-nums font-medium text-neutral-700">
                    {hours}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modal, document.body);
}
