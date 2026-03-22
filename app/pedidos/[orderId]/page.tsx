"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { FiPackage, FiArrowLeft, FiSearch } from "react-icons/fi";
import { getOrderTrackingAction } from "@/app/actions/api";
import { getStoredPhone } from "@/app/hooks/useCustomer";
import { formatPhone } from "@/app/lib/phoneMask";
import type { OrderTrackingResponse, OrderStatus } from "@/app/types/api";

function getProgressStep(status: OrderStatus): number {
  if (status === "cancelled") return -1;
  if (status === "delivered") return 4;
  if (status === "out_for_delivery" || status === "ready") return 3;
  if (status === "preparing") return 2;
  return 1;
}

function OrderDetail({ order }: { order: OrderTrackingResponse }) {
  const isComplete = order.status === "delivered" || order.status === "cancelled";
  const isCancelled = order.status === "cancelled";
  const step = getProgressStep(order.status);
  const progressPercent = step === -1 ? 0 : Math.round((step / 4) * 100);

  return (
    <motion.div
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
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <p className="text-xl font-bold tabular-nums text-[var(--theme-primary)]">
          R$ {order.total.toFixed(2).replace(".", ",")}
        </p>
      </div>
      {!isCancelled && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-neutral-200">
            <motion.div
              className="h-full rounded-full bg-[var(--theme-primary)]"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] uppercase tracking-wider text-[var(--theme-foreground-muted)]">
            <span>Pendente</span>
            <span>Em preparo</span>
            <span>Saiu</span>
            <span>Entregue</span>
          </div>
        </div>
      )}
      <div className="mt-4 border-t border-dashed border-neutral-200 pt-3">
        {order.items.map((item, i) => (
          <div key={`${item.productId}-${i}`} className="flex justify-between text-sm">
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

function OrderPolling({
  orderId,
  phone,
  currentStatus,
  onUpdate,
}: {
  orderId: string;
  phone: string;
  currentStatus: OrderStatus;
  onUpdate: (order: OrderTrackingResponse | null) => void;
}) {
  const isFinal = currentStatus === "delivered" || currentStatus === "cancelled";

  useEffect(() => {
    if (isFinal) return;
    const interval = setInterval(() => {
      getOrderTrackingAction(orderId, phone).then((data) => {
        if (data) onUpdate(data);
      });
    }, 10 * 1000);
    return () => clearInterval(interval);
  }, [orderId, phone, isFinal, onUpdate]);

  return null;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.orderId as string;
  const [phone, setPhone] = useState("");
  const [hasStoredPhone, setHasStoredPhone] = useState(false);
  const [order, setOrder] = useState<OrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const digits = phone.replace(/\D/g, "");
  const canSearch = digits.length >= 10;

  async function handleSearch() {
    if (!canSearch || !orderId) return;
    setLoading(true);
    setError(null);
    setOrder(null);
    try {
      const data = await getOrderTrackingAction(orderId, phone);
      if (data) setOrder(data);
      else setError("Pedido não encontrado. Verifique o código e o telefone.");
    } catch {
      setError("Erro ao buscar pedido. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const saved = getStoredPhone();
    if (saved && saved.replace(/\D/g, "").length >= 10) {
      setPhone(formatPhone(saved));
      setHasStoredPhone(true);
    }
  }, []);

  useEffect(() => {
    if (!orderId || digits.length < 10 || order || loading) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getOrderTrackingAction(orderId, phone)
      .then((data) => {
        if (!cancelled && data) setOrder(data);
        else if (!cancelled) setError("Pedido não encontrado. Verifique o código e o telefone.");
      })
      .catch(() => {
        if (!cancelled) setError("Erro ao buscar pedido. Tente novamente.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, digits]);

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-neutral-50/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link
            href="/pedidos"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors hover:bg-neutral-200"
            aria-label="Voltar"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <FiPackage className="h-5 w-5 shrink-0 text-[var(--theme-primary)]" />
            <h1 className="text-lg font-bold text-[var(--theme-foreground)]">
              Pedido #{orderId?.slice(-8).toUpperCase() ?? ""}
            </h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        {!order ? (
          <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm text-[var(--theme-foreground-muted)]">
              Digite seu telefone para rastrear este pedido
            </p>
            <div className="flex flex-col gap-3">
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
              <button
                type="button"
                onClick={handleSearch}
                disabled={!canSearch || loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--theme-primary)] px-4 py-3 font-semibold text-white transition-all active:scale-[0.98] hover:bg-[var(--theme-primary-hover)] disabled:opacity-50 disabled:active:scale-100"
                aria-label="Rastrear"
              >
                {loading ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <FiSearch className="h-5 w-5 shrink-0" />
                    <span>Rastrear</span>
                  </>
                )}
              </button>
            </div>
            {error && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {error}
              </div>
            )}
          </div>
        ) : (
          <>
            <OrderDetail order={order} />
            <OrderPolling
              orderId={orderId}
              phone={phone}
              currentStatus={order.status}
              onUpdate={setOrder}
            />
          </>
        )}
      </main>
    </div>
  );
}
