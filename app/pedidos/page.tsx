"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FiPackage, FiArrowLeft, FiSearch } from "react-icons/fi";
import { getOrderTrackingAction, getOrdersInProgressAction } from "@/app/actions/api";
import { getStoredPhone } from "@/app/hooks/useCustomer";
import { formatPhone } from "@/app/lib/phoneMask";
import type { OrderTrackingResponse } from "@/app/types/api";

function OrderCard({ order }: { order: OrderTrackingResponse }) {
  const isComplete = order.status === "delivered" || order.status === "cancelled";
  const isCancelled = order.status === "cancelled";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative overflow-hidden rounded-2xl p-5 shadow-sm ${
        isComplete ? "bg-neutral-50" : "bg-white shadow-[var(--theme-primary)]/5 ring-1 ring-[var(--theme-primary)]/20"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-neutral-400">
            PEDIDO #{order.id.slice(-8).toUpperCase()}
          </p>
          <span
            className={`mt-2 inline-block rounded-lg px-3 py-1 text-xs font-semibold tracking-wide ${
              isCancelled
                ? "bg-red-100 text-red-800"
                : isComplete
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-[var(--theme-primary)]/15 text-[var(--theme-primary)]"
            }`}
          >
            {order.statusLabel}
          </span>
          <p className="mt-2 text-sm tabular-nums text-[var(--theme-foreground-muted)]">
            {new Date(order.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <p className="text-xl font-bold tabular-nums text-[var(--theme-primary)]">
          R$ {order.total.toFixed(2).replace(".", ",")}
        </p>
      </div>
      <div className="mt-4 border-t border-dashed border-neutral-200 pt-3">
        {order.items.map((item, i) => (
          <div
            key={`${item.productId}-${i}`}
            className="flex justify-between text-sm"
          >
            <span className="text-[var(--theme-foreground)]">
              {item.quantity}x {item.name}
            </span>
            <span className="tabular-nums text-[var(--theme-foreground-muted)]">
              R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function PedidosPage() {
  const [phone, setPhone] = useState("");
  const [hasStoredPhone, setHasStoredPhone] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<OrderTrackingResponse[]>([]);
  const [singleOrder, setSingleOrder] = useState<OrderTrackingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, "");
  const canSearch = digits.length >= 10;

  useEffect(() => {
    const saved = getStoredPhone();
    if (saved && saved.replace(/\D/g, "").length >= 10) {
      setPhone(formatPhone(saved));
      setHasStoredPhone(true);
    }
  }, []);

  const handleSearch = useCallback(async () => {
    if (!canSearch) return;
    setLoading(true);
    setError(null);
    setOrders([]);
    setSingleOrder(null);
    try {
      if (orderId.trim()) {
        const order = await getOrderTrackingAction(orderId.trim(), phone);
        if (order) setSingleOrder(order);
        else setError("Pedido não encontrado. Verifique o código e o telefone.");
      } else {
        const list = (await getOrdersInProgressAction(phone)).filter(
          (o) => o.status !== "cancelled"
        );
        setOrders(list);
        if (list.length === 0)
          setError("Nenhum pedido em andamento. Digite o código do pedido para rastrear.");
      }
    } catch {
      setError("Erro ao buscar pedidos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, [canSearch, orderId, phone]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-[var(--theme-background)]">
      <header className="sticky top-0 z-10 border-b border-neutral-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Voltar"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--theme-primary)]/10">
              <FiPackage className="h-4 w-4 text-[var(--theme-primary)]" />
            </div>
            <h1 className="text-base font-semibold text-[var(--theme-foreground)]">
              Rastrear pedido
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-5 shadow-sm">
          <p className="mb-4 text-sm text-[var(--theme-foreground-muted)]">
            Informe seu telefone para consultar
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 sm:flex-row sm:gap-3">
              <div className="flex-1">
                <input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => !hasStoredPhone && setPhone(formatPhone(e.target.value))}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  readOnly={hasStoredPhone}
                  className={`w-full rounded-xl border border-neutral-200 px-4 py-3 text-[var(--theme-foreground)] placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20 ${
                    hasStoredPhone
                      ? "cursor-default bg-neutral-100 text-neutral-600"
                      : "bg-neutral-50/50 focus:border-[var(--theme-primary)] focus:bg-white"
                  }`}
                />
              </div>
              <div className="flex-1">
                <input
                  id="orderId"
                  type="text"
                  placeholder="Código (opcional)"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full rounded-xl border border-neutral-200 bg-neutral-50/50 px-4 py-3 text-[var(--theme-foreground)] placeholder:text-neutral-400 focus:border-[var(--theme-primary)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--theme-primary)]/20"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={!canSearch || loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--theme-primary)] px-4 py-3 font-semibold text-white transition-all active:scale-[0.98] hover:bg-[var(--theme-primary-hover)] disabled:opacity-50 disabled:active:scale-100"
              aria-label="Consultar"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <FiSearch className="h-5 w-5 shrink-0" />
                  <span>Consultar</span>
                </>
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-[var(--theme-foreground-muted)]">
            Sem código = lista de pedidos em andamento
          </p>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
            >
              {error}
            </motion.div>
          )}

          {singleOrder && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <OrderCard order={singleOrder} />
            </motion.div>
          )}

          {orders.length > 0 && !singleOrder && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 space-y-4"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--theme-foreground-muted)]">
                Em andamento
              </p>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
