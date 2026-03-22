import axios from "axios";
import type {
  MenuResponse,
  CustomerResponse,
  LoyaltyBalanceResponse,
  Reward,
  ValidateCouponPayload,
  ValidateCouponResponse,
  CreateOrderPayload,
  CreateOrderResponse,
} from "@/app/types/api";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    "x-restaurant-id": process.env.NEXT_PUBLIC_RESTAURANT_ID ?? "",
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const menuApi = {
  get: () => api.get<MenuResponse>("/menu").then((r) => r.data),
};

export const customersApi = {
  getByPhone: (phone: string) =>
    api.get<CustomerResponse>(`/customers/${phone.replace(/\D/g, "")}`).then((r) => r.data),
};

export const loyaltyApi = {
  getBalance: (phone: string) =>
    api.get<LoyaltyBalanceResponse>(`/loyalty/balance/${phone.replace(/\D/g, "")}`).then((r) => r.data),
};

export const couponsApi = {
  validate: (payload: ValidateCouponPayload) =>
    api.post<ValidateCouponResponse>("/coupons/validate", payload).then((r) => r.data),
};

export const rewardsApi = {
  list: () => api.get<Reward[]>("/rewards").then((r) => r.data),
};

export const ordersApi = {
  create: (payload: CreateOrderPayload) =>
    api.post<CreateOrderResponse>("/orders", payload).then((r) => r.data),
};
