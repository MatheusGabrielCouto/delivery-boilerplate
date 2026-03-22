"use client";

import { useMutation } from "@tanstack/react-query";
import { couponsApi } from "@/app/services/api";
import type { ValidateCouponPayload } from "@/app/types/api";

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (payload: ValidateCouponPayload) => couponsApi.validate(payload),
  });
}
