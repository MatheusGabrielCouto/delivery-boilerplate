"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiMinus, FiPlus } from "react-icons/fi";
import { ImageCarousel } from "@/app/components/ImageCarousel";
import { getProductImages } from "@/app/lib/productImages";
import type { Product } from "@/app/types";
import { getEffectivePrice } from "@/app/types";

interface ProductDetailProps {
  product: Product | null;
  onClose: () => void;
  onAdd: (product: Product, quantity: number) => void;
}

export function ProductDetail({ product, onClose, onAdd }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setQuantity(1);
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [product]);

  const handleAdd = () => {
    if (product) {
      onAdd(product, quantity);
      onClose();
    }
  };

  if (!product) return null;

  const effectivePrice = getEffectivePrice(product);
  const hasPromo = product.onSale && product.discountPrice != null;
  const economia = hasPromo ? (product.price - product.discountPrice!) * quantity : 0;

  return (
    <AnimatePresence>
      <motion.div
        key={product.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center sm:p-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-xl md:max-w-xl"
        >
          <div className="relative shrink-0">
            {hasPromo && (
              <span className="absolute left-4 top-3 z-10 rounded-lg bg-[var(--theme-primary)] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                Promoção
              </span>
            )}
            <ImageCarousel
              images={getProductImages(product)}
              alt={product.name}
              aspectRatio="16/10"
              imageClassName="object-cover"
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-neutral-600 shadow-sm transition-colors hover:bg-white hover:text-neutral-800"
              aria-label="Fechar"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="flex flex-1 flex-col overflow-y-auto p-6">
            <h2 className="text-xl font-semibold text-neutral-900 md:text-2xl">
              {product.name}
            </h2>
            <p className="mt-2 text-neutral-600">{product.description}</p>

            {hasPromo && (
              <div className="mt-4 rounded-xl bg-[var(--theme-secondary-soft)] p-4 md:mt-5 md:flex md:items-center md:justify-between md:gap-4 md:p-5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 md:gap-x-3">
                  <span className="text-sm text-neutral-500">De</span>
                  <span className="text-base font-medium text-neutral-400 line-through md:text-lg">
                    R$ {(product.price * quantity).toFixed(2).replace(".", ",")}
                  </span>
                  <span className="text-sm text-neutral-500">por</span>
                  <span className="text-xl font-bold text-[var(--theme-primary)] md:text-2xl">
                    R$ {(effectivePrice * quantity).toFixed(2).replace(".", ",")}
                  </span>
                </div>
                {economia > 0 && (
                  <span className="mt-2 inline-block rounded-full bg-[var(--theme-primary)]/15 px-3 py-1 text-sm font-semibold text-[var(--theme-primary)] md:mt-0 md:shrink-0">
                    Economize R$ {economia.toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-lg border border-neutral-200">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
                  >
                    <FiMinus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-medium">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-10 w-10 items-center justify-center text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
                  >
                    <FiPlus className="h-4 w-4" />
                  </button>
                </div>
                {!hasPromo && (
                  <span className="text-xl font-bold text-[var(--theme-primary)] md:text-2xl">
                    R$ {(effectivePrice * quantity).toFixed(2).replace(".", ",")}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="w-full rounded-xl bg-[var(--theme-primary)] px-6 py-3 font-medium text-white transition-colors hover:bg-[var(--theme-primary-hover)] sm:w-auto sm:shrink-0"
              >
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
