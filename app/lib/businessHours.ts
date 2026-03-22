import moment from "moment-timezone";
import type { BusinessHours, DayKey } from "@/app/types";

const DAY_ORDER: DayKey[] = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DAY_LABELS: Record<DayKey, string> = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

function getNowInTimezone(timezone?: string): { day: number; minutes: number } {
  const tz = timezone && moment.tz.zone(timezone) ? timezone : undefined;
  const m = tz ? moment().tz(tz) : moment();
  return {
    day: m.day(),
    minutes: m.hours() * 60 + m.minutes(),
  };
}

export function isUserInRestaurantTimezone(timezone?: string): boolean {
  if (!timezone || !moment.tz.zone(timezone)) return true;
  const userTz = moment.tz.guess();
  return userTz === timezone;
}

export function getCurrentDayKey(timezone?: string): DayKey {
  const { day } = getNowInTimezone(timezone);
  return DAY_ORDER[day === 0 ? 6 : day - 1] as DayKey;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function isTimeBetween(now: number, open: string, close: string): boolean {
  const openMin = toMinutes(open);
  const closeMin = toMinutes(close);
  if (closeMin <= openMin) return now >= openMin || now < closeMin;
  return now >= openMin && now < closeMin;
}

export function isRestaurantOpen(
  businessHours?: BusinessHours | null,
  timezone?: string
): boolean {
  if (!businessHours) return true;
  const { day, minutes: now } = getNowInTimezone(timezone);
  const dayKey = DAY_ORDER[day === 0 ? 6 : day - 1] as DayKey;
  const hours = businessHours[dayKey];
  if (!hours || !hours.open || !hours.close) return false;
  return isTimeBetween(now, hours.open, hours.close);
}

export function getBusinessHoursLines(
  businessHours?: BusinessHours | null
): { day: DayKey; label: string; hours: string }[] {
  if (!businessHours) return [];
  return DAY_ORDER.map((day) => {
    const h = businessHours[day];
    const hours = h ? `${h.open} às ${h.close}` : "Fechado";
    return { day, label: DAY_LABELS[day], hours };
  });
}

export function getTodayHours(
  businessHours?: BusinessHours | null,
  timezone?: string
): string {
  if (!businessHours) return "";
  const dayKey = getCurrentDayKey(timezone);
  const hours = businessHours[dayKey];
  if (!hours || !hours.open || !hours.close) return "Fechado";
  return `${hours.open} às ${hours.close}`;
}
