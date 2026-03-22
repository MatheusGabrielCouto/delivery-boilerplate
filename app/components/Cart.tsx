"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
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
  FiGift,
} from "react-icons/fi";
import { ProductImage } from "@/app/components/ProductImage";
import { getProductImage } from "@/app/lib/productImages";
import { getStoredPhone, setStoredPhone } from "@/app/hooks/useCustomer";
import { useCustomer } from "@/app/hooks/useCustomer";
import { useLoyalty } from "@/app/hooks/useLoyalty";
import { useValidateCoupon } from "@/app/hooks/useValidateCoupon";
import { useCreateOrder } from "@/app/hooks/useCreateOrder";
import { useQueryClient } from "@tanstack/react-query";
import type { CartItem, CartRewardItem } from "@/app/types";
import { getEffectivePrice } from "@/app/types";
import type { CreateOrderPayload, CreateOrderResponse } from "@/app/types/api";

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
  rewardItems: CartRewardItem[];
  restaurantName: string;
  whatsapp: string;
  deliveryFee?: number;
  isRestaurantOpen?: boolean;
  onRemove: (productId: string) => void;
  onRemoveReward: (rewardId: string) => void;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onUpdateRewardQuantity: (rewardId: string, delta: number) => void;
  onOrderSuccess?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  variant?: "sidebar" | "drawer";
}

function buildWhatsAppMessage(
  items: CartItem[],
  rewardItems: CartRewardItem[],
  orderResponse: { total: number; discount: number; pointsEarned: number },
  restaurantName: string,
  address?: AddressForm,
  deliveryFee?: number
): string {
  const lines = [
    `Olá! Gostaria de fazer um pedido no *${restaurantName}*`,
    "",
    "*Pedido:*",
    ...items.map(
      (i) =>
        `• ${i.product.name} ${i.quantity}x - R$ ${(getEffectivePrice(i.product) * i.quantity).toFixed(2).replace(".", ",")}`
    ),
    ...rewardItems.map((r) => `• ${r.name} ${r.quantity}x - Troca de pontos`),
  ];
  const fee = Number(deliveryFee);
  if (deliveryFee != null && fee > 0) {
    lines.push("", `*Taxa de entrega: R$ ${fee.toFixed(2).replace(".", ",")}*`);
  }
  if (orderResponse.discount > 0) {
    lines.push("", `*Desconto: -R$ ${orderResponse.discount.toFixed(2).replace(".", ",")}*`);
  }
  lines.push("", `*Total: R$ ${orderResponse.total.toFixed(2).replace(".", ",")}*`);
  if (orderResponse.pointsEarned > 0) {
    lines.push("", `*Pontos ganhos: ${orderResponse.pointsEarned}*`);
  }
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

const MAX_WHATSAPP_URL_LENGTH = 2000;
const BRAZIL_COUNTRY_CODE = "55";

function buildWhatsAppUrl(phone: string, msg: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits || digits.length < 10) return "";
  const fullNumber = digits.length >= 12 ? digits : `${BRAZIL_COUNTRY_CODE}${digits}`;
  const encoded = encodeURIComponent(msg);
  let text = encoded;
  if (encoded.length > MAX_WHATSAPP_URL_LENGTH - 80) {
    const truncateAt = Math.floor((MAX_WHATSAPP_URL_LENGTH - 80) * 0.9);
    text = encoded.slice(0, truncateAt) + encodeURIComponent("\n\n[... mensagem truncada - envie o restante manualmente]");
  }
  return `https://api.whatsapp.com/send?phone=${fullNumber}&text=${text}`;
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
  rewardItems,
  restaurantName,
  whatsapp,
  deliveryFee,
  isRestaurantOpen = true,
  onRemove,
  onRemoveReward,
  onUpdateQuantity,
  onUpdateRewardQuantity,
  onOrderSuccess,
  isOpen = true,
  onClose,
  variant = "sidebar",
}: CartProps) {
  const queryClient = useQueryClient();
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState<AddressForm>(initialAddress);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  useEffect(() => {
    setPhone(getStoredPhone());
  }, []);

  useEffect(() => {
    if (phone.length >= 10) setStoredPhone(phone);
  }, [phone]);

  const { customer, isExisting } = useCustomer(phone || undefined);
  const { points, isFetching: loyaltyLoading } = useLoyalty(phone || undefined);
  const validateCoupon = useValidateCoupon();
  const createOrder = useCreateOrder();

  useEffect(() => {
    if (customer?.name) setCustomerName(customer.name);
  }, [customer?.name]);

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

  const productsTotal = items.reduce(
    (acc, item) => acc + getEffectivePrice(item.product) * item.quantity,
    0
  );
  const couponDiscount = validateCoupon.data?.valid ? validateCoupon.data.discount : 0;
  const deliveryFeeNum = Number(deliveryFee) || 0;
  const subtotalWithDelivery = productsTotal + deliveryFeeNum;
  const totalBeforePoints = Math.max(0, subtotalWithDelivery - couponDiscount);
  const itemCount = items.reduce((a, i) => a + i.quantity, 0) + rewardItems.reduce((a, i) => a + i.quantity, 0);
  const isDrawer = variant === "drawer";

  const hasItems = items.length > 0 || rewardItems.length > 0;
  const canCheckout = hasItems;
  const requiredPoints = rewardItems.reduce((acc, r) => acc + r.pointsCost * r.quantity, 0);
  const hasInsufficientPoints =
    rewardItems.length > 0 &&
    phone.replace(/\D/g, "").length >= 10 &&
    !loyaltyLoading &&
    points < requiredPoints;

  const handleValidateCoupon = () => {
    const orderValue = productsTotal + deliveryFeeNum;
    if (!couponCode.trim() || orderValue <= 0) return;
    const digits = phone.replace(/\D/g, "");
    validateCoupon.mutate({
      code: couponCode.trim(),
      orderValue,
      ...(digits.length >= 10 && { customerPhone: digits }),
    });
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) return;
    if (rewardItems.length > 0 && (loyaltyLoading || points < requiredPoints)) return;

    const fullPhone = digits.length >= 12 ? digits : `55${digits}`;
    const orderPayload: CreateOrderPayload = {
      customer: {
        name: customerName.trim() || "Cliente",
        phone: fullPhone,
      },
      items: items.map((i) => ({
        productId: String(i.product.id),
        quantity: Number(i.quantity),
      })),
    };
    if (validateCoupon.data?.valid && couponCode.trim()) {
      orderPayload.couponCode = couponCode.trim();
    }
    if (rewardItems.length > 0) {
      orderPayload.rewards = rewardItems.flatMap((r) => Array(r.quantity).fill(r.rewardId));
    }

    try {
      const order = await createOrder.mutateAsync(orderPayload);
      const orderData =
        (order as { data?: CreateOrderResponse })?.data ??
        (order as { order?: CreateOrderResponse })?.order ??
        (order as CreateOrderResponse);
      const total = Number(orderData?.total) ?? 0;
      const discount = Number(orderData?.discount) ?? 0;
      const pointsEarned = Number(orderData?.pointsEarned) ?? 0;
      const msg = buildWhatsAppMessage(
        items,
        rewardItems,
        { total, discount, pointsEarned },
        restaurantName,
        address,
        deliveryFee
      );
      const whatsappUrl = buildWhatsAppUrl(whatsapp, msg);
      if (whatsappUrl) {
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      }
      setShowAddressForm(false);
      setAddress(initialAddress);
      setCepError(null);
      setCouponCode("");
      validateCoupon.reset();
      queryClient.invalidateQueries({ queryKey: ["customer", digits] });
      queryClient.invalidateQueries({ queryKey: ["loyalty", digits] });
      onOrderSuccess?.();
      onClose?.();
    } catch {
      // createOrder.error is set by React Query
    }
  };

  const content = (
    <>
      <div className={`flex items-center gap-3 ${isDrawer ? "justify-between" : ""}`}>
        <div className="flex items-center gap-2.5">
          <div className={`flex items-center justify-center rounded-xl ${isDrawer ? "h-9 w-9 bg-neutral-100" : "h-10 w-10 bg-[var(--theme-primary)]/10 text-[var(--theme-primary)]"}`}>
            <FiShoppingCart className={isDrawer ? "h-5 w-5 text-neutral-600" : "h-5 w-5"} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Carrinho</h2>
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

      {!hasItems ? (
        <div className={`flex flex-1 flex-col items-center justify-center text-center ${isDrawer ? "py-16" : "py-12"}`}>
          <div className={`flex items-center justify-center rounded-2xl bg-neutral-50 ${isDrawer ? "h-20 w-20" : "h-16 w-16"}`}>
            <FiShoppingCart className={`text-neutral-300 ${isDrawer ? "h-10 w-10" : "h-8 w-8"}`} />
          </div>
          <p className="mt-4 text-sm font-semibold text-neutral-600">Carrinho vazio</p>
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
                const subtotal = getEffectivePrice(item.product) * item.quantity;
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
                      <ProductImage
                        src={getProductImage(item.product)}
                        alt={item.product.name}
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="min-w-0 flex-1 overflow-hidden">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {item.product.name}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-neutral-500">
                        R$ {getEffectivePrice(item.product).toFixed(2).replace(".", ",")} un.
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
              {rewardItems.map((r) => (
                <motion.li
                  key={r.rewardId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className={`flex gap-3 rounded-xl p-3 ${isDrawer ? "bg-neutral-50" : "bg-neutral-50/80"}`}
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-[var(--theme-secondary-soft)]">
                    <FiGift className="h-6 w-6 text-[var(--theme-secondary)]" />
                  </div>
                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="truncate text-sm font-semibold text-neutral-900">{r.name}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">{r.pointsCost} pts</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <div className="flex shrink-0 items-center rounded-lg bg-white shadow-sm ring-1 ring-neutral-100">
                        <motion.button
                          type="button"
                          onClick={() => onUpdateRewardQuantity(r.rewardId, -1)}
                          whileTap={{ scale: 0.9 }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-600"
                        >
                          <FiMinus className="h-3.5 w-3.5" />
                        </motion.button>
                        <span className="min-w-7 text-center text-xs font-bold">{r.quantity}</span>
                        <motion.button
                          type="button"
                          onClick={() => onUpdateRewardQuantity(r.rewardId, 1)}
                          whileTap={{ scale: 0.9 }}
                          className="flex h-8 w-8 shrink-0 items-center justify-center text-neutral-600"
                        >
                          <FiPlus className="h-3.5 w-3.5" />
                        </motion.button>
                      </div>
                      <motion.button
                        type="button"
                        onClick={() => onRemoveReward(r.rewardId)}
                        whileTap={{ scale: 0.9 }}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500"
                        aria-label="Remover"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          <div className="mt-4 shrink-0 space-y-3 border-t pt-4">
            <div className="space-y-2">
              <label className="block text-xs font-medium text-neutral-600">Telefone</label>
              <input
                type="tel"
                value={
                  phone.length === 0
                    ? ""
                    : phone.length <= 2
                      ? `(${phone}`
                      : phone.length <= 7
                        ? `(${phone.slice(0, 2)}) ${phone.slice(2)}`
                        : `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`
                }
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                  setPhone(v);
                }}
                placeholder="(00) 00000-0000"
                className="w-full rounded-lg border-0 bg-neutral-50 py-2.5 px-3 text-sm text-neutral-900 ring-1 ring-neutral-200 placeholder:text-neutral-400 focus:ring-2 focus:ring-[var(--theme-primary)]/30"
              />
              {rewardItems.length > 0 && phone.replace(/\D/g, "").length >= 10 && (
                <p className="text-xs font-medium">
                  {loyaltyLoading ? (
                    <span className="text-neutral-500">Verificando pontos...</span>
                  ) : hasInsufficientPoints ? (
                    <span className="text-red-600">
                      Pontos insuficientes. Você tem {points}, necessário {requiredPoints} pts
                    </span>
                  ) : (
                    <span className="text-[var(--theme-primary)]">
                      Você tem {points} pontos (necessário {requiredPoints} pts)
                    </span>
                  )}
                </p>
              )}
              {isExisting && points > 0 && rewardItems.length === 0 && (
                <p className="text-xs text-[var(--theme-primary)] font-medium">
                  Você tem {points} pontos
                </p>
              )}
            </div>

            {!isExisting && phone.length >= 10 && (
              <div>
                <label className="block text-xs font-medium text-neutral-600">Seu nome</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Como podemos te chamar?"
                  className="mt-1 w-full rounded-lg border-0 bg-neutral-50 py-2.5 px-3 text-sm text-neutral-900 ring-1 ring-neutral-200 placeholder:text-neutral-400 focus:ring-2 focus:ring-[var(--theme-primary)]/30"
                />
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  validateCoupon.reset();
                }}
                placeholder="Cupom de desconto"
                className="flex-1 rounded-lg border-0 bg-neutral-50 py-2.5 px-3 text-sm text-neutral-900 ring-1 ring-neutral-200 placeholder:text-neutral-400 focus:ring-2 focus:ring-[var(--theme-primary)]/30"
              />
              <button
                type="button"
                onClick={handleValidateCoupon}
                disabled={!couponCode.trim() || validateCoupon.isPending}
                className="shrink-0 rounded-lg bg-neutral-200 px-3 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-300 disabled:opacity-50"
              >
                {validateCoupon.isPending ? "..." : "OK"}
              </button>
            </div>
            {validateCoupon.isError && (
              <p className="text-xs text-red-600">
                {(validateCoupon.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                  "Cupom inválido"}
              </p>
            )}
            {validateCoupon.data?.valid === false && validateCoupon.data?.message && (
              <p className="text-xs text-red-600">{validateCoupon.data.message}</p>
            )}
            {validateCoupon.data?.valid && (
              <p className="text-xs font-medium text-green-600">
                Desconto de R$ {validateCoupon.data.discount.toFixed(2).replace(".", ",")} aplicado
              </p>
            )}

            <div className={`space-y-2 ${isDrawer ? "border-neutral-200" : "border-neutral-100"}`}>
            {deliveryFee != null && Number(deliveryFee) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-neutral-600">Taxa de entrega</span>
                <span className="font-semibold text-neutral-900">
                  R$ {Number(deliveryFee).toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}
              {couponDiscount > 0 && (
                <div className="flex items-center justify-between text-sm text-green-600">
                  <span className="font-medium">Desconto</span>
                  <span className="font-semibold">-R$ {couponDiscount.toFixed(2).replace(".", ",")}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-neutral-600">Total</span>
                <span className="text-lg font-bold text-neutral-900">
                  R$ {totalBeforePoints.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>

            {!isRestaurantOpen && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
                O restaurante está fechado. Pedidos disponíveis apenas nos horários de funcionamento.
              </p>
            )}
            <motion.button
              type="button"
              onClick={() => setShowAddressForm(true)}
              disabled={
                !isRestaurantOpen ||
                phone.replace(/\D/g, "").length < 10 ||
                (rewardItems.length > 0 && (loyaltyLoading || points < requiredPoints))
              }
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.01 }}
              className={`flex w-full items-center justify-center gap-2 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDrawer ? "rounded-xl bg-[var(--theme-whatsapp)] py-3 shadow-md shadow-green-500/20" : "rounded-xl bg-[var(--theme-whatsapp)] py-3.5 shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/25"}`}
            >
              Finalizar pedido
            </motion.button>
          </div>
        </>
      )}
    </>
  );

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
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="flex-1 rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-50 active:bg-neutral-100"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={createOrder.isPending}
                    className="flex text-sm flex-1 items-center justify-center gap-1.5 rounded-lg bg-[var(--theme-whatsapp)] px-3 py-2.5 font-semibold text-white shadow-md shadow-green-500/20 transition-all hover:shadow-green-500/25 active:scale-[0.98] disabled:opacity-70"
                  >
                    {createOrder.isPending ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <FiMessageCircle className="h-4 w-4" />
                        Enviar no WhatsApp
                      </>
                    )}
                  </button>
                </div>
                {createOrder.isError && (
                  <p className="text-center text-sm text-red-600">
                    {(createOrder.error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                      "Erro ao criar pedido. Tente novamente."}
                  </p>
                )}
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
