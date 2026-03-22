"use client";

import { useQuery } from "@tanstack/react-query";
import type { MenuResponse } from "@/app/types/api";
import type { BusinessHours, Category, Product } from "@/app/types";

interface CategoryWithProducts {
  id: string;
  name: string;
  order: number;
  products?: Product[];
}

function normalizeProduct(p: Record<string, unknown>): Product {
  const onSale = (p.onSale ?? (p as { on_sale?: boolean }).on_sale) === true;
  const price = Number(p.price) || 0;
  const discountPriceRaw = p.discountPrice ?? (p as { discount_price?: unknown }).discount_price;
  const discountPrice = discountPriceRaw != null ? Number(discountPriceRaw) : undefined;
  return {
    id: String(p.id ?? ""),
    name: String(p.name ?? ""),
    description: String(p.description ?? ""),
    price,
    discountPrice: onSale && discountPrice != null && !Number.isNaN(discountPrice) ? discountPrice : undefined,
    onSale,
    image: String(p.image ?? (Array.isArray(p.images) && p.images[0] ? p.images[0] : "")),
    images: Array.isArray(p.images) ? (p.images as string[]) : undefined,
    categoryId: String((p as { categoryId?: string }).categoryId ?? (p as { category_id?: string }).category_id ?? ""),
    available: (p as { available?: boolean }).available !== false,
  };
}

function buildCategorySections(data: Record<string, unknown>): { category: Category; products: Product[] }[] {
  const categories = data.categories as CategoryWithProducts[] | undefined;
  const flatProducts = data.products as Product[] | undefined;

  if (!categories?.length) return [];

  const sorted = [...categories].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  if (Array.isArray(flatProducts) && flatProducts.length > 0) {
    return sorted
      .map((cat) => ({
        category: { id: cat.id, name: cat.name, order: cat.order ?? 0 },
        products: flatProducts
          .map((p) => (typeof p === "object" && p !== null ? normalizeProduct(p as unknown as Record<string, unknown>) : p))
          .filter((p) => p.categoryId === cat.id && p.available)
          .sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .filter(({ products: p }) => p.length > 0);
  }

  return sorted
    .filter((cat) => Array.isArray(cat.products) && cat.products.length > 0)
    .map((cat) => ({
      category: { id: cat.id, name: cat.name, order: cat.order ?? 0 },
      products: (cat.products ?? []).map((p) =>
        typeof p === "object" && p !== null ? normalizeProduct(p as unknown as Record<string, unknown>) : normalizeProduct({})
      ).sort((a, b) => a.name.localeCompare(b.name)),
    }));
}

export function useMenu() {
  const query = useQuery<MenuResponse | undefined>({
    queryKey: ["menu"],
    queryFn: () => Promise.reject(new Error("Menu deve ser carregado pelo servidor")),
    staleTime: Infinity,
  });

  const categorySections = query.data
    ? buildCategorySections(query.data as unknown as Record<string, unknown>)
    : [];

  const raw = query.data?.restaurant as Record<string, unknown> | undefined;
  const restaurant: MenuResponse["restaurant"] | undefined = raw
    ? {
        name: String(raw.name ?? ""),
        description: String(raw.description ?? ""),
        whatsapp: String(raw.whatsapp ?? ""),
        icon: raw.icon != null ? String(raw.icon) : undefined,
        deliveryFee: raw.deliveryFee != null ? Number(raw.deliveryFee) : undefined,
        businessHours: (raw.businessHours ?? raw.business_hours) as BusinessHours | undefined,
        timezone: (raw.timezone ?? raw.time_zone) as string | undefined,
      }
    : undefined;

  return {
    ...query,
    menu: query.data,
    categorySections,
    restaurant,
    theme: query.data?.theme,
    footer: query.data?.footer,
  };
}
