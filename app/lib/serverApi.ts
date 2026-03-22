import { cookies } from "next/headers";
import type {
  CustomerResponse,
  LoyaltyBalanceResponse,
  Reward,
  ValidateCouponPayload,
  ValidateCouponResponse,
  CreateOrderPayload,
  CreateOrderResponse,
} from "@/app/types/api";

const TOKEN_COOKIE = "delivery_token";

function getHeaders(): Record<string, string> {
  const apiUrl = process.env.API_URL ?? "http://localhost:4000";
  const restaurantId = process.env.RESTAURANT_ID ?? "";
  return {
    "Content-Type": "application/json",
    "x-restaurant-id": restaurantId,
  };
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const headers = getHeaders();
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

function getBaseUrl(): string {
  return process.env.API_URL ?? "http://localhost:4000";
}

export async function fetchCustomer(phone: string): Promise<CustomerResponse | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${getBaseUrl()}/customers/${phone.replace(/\D/g, "")}`, {
      headers,
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Erro ao buscar cliente");
    return res.json();
  } catch {
    return null;
  }
}

export async function fetchLoyaltyBalance(phone: string): Promise<LoyaltyBalanceResponse> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${getBaseUrl()}/loyalty/balance/${phone.replace(/\D/g, "")}`, {
      headers,
      next: { revalidate: 60 },
    });
    if (res.status === 404) return { points: 0 };
    if (!res.ok) throw new Error("Erro ao buscar pontos");
    return res.json();
  } catch {
    return { points: 0 };
  }
}

export async function fetchRewards(): Promise<Reward[]> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(`${getBaseUrl()}/rewards`, {
      headers,
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Erro ao buscar recompensas");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function validateCoupon(payload: ValidateCouponPayload): Promise<ValidateCouponResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getBaseUrl()}/coupons/validate`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Erro ao validar cupom");
  return data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<CreateOrderResponse> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${getBaseUrl()}/orders`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message ?? "Erro ao criar pedido");
  return data;
}
