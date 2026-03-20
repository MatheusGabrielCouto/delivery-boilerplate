"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart,
  FiMinus,
  FiPlus,
  FiTrash2,
  FiMessageCircle,
  FiMapPin,
  FiSearch,
  FiHome,
} from "react-icons/fi";
import { getProductImages } from "@/app/lib/productImages";
import type { CartItem } from "@/app/types";

interface AddressForm {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  city: string;
}

interface ViaCepResponse {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

interface CartProps {
  items: CartItem[];
  restaurantName: string;
  whatsapp: string;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  isOpen?: boolean;
  onClose?: () => void;
  variant?: "sidebar" | "drawer";
}

function buildWhatsAppMessage(
  items: CartItem[],
  total: number,
  restaurantName: string,
  address?: AddressForm
): string {
  const lines = [
    `Olá! Gostaria de fazer um pedido no *${restaurantName}*`,
    "",
    "*Pedido:*",
    ...items.map(
      (i) =>
        `• ${i.product.name} ${i.quantity}x - R$ ${(i.product.price * i.quantity).toFixed(2).replace(".", ",")}`
    ),
    "",
    `*Total: R$ ${total.toFixed(2).replace(".", ",")}*`,
  ];
  if (address?.street && address?.number && address?.neighborhood && address?.city) {
    const addr = [
      address.cep ? `CEP ${address.cep.replace(/\D/g, "").replace(/^(\d{5})(\d{3})$/, "$1-$2")}` : "",
      address.street,
      address.number,
      address.complement ? ` - ${address.complement}` : "",
      address.neighborhood,
      address.city,
    ].filter(Boolean).join(", ");
    lines.push("", "*Endereço de entrega:*", addr);
  }
  return lines.join("\n");
}

const initialAddress: AddressForm = {
  cep: "",
  street: "",
  number: "",
  neighborhood: "",
  complement: "",
  city: "",
};

export function Cart({
  items,
  restaurantName,
  whatsapp,
  onRemove,
  onUpdateQuantity,
  isOpen = true,
  onClose,
  variant = "sidebar",
}: CartProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState<AddressForm>(initialAddress);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  const fetchAddressByCep = useCallback(async (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setCepLoading(true);
    setCepError(null);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data: ViaCepResponse = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado");
        return;
      }
      setAddress((a) => ({
        ...a,
        street: data.logradouro ?? a.street,
        neighborhood: data.bairro ?? a.neighborhood,
        city: data.localidade ?? a.city,
      }));
    } catch {
      setCepError("Erro ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  }, []);

  useEffect(() => {
    if (variant === "drawer" && isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [variant, isOpen]);

  const total = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const itemCount = items.reduce((a, i) => a + i.quantity, 0);
  const isDrawer = variant === "drawer";

  const content = (
    <>
      <div className={`flex items-center gap-3 ${isDrawer ? "justify-between" : ""}`}>
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center justify-center rounded-xl ${isDrawer ? "h-9 w-9 bg-neutral-100" : "h-10 w-10 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]"}`}>
            <FiShoppingCart className={isDrawer ? "h-5 w-5 text-neutral-600" : "h-5 w-5"} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">
              Carrinho
            </h2>
            {itemCount > 0 && (
              <p className="text-xs font-medium text-neutral-500">
                {itemCount} {itemCount === 1 ? "item" : "itens"}
              </p>
            )}
          </div>
        </div>
        {isDrawer && onClose && (
          <motion.button
            type="button"
            onClick={onClose}
            whileTap={{ scale: 0.9 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-colors active:bg-neutral-200"
            aria-label="Fechar"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>

      {items.length === 0 ? (
        <div className={`flex flex-1 flex-col items-center justify-center text-center ${isDrawer ? "py-16" : "py-12"}`}>
          <div className={`flex items-center justify-center rounded-2xl bg-neutral-50 ${isDrawer ? "h-20 w-20" : "h-16 w-16"}`}>
            <FiShoppingCart className={`text-neutral-300 ${isDrawer ? "h-10 w-10" : "h-8 w-8"}`} />
          </div>
          <p className="mt-4 text-sm font-semibold text-neutral-600">
            Carrinho vazio
          </p>
          <p className="mt-1 max-w-[200px] text-xs text-neutral-500">
            {isDrawer ? "Toque nos produtos para adicionar" : "Clique nos produtos para adicionar ao pedido"}
          </p>
          {isDrawer && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-xl bg-neutral-900 px-6 py-3 text-sm font-medium text-white transition-colors active:bg-neutral-800"
            >
              Ver cardápio
            </button>
          )}
        </div>
      ) : (
        <>
          <ul className={`mt-4 flex flex-1 flex-col gap-2.5 overflow-y-auto overscroll-contain ${!isDrawer ? "cart-scroll max-h-[min(50vh,380px)] min-h-0 pr-1" : ""}`}>
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const subtotal = item.product.price * item.quantity;
                const image = getProductImages(item.product)[0];

                return (
                  <motion.li
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={`flex gap-3 rounded-xl p-3 transition-colors ${isDrawer ? "bg-neutral-50" : "bg-neutral-50/80 hover:bg-neutral-100/80"}`}
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-neutral-200 ring-1 ring-neutral-100">
                      <Image
                        src={image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {item.product.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        R$ {item.product.price.toFixed(2).replace(".", ",")} un.
                      </p>
                      <div className="mt-2 flex flex-nowrap items-center justify-between gap-2">
                        <div className="flex shrink-0 items-center rounded-lg bg-white shadow-sm ring-1 ring-neutral-100">
                          <motion.button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, -1)}
                            whileTap={{ scale: 0.9 }}
                            className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-600 transition-colors hover:bg-neutral-50 active:text-neutral-800"
                          >
                            <FiMinus className="h-3.5 w-3.5" />
                          </motion.button>
                          <span className="min-w-7 shrink-0 text-center text-xs font-bold text-neutral-900">
                            {item.quantity}
                          </span>
                          <motion.button
                            type="button"
                            onClick={() => onUpdateQuantity(item.product.id, 1)}
                            whileTap={{ scale: 0.9 }}
                            className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-600 transition-colors hover:bg-neutral-50 active:text-neutral-800"
                          >
                            <FiPlus className="h-3.5 w-3.5" />
                          </motion.button>
                        </div>
                        <div className="flex shrink-0 items-center gap-1.5">
                          <span className="whitespace-nowrap text-sm font-bold text-[var(--theme-primary)]">
                            R$ {subtotal.toFixed(2).replace(".", ",")}
                          </span>
                          <motion.button
                            type="button"
                            onClick={() => onRemove(item.product.id)}
                            whileTap={{ scale: 0.9 }}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500 transition-colors hover:bg-red-100 hover:text-red-600 active:bg-red-200"
                            aria-label="Remover"
                          >
                            <FiTrash2 className="h-3.5 w-3.5" />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>
          <div className={`mt-4 shrink-0 space-y-3 border-t pt-4 ${isDrawer ? "border-neutral-200" : "border-neutral-100"}`}>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-neutral-600">Total</span>
              <span className="text-lg font-bold text-neutral-900">
                R$ {total.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <motion.button
              type="button"
              onClick={() => setShowAddressForm(true)}
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              className={`flex w-full items-center justify-center gap-2 font-semibold text-white transition-all ${isDrawer ? "rounded-2xl bg-[var(--theme-whatsapp)] py-4 shadow-lg shadow-green-500/25" : "rounded-xl bg-[var(--theme-whatsapp)] py-3.5 shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/25"}`}
            >
              <FiMessageCircle className="h-5 w-5" />
              Finalizar pedido
            </motion.button>
          </div>
        </>
      )}
    </>
  );

  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = buildWhatsAppMessage(items, total, restaurantName, address);
    window.open(
      `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`,
      "_blank",
      "noopener,noreferrer"
    );
    setShowAddressForm(false);
    setAddress(initialAddress);
    setCepError(null);
    onClose?.();
  };

  const addressModal = (
    <AnimatePresence>
      {showAddressForm && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddressForm(false)}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            className="fixed inset-x-4 top-1/2 z-[101] mx-auto max-h-[85dvh] max-w-md -translate-y-1/2 overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5"
          >
            <div className="overflow-y-auto max-h-[85dvh]">
              <div className="bg-gradient-to-br from-[var(--theme-primary)]/10 via-[var(--theme-primary)]/5 to-transparent px-6 py-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--theme-primary)]/15 text-[var(--theme-primary)]">
                    <FiMapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900">Endereço de entrega</h3>
                    <p className="text-sm text-neutral-600">Preencha para enviar junto ao pedido</p>
                  </div>
                </div>
              </div>
              <form onSubmit={handleAddressSubmit} className="p-6 space-y-5">
                <div className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-100">
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    <FiSearch className="h-3.5 w-3.5" />
                    Buscar por CEP
                  </p>
                  <div className="relative">
                    <input
                      id="cep"
                      type="text"
                      inputMode="numeric"
                      value={
                        address.cep.length > 5
                          ? `${address.cep.slice(0, 5)}-${address.cep.slice(5)}`
                          : address.cep
                      }
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 8);
                        setAddress((a) => ({ ...a, cep: v }));
                        setCepError(null);
                      }}
                      onBlur={() => {
                        if (address.cep.replace(/\D/g, "").length === 8) fetchAddressByCep(address.cep);
                      }}
                      placeholder="00000-000"
                      maxLength={9}
                      className="w-full rounded-xl border-0 bg-white py-3.5 pl-4 pr-12 text-neutral-900 shadow-sm ring-1 ring-neutral-200/80 placeholder:text-neutral-400 focus:ring-2 focus:ring-[var(--theme-primary)]/30"
                    />
                    {cepLoading && (
                      <span className="absolute right-4 top-1/2 -translate-y-1/2" aria-hidden>
                        <svg className="h-5 w-5 animate-spin text-[var(--theme-primary)]" fill="none" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                          <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                        </svg>
                      </span>
                    )}
                  </div>
                  {cepError && (
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500" />
                      {cepError}
                    </p>
                  )}
                </div>
                <div className="rounded-2xl bg-neutral-50 p-4 ring-1 ring-neutral-100">
                  <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    <FiHome className="h-3.5 w-3.5" />
                    Endereço
                  </p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-[1fr_72px] gap-3">
                      <div>
                        <label htmlFor="street" className="mb-1.5 block text-sm font-medium text-neutral-600">Rua</label>
                        <input
                          id="street"
                          type="text"
                          value={address.street}
                          onChange={(e) => setAddress((a) => ({ ...a, street: e.target.value }))}
                          placeholder="Ex: Rua das Flores"
                          required
                          className="w-full rounded-xl border-0 bg-white py-3 px-4 text-neutral-900 shadow-sm ring-1 ring-neutral-200/80 placeholder:text-neutral-400 focus:ring-2 focus:ring-[var(--theme-primary)]/30"
                        />
                      </div>
                      <div>
                        <label htmlFor="number" className="mb-1.5 block text-sm font-medium text-neutral-600">Nº</label>
                        <input
                          id="number"
                          type="text"
                          value={address.number}
                          onChange={(e) => setAddress((a) => ({ ...a, number: e.target.value }))}
                          placeholder="123"
                          required
                          className="w-full rounded-xl border-0 bg-white py-3 px-4 text-neutral-900 shadow-sm ring-1 ring-neutral-200/80 placeholder:text-neutral-400 focus:ring-2 focus:ring-[var(--theme-primary)]/30"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="neighborhood" className="mb-1.5 block text-sm font-medium text-neutral-600">Bairro</label>
                      <input
                        id="neighborhood"
                        type="text"
                        value={address.neighborhood}
                        onChange={(e) => setAddress((a) => ({ ...a, neighborhood: e.target.value }))}
                        placeholder="Ex: Centro"
                        required
                        className="w-full rounded-xl border-0 bg-white py-3 px-4 text-neutral-900 shadow-sm ring-1 ring-neutral-200/80 placeholder:text-neutral-400 focus:ring-2 focus:ring-[var(--theme-primary)]/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="complement" className="mb-1.5 block text-sm font-medium text-neutral-600">
                        Complemento <span className="font-normal text-neutral-400">(opcional)</span>
                      </label>
                      <input
                        id="complement"
                        type="text"
                        value={address.complement}
                        onChange={(e) => setAddress((a) => ({ ...a, complement: e.target.value }))}
                        placeholder="Ex: Apt 101, bloco B"
                        className="w-full rounded-xl border-0 bg-white py-3 px-4 text-neutral-900 shadow-sm ring-1 ring-neutral-200/80 placeholder:text-neutral-400 focus:ring-2 focus:ring-[var(--theme-primary)]/30"
                      />
                    </div>
                    <div>
                      <label htmlFor="city" className="mb-1.5 block text-sm font-medium text-neutral-600">Cidade</label>
                      <input
                        id="city"
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                        placeholder="Ex: São Paulo"
                        required
                        className="w-full rounded-xl border-0 bg-white py-3 px-4 text-neutral-900 shadow-sm ring-1 ring-neutral-200/80 placeholder:text-neutral-400 focus:ring-2 focus:ring-[var(--theme-primary)]/30"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 rounded-xl border border-neutral-200 px-4 py-3.5 font-semibold text-neutral-600 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--theme-whatsapp)] px-4 py-3.5 font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:shadow-green-500/30 active:scale-[0.98]"
                  >
                    <FiMessageCircle className="h-5 w-5" />
                    Enviar no WhatsApp
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (variant === "drawer") {
    return (
      <>
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
              />
              <motion.aside
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 350 }}
                className="fixed inset-x-0 bottom-0 z-50 flex max-h-[88dvh] flex-col rounded-t-3xl bg-white shadow-2xl lg:hidden"
              >
                <div className="flex shrink-0 cursor-grab active:cursor-grabbing pt-4 pb-2">
                  <div className="mx-auto h-1 w-16 rounded-full bg-neutral-300" />
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pb-safe">
                  {content}
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
        {typeof document !== "undefined" && createPortal(addressModal, document.body)}
      </>
    );
  }

  return (
    <>
      <aside className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl shadow-neutral-200/60 ring-1 ring-neutral-100">
        <div className="flex flex-1 flex-col p-5">
          {content}
        </div>
      </aside>
      {typeof document !== "undefined" && createPortal(addressModal, document.body)}
    </>
  );
}
