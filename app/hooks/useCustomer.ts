"use client";

import { useQuery } from "@tanstack/react-query";
import { customersApi } from "@/app/services/api";

const PHONE_STORAGE_KEY = "delivery_phone";

export function getStoredPhone(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(PHONE_STORAGE_KEY) ?? "";
}

export function setStoredPhone(phone: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PHONE_STORAGE_KEY, phone.replace(/\D/g, ""));
}

export function useCustomer(phone: string | undefined) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  const query = useQuery({
    queryKey: ["customer", digits],
    queryFn: async () => {
      try {
        return await customersApi.getByPhone(digits);
      } catch (e: unknown) {
        if (e && typeof e === "object" && "response" in e && (e as { response?: { status?: number } }).response?.status === 404) {
          return null;
        }
        throw e;
      }
    },
    enabled: digits.length >= 10,
  });

  return {
    ...query,
    customer: query.data ?? null,
    isExisting: query.isSuccess && !!query.data,
  };
}
