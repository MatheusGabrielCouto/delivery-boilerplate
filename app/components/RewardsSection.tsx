"use client";

import { motion } from "framer-motion";
import { FiGift, FiPlus } from "react-icons/fi";
import { ProductImage } from "@/app/components/ProductImage";
import { useRewards } from "@/app/hooks/useRewards";
import type { Reward } from "@/app/types/api";

interface RewardsSectionProps {
  onAddReward: (reward: Reward) => void;
}

export function RewardsSection({ onAddReward }: RewardsSectionProps) {
  const { data: rewards, isLoading, isError } = useRewards();

  if (isLoading || isError || !rewards?.length) return null;

  return (
    <motion.section
      id="recompensas"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="scroll-mt-40 sm:scroll-mt-48"
    >
      <div className="mb-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-neutral-900 sm:text-xl">
          <FiGift className="h-5 w-5 text-[var(--theme-primary)]" />
          Trocar pontos
        </h2>
        <p className="mt-1 text-sm text-neutral-500">
          Use seus pontos para trocar por recompensas
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {rewards.map((reward, i) => (
          <motion.article
            key={reward.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            className="flex flex-col overflow-hidden rounded-2xl border border-[var(--theme-secondary-soft)] bg-white shadow-sm transition-shadow hover:shadow-md hover:border-[var(--theme-secondary)]"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-[var(--theme-secondary-soft)]">
              <ProductImage
                src={reward.image || null}
                alt={reward.name}
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <h3 className="font-semibold text-[var(--theme-foreground)]">
                {reward.name}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-[var(--theme-foreground-muted)]">
                {reward.description}
              </p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-4">
                <span className="text-sm font-bold text-[var(--theme-secondary)]">
                  {reward.pointsCost} pts
                </span>
                <motion.button
                  type="button"
                  onClick={() => onAddReward(reward)}
                  whileTap={{ scale: 0.95 }}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-[var(--theme-primary)] px-3 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[var(--theme-primary-hover)] active:opacity-90 sm:gap-2 sm:px-4 sm:py-2.5"
                >
                  <FiPlus className="h-4 w-4" />
                  Trocar
                </motion.button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </motion.section>
  );
}
