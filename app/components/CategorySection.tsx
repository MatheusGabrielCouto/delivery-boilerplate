"use client";

import { motion } from "framer-motion";
import { ProductCard } from "@/app/components/ProductCard";
import type { Category, Product } from "@/app/types";

interface CategorySectionProps {
  category: Category;
  products: Product[];
  onAdd: (product: Product) => void;
  onDetail?: (product: Product) => void;
  index: number;
}

export function CategorySection({
  category,
  products,
  onAdd,
  onDetail,
  index,
}: CategorySectionProps) {
  return (
    <motion.section
      id={category.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="scroll-mt-28 sm:scroll-mt-32"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-neutral-900 sm:text-xl">
          {category.name}
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          {products.length} {products.length === 1 ? "opção" : "opções"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product, i) => (
          <ProductCard
            key={product.id}
            product={product}
            onAdd={onAdd}
            onDetail={onDetail}
            index={i}
          />
        ))}
      </div>
    </motion.section>
  );
}
