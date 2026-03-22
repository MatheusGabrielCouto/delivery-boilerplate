"use client";

import { useQuery } from "@tanstack/react-query";
import { rewardsApi } from "@/app/services/api";

export function useRewards() {
  return useQuery({
    queryKey: ["rewards"],
    queryFn: rewardsApi.list,
  });
}
