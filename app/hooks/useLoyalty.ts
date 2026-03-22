"use client";

import { useQuery } from "@tanstack/react-query";
import { getLoyaltyBalanceAction } from "@/app/actions/api";

export function useLoyalty(phone: string | undefined) {
  const digits = phone?.replace(/\D/g, "") ?? "";
  const query = useQuery({
    queryKey: ["loyalty", digits],
    queryFn: () => getLoyaltyBalanceAction(digits),
    enabled: digits.length >= 10,
  });

  return {
    ...query,
    points: query.data?.points ?? 0,
  };
}
