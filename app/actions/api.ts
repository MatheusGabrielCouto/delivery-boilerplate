"use server";

import { cookies } from "next/headers";
import {
  fetchCustomer,
  fetchLoyaltyBalance,
  fetchRewards,
  validateCoupon as validateCouponApi,
  createOrder as createOrderApi,
  fetchOrderTracking as fetchOrderTrackingApi,
  fetchOrdersInProgress as fetchOrdersInProgressApi,
} from "@/app/lib/serverApi";
import { fetchMenu } from "@/app/lib/serverMenu";
import type { MenuResponse } from "@/app/types/api";
import type {
  CustomerResponse,
  ValidateCouponPayload,
  CreateOrderPayload,
  OrderTrackingResponse,
} from "@/app/types/api";

export async function getMenuAction(): Promise<MenuResponse | null> {
  return fetchMenu();
}

export async function getOrderTrackingAction(
  orderId: string,
  phone: string
): Promise<OrderTrackingResponse | null> {
  return fetchOrderTrackingApi(orderId, phone);
}

export async function getOrdersInProgressAction(
  phone: string
): Promise<OrderTrackingResponse[]> {
  return fetchOrdersInProgressApi(phone);
}

export async function getCustomerAction(phone: string): Promise<CustomerResponse | null> {
  return fetchCustomer(phone);
}

export async function getLoyaltyBalanceAction(phone: string): Promise<{ points: number }> {
  return fetchLoyaltyBalance(phone);
}

export async function getRewardsAction() {
  return fetchRewards();
}

export async function validateCouponAction(payload: ValidateCouponPayload) {
  return validateCouponApi(payload);
}

export async function createOrderAction(payload: CreateOrderPayload) {
  return createOrderApi(payload);
}

export async function setTokenAction(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("delivery_token", token, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

export async function clearTokenAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("delivery_token");
}
