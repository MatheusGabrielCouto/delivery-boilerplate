"use client";

import { useEffect } from "react";
import { getAllProductImageUrls } from "@/app/lib/productImages";
import type { Product } from "@/app/types";

function preloadImage(src: string): void {
  if (!src.startsWith("/")) return;
  const img = new Image();
  img.src = src;
}

interface ImagePreloaderProps {
  children: React.ReactNode;
  products?: Product[];
  restaurantIcon?: string;
}

export function ImagePreloader({ children, products = [], restaurantIcon }: ImagePreloaderProps) {
  useEffect(() => {
    const urls = getAllProductImageUrls(products, restaurantIcon);
    urls.forEach(preloadImage);
  }, [products, restaurantIcon]);

  return <>{children}</>;
}
