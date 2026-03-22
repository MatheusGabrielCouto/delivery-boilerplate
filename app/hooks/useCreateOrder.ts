"use client";

import { useMutation } from "@tanstack/react-query";
import { ordersApi } from "@/app/services/api";
import type { CreateOrderPayload } from "@/app/types/api";

export function useCreateOrder() {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersApi.create(payload),
  });
}
