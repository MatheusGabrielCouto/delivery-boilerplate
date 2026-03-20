import type { MenuData, Product } from "@/app/types";
import menuData from "@/data/products.json";

export function getProductImages(product: Product): string[] {
  if (product.images && product.images.length > 0) {
    return product.images;
  }
  return [product.image];
}

export function getAllProductImageUrls(): string[] {
  const data = menuData as MenuData;
  const urls = new Set<string>();
  for (const product of data.products) {
    for (const url of getProductImages(product)) {
      urls.add(url);
    }
  }
  if (data.restaurant?.icon) urls.add(data.restaurant.icon);
  return Array.from(urls);
}
