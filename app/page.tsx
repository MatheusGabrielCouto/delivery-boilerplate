"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useMenu } from "@/app/hooks/useMenu";
import { useRewards } from "@/app/hooks/useRewards";
import { CategorySection } from "@/app/components/CategorySection";
import { CategoryNav } from "@/app/components/CategoryNav";
import { Cart } from "@/app/components/Cart";
import { CartButton } from "@/app/components/CartButton";
import { Footer } from "@/app/components/Footer";
import { RewardsSection } from "@/app/components/RewardsSection";
import { BusinessHoursTrigger } from "@/app/components/BusinessHoursTrigger";
import { isRestaurantOpen } from "@/app/lib/businessHours";
import type { CartItem, CartRewardItem, Product } from "@/app/types";
import type { Reward } from "@/app/types/api";

const ProductDetail = dynamic(
  () => import("@/app/components/ProductDetail").then((m) => ({ default: m.ProductDetail })),
  { ssr: false }
);

export default function Home() {
  const { menu, categorySections, restaurant, footer, isLoading, isError, error } = useMenu();
  const { data: rewards } = useRewards();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [rewardItems, setRewardItems] = useState<CartRewardItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const itemCount =
    cart.reduce((a, i) => a + i.quantity, 0) +
    rewardItems.reduce((a, i) => a + i.quantity, 0);

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

  const addRewardToCart = (reward: Reward) => {
    setRewardItems((prev) => {
      const existing = prev.find((i) => i.rewardId === reward.id);
      if (existing) {
        return prev.map((i) =>
          i.rewardId === reward.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [
        ...prev,
        {
          rewardId: reward.id,
          name: reward.name,
          pointsCost: reward.pointsCost,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const removeRewardFromCart = (rewardId: string) => {
    setRewardItems((prev) => prev.filter((i) => i.rewardId !== rewardId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) =>
          productId === i.product.id
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const updateRewardQuantity = (rewardId: string, delta: number) => {
    setRewardItems((prev) =>
      prev
        .map((i) =>
          rewardId === i.rewardId
            ? { ...i, quantity: i.quantity + delta }
            : i
        )
        .filter((i) => i.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setRewardItems([]);
  };

  const businessHours = restaurant?.businessHours;
  const timezone = restaurant?.timezone;
  const restaurantOpen = isRestaurantOpen(businessHours, timezone);

  const cartProps = {
    items: cart,
    rewardItems,
    restaurantName: restaurant?.name ?? "",
    whatsapp: restaurant?.whatsapp ?? "",
    deliveryFee: restaurant?.deliveryFee,
    isRestaurantOpen: restaurantOpen,
    onRemove: removeFromCart,
    onRemoveReward: removeRewardFromCart,
    onUpdateQuantity: updateQuantity,
    onUpdateRewardQuantity: updateRewardQuantity,
    onOrderSuccess: clearCart,
  };

  const footerCopyright = footer?.copyright ?? "Todos os direitos reservados";

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <p className="text-center text-red-600">
          Erro ao carregar o cardápio. Tente novamente.
        </p>
        <p className="text-sm text-neutral-500">
          {error?.message}
        </p>
      </div>
    );
  }

  if (isLoading || !menu) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--theme-primary)] border-t-transparent" />
        <p className="text-sm text-neutral-500">Carregando cardápio...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--theme-background)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--theme-primary)] focus:px-4 focus:py-2 focus:text-white focus:outline-none"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-30 shrink-0 w-full border-b border-neutral-200 bg-neutral-50/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
          {restaurant?.icon && (
            <img
              src={restaurant.icon}
              alt=""
              width={56}
              height={56}
              className="h-10 w-10 shrink-0 rounded-lg object-cover sm:h-14 sm:w-14 sm:rounded-xl"
              fetchPriority="high"
            />
          )}
          <div className="min-w-0 flex-1 overflow-hidden">
            <h1 className="truncate text-lg font-bold tracking-tight text-[var(--theme-foreground)] sm:text-2xl">
              {restaurant?.name}
            </h1>
            <p className="mt-0.5 truncate text-xs text-[var(--theme-foreground-muted)] sm:text-sm">
              {restaurant?.description}
            </p>
          </div>
          {businessHours && (
            <BusinessHoursTrigger businessHours={businessHours} timezone={timezone} />
          )}
        </div>
      </header>

      {!restaurantOpen && businessHours && (
        <div
          className="w-full bg-amber-100 px-4 py-2.5 text-center text-sm font-medium text-amber-800 sm:px-6"
          role="alert"
        >
          Fechado no momento. Pedidos nos horários de funcionamento.
        </div>
      )}

      <main id="main-content" className="mx-auto w-full max-w-7xl flex-1 px-4 py-3 sm:px-6 sm:py-4">
        <CategoryNav
          categories={categorySections.map(({ category }) => category)}
          showRewards={(rewards?.length ?? 0) > 0}
        />

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
            <RewardsSection onAddReward={addRewardToCart} />
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
