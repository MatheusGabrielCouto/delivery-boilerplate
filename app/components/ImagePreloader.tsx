"use client";

import { useEffect } from "react";
import { getAllProductImageUrls } from "@/app/lib/productImages";

function preloadImage(src: string): void {
  if (!src.startsWith("/")) return;
  const img = new Image();
  img.src = src;
}

export function ImagePreloader({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const urls = getAllProductImageUrls();
    urls.forEach(preloadImage);
  }, []);

  return <>{children}</>;
}
