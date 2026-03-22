"use client";

import { useMutation } from "@tanstack/react-query";
import { createOrderAction } from "@/app/actions/api";
import type { CreateOrderPayload } from "@/app/types/api";

export function useCreateOrder() {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrderAction(payload),
  });
}
