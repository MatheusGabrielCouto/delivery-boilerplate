"use client";

import { useState, useEffect } from "react";
import { FiClock } from "react-icons/fi";
import { isRestaurantOpen, getTodayHours } from "@/app/lib/businessHours";
import { BusinessHoursModal } from "@/app/components/BusinessHoursModal";
import type { BusinessHours } from "@/app/types";

interface BusinessHoursTriggerProps {
  businessHours?: BusinessHours | null;
  timezone?: string;
}

export function BusinessHoursTrigger({ businessHours, timezone }: BusinessHoursTriggerProps) {
  const [open, setOpen] = useState(false);
  const [isRestaurantOpenState, setIsRestaurantOpenState] = useState(true);

  useEffect(() => {
    const check = () => setIsRestaurantOpenState(isRestaurantOpen(businessHours, timezone));
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [businessHours, timezone]);

  if (!businessHours) return null;

  const todayHours = getTodayHours(businessHours, timezone);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-neutral-100 md:gap-2 md:px-2.5"
        aria-label={`Horários. ${isRestaurantOpenState ? "Aberto" : "Fechado"}. Hoje ${todayHours}`}
      >
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium md:text-xs ${isRestaurantOpenState ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
        >
          <span
            className={`size-1.5 shrink-0 rounded-full ${isRestaurantOpenState ? "bg-emerald-500" : "bg-amber-500"}`}
          />
          {isRestaurantOpenState ? "Aberto" : "Fechado"}
        </span>
        <FiClock className="h-4 w-4 shrink-0 text-neutral-400" />
      </button>
      <BusinessHoursModal
        businessHours={businessHours}
        timezone={timezone}
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
