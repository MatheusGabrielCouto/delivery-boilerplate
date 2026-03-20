"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FiPlus } from "react-icons/fi";
import { getProductImages } from "@/app/lib/productImages";
import type { Product } from "@/app/types";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  onDetail?: (product: Product) => void;
  index?: number;
}

export function ProductCard({ product, onAdd, onDetail, index = 0 }: ProductCardProps) {
  return (
    <motion.article
      role={onDetail ? "button" : undefined}
      tabIndex={onDetail ? 0 : undefined}
      onClick={onDetail ? () => onDetail(product) : undefined}
      onKeyDown={onDetail ? (e) => e.key === "Enter" && onDetail(product) : undefined}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`group flex flex-col overflow-hidden rounded-2xl border border-[var(--theme-secondary-soft)] bg-white shadow-sm transition-shadow hover:shadow-md hover:border-[var(--theme-secondary)] ${onDetail ? "cursor-pointer" : ""}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--theme-secondary-soft)]">
        <Image
          src={getProductImages(product)[0]}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="font-semibold text-[var(--theme-foreground)]">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-[var(--theme-foreground-muted)]">
          {product.description}
        </p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
          <span className="text-base font-bold text-[var(--theme-primary)] sm:text-lg">
            R$ {product.price.toFixed(2).replace(".", ",")}
          </span>
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(product);
            }}
            whileTap={{ scale: 0.95 }}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--theme-primary)] px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--theme-primary-hover)] active:opacity-90 sm:gap-2 sm:px-4 sm:py-2.5"
          >
            <FiPlus className="h-4 w-4" />
            Adicionar
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
