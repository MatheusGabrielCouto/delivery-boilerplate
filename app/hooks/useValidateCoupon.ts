"use client";

import { useMutation } from "@tanstack/react-query";
import { validateCouponAction } from "@/app/actions/api";
import type { ValidateCouponPayload } from "@/app/types/api";

export function useValidateCoupon() {
  return useMutation({
    mutationFn: (payload: ValidateCouponPayload) => validateCouponAction(payload),
  });
}
