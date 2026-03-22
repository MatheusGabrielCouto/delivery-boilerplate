"use client";

import { useQuery } from "@tanstack/react-query";
import { loyaltyApi } from "@/app/services/api";

export function useLoyalty(phone: string | undefined) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  const query = useQuery({
    queryKey: ["loyalty", digits],
    queryFn: async () => {
      try {
        return await loyaltyApi.getBalance(digits);
      } catch (e: unknown) {
        if (e && typeof e === "object" && "response" in e && (e as { response?: { status?: number } }).response?.status === 404) {
          return { points: 0 };
        }
        throw e;
      }
    },
    enabled: digits.length >= 10,
  });

  return {
    ...query,
    points: query.data?.points ?? 0,
  };
}
