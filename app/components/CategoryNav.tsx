"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { Category } from "@/app/types";

interface CategoryNavProps {
  categories: Category[];
  showRewards?: boolean;
}

export function CategoryNav({ categories, showRewards = false }: CategoryNavProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const scrollTargetRef = useRef<string | null>(null);
  const navItems = useMemo(() => {
    const sorted = [...categories].sort((a, b) => a.order - b.order);
    return showRewards
      ? [...sorted, { id: "recompensas", name: "Recompensas", order: 999 }]
      : sorted;
  }, [categories, showRewards]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (scrollTargetRef.current) return;
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-15% 0px -60% 0px", threshold: 0 }
    );

    navItems.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [navItems]);

  const scrollToCategory = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setActiveId(id);
    scrollTargetRef.current = id;
    el.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
    setTimeout(() => {
      scrollTargetRef.current = null;
    }, 800);
  };

  return (
    <nav className="sticky top-[52px] z-20 -mx-4 border-b border-neutral-200 bg-white px-4 pt-6 pb-2.5 sm:top-[72px] sm:mx-0 sm:px-0">
      <div className="flex gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {navItems.map((cat) => {
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
