import type { Category, MenuData, Product } from "@/app/types";
import menuData from "@/data/products.json";

export function getMenuData(): MenuData {
  return menuData as MenuData;
}

export function getProductsByCategory(categoryId: string) {
  const { products } = getMenuData();
  return products
    .filter((p) => p.categoryId === categoryId && p.available)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCategoriesWithProducts(): { category: Category; products: Product[] }[] {
  const { categories, products } = getMenuData();
  const sorted = [...categories].sort((a, b) => a.order - b.order);
  return sorted
    .map((category) => ({
      category,
      products: products
        .filter((p) => p.categoryId === category.id && p.available)
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .filter(({ products: p }) => p.length > 0);
}
