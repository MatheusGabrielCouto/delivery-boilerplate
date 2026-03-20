"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { getMenuData, getCategoriesWithProducts } from "@/app/lib/products";
import { CategorySection } from "@/app/components/CategorySection";
import { CategoryNav } from "@/app/components/CategoryNav";
import { Cart } from "@/app/components/Cart";
import { CartButton } from "@/app/components/CartButton";
import { Footer } from "@/app/components/Footer";
import type { CartItem, Product } from "@/app/types";

const ProductDetail = dynamic(
  () => import("@/app/components/ProductDetail").then((m) => ({ default: m.ProductDetail })),
  { ssr: false }
);

export default function Home() {
  const menuData = useMemo(() => getMenuData(), []);
  const categorySections = useMemo(() => getCategoriesWithProducts(), []);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const itemCount = cart.reduce((a, i) => a + i.quantity, 0);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const cartProps = {
    items: cart,
    restaurantName: menuData.restaurant.name,
    whatsapp: menuData.restaurant.whatsapp,
    deliveryFee: menuData.restaurant.deliveryFee,
    onRemove: removeFromCart,
    onUpdateQuantity: updateQuantity,
  };

  const footerCopyright =
    menuData.footer?.copyright ?? "Todos os direitos reservados";

  return (
    <div className="flex min-h-screen flex-col bg-[var(--theme-background)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--theme-primary)] focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-20 shrink-0 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          {menuData.restaurant.icon && (
            <img
              src={menuData.restaurant.icon}
              alt=""
              width={56}
              height={56}
              className="h-10 w-10 shrink-0 rounded-lg object-cover sm:h-14 sm:w-14 sm:rounded-xl"
              fetchPriority="high"
            />
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-[var(--theme-foreground)] sm:text-2xl">
              {menuData.restaurant.name}
            </h1>
            <p className="mt-0.5 truncate text-xs text-[var(--theme-foreground-muted)] sm:text-sm">
              {menuData.restaurant.description}
            </p>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-3 sm:px-6 sm:py-4">
        <CategoryNav categories={categorySections.map(({ category }) => category)} />

        <div className="flex flex-col gap-12 pb-32 lg:flex-row lg:gap-8 lg:pb-12">
          <section className="min-w-0 flex-1 space-y-12">
            {categorySections.map(({ category, products }, i) => (
              <CategorySection
                key={category.id}
                category={category}
                products={products}
                onAdd={addToCart}
                onDetail={setSelectedProduct}
                index={i}
              />
            ))}
          </section>

          <section className="hidden lg:block lg:w-96 lg:shrink-0">
            <div className="sticky mt-5">
              <Cart {...cartProps} variant="sidebar" />
            </div>
          </section>
        </div>
      </main>

      <CartButton itemCount={itemCount} onClick={() => setCartOpen(true)} />

      <Cart
        {...cartProps}
        variant="drawer"
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />

      <ProductDetail
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAdd={addToCart}
      />

      <Footer copyright={footerCopyright} />
    </div>
  );
}
