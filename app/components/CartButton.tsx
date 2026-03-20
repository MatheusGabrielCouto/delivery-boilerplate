"use client";

import { motion } from "framer-motion";
import { FiShoppingCart } from "react-icons/fi";

interface CartButtonProps {
  itemCount: number;
  onClick: () => void;
}

export function CartButton({ itemCount, onClick }: CartButtonProps) {
  const hasItems = itemCount > 0;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-safe right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-black/15 ring-1 ring-neutral-200/80 lg:hidden"
      aria-label="Abrir carrinho"
    >
      <div className="relative flex items-center justify-center text-[var(--theme-primary)]">
        <FiShoppingCart className="h-6 w-6" />
        {hasItems && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 min-w-5 items-center justify-center rounded-full bg-[var(--theme-primary)] text-[10px] font-bold text-white"
          >
            {itemCount > 9 ? "9+" : itemCount}
          </motion.span>
        )}
      </div>
    </motion.button>
  );
}
