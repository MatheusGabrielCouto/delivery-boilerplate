"use client";

import { useQuery } from "@tanstack/react-query";
import { getRewardsAction } from "@/app/actions/api";

export function useRewards() {
  return useQuery({
    queryKey: ["rewards"],
    queryFn: getRewardsAction,
    staleTime: Infinity,
  });
}
