"use client";

import { useQuery } from "@tanstack/react-query";
import { getCookie, setCookie } from "@/app/lib/cookies";
import { getCustomerAction } from "@/app/actions/api";

const PHONE_COOKIE = "delivery_phone";

export function getStoredPhone(): string {
  return getCookie(PHONE_COOKIE);
}

export function setStoredPhone(phone: string): void {
  const digits = phone.replace(/\D/g, "");
  if (digits) setCookie(PHONE_COOKIE, digits);
}

export function useCustomer(phone: string | undefined) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  const query = useQuery({
    queryKey: ["customer", digits],
    queryFn: () => getCustomerAction(digits),
    enabled: digits.length >= 10,
  });

  return {
    ...query,
    customer: query.data ?? null,
    isExisting: query.isSuccess && !!query.data,
  };
}
