import type { Product } from "@/app/types";

function isValidImageUrl(url: string | undefined): boolean {
  return typeof url === "string" && url.trim().length > 0;
}

export function getProductImages(product: Product): string[] {
  const fromImages = product.images?.filter(isValidImageUrl) ?? [];
  if (fromImages.length > 0) return fromImages;
  if (isValidImageUrl(product.image)) return [product.image];
  return [];
}

export function getProductImage(product: Product): string | null {
  const images = getProductImages(product);
  return images[0] ?? null;
}

export function getAllProductImageUrls(
  products: Product[],
  restaurantIcon?: string
): string[] {
  const urls = new Set<string>();
  for (const product of products) {
    for (const url of getProductImages(product)) {
      if (isValidImageUrl(url)) urls.add(url);
    }
  }
  if (isValidImageUrl(restaurantIcon)) urls.add(restaurantIcon!);
  return Array.from(urls);
}
