import type { MenuResponse } from "@/app/types/api";
import { getApiBaseUrl } from "@/app/lib/apiConfig";

export async function fetchMenu(): Promise<MenuResponse | null> {
  const restaurantId = process.env.RESTAURANT_ID ?? "";

  try {
    const res = await fetch(`${getApiBaseUrl()}/menu`, {
      headers: {
        "Content-Type": "application/json",
        "x-restaurant-id": restaurantId,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
