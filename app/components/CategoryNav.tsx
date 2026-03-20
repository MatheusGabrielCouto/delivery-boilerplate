"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Category } from "@/app/types";

interface CategoryNavProps {
  categories: Category[];
}

export function CategoryNav({ categories }: CategoryNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sorted = [...categories].sort((a, b) => a.order - b.order);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    sorted.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sorted]);

  const scrollToCategory = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveId(id);
  };

  return (
    <nav className="sticky top-[52px] z-10 -mx-4 border-b border-neutral-200 bg-white px-4 py-4 sm:top-[72px] sm:mx-0 sm:px-0">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {sorted.map((cat) => {
          const isActive = activeId === cat.id;

          return (
            <motion.button
              key={cat.id}
              type="button"
              onClick={() => scrollToCategory(cat.id)}
              whileTap={{ scale: 0.98 }}
              className={`relative shrink-0 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "text-[var(--theme-primary)]"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {cat.name}
              {isActive && (
                <motion.span
                  layoutId="category-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--theme-primary)]"
                  transition={{ type: "spring", duration: 0.3 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
