import type { MenuResponse } from "@/app/types/api";

export async function fetchMenu(): Promise<MenuResponse | null> {
  const apiUrl = process.env.API_URL ?? "http://localhost:4000";
  const restaurantId = process.env.RESTAURANT_ID ?? "";

  try {
    const res = await fetch(`${apiUrl}/menu`, {
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
