import type { Category, Product } from "./index";

import type { BusinessHours } from "./index";

export interface MenuResponse {
  restaurant: {
    name: string;
    description: string;
    whatsapp: string;
    icon?: string;
    deliveryFee?: number;
    businessHours?: BusinessHours;
    timezone?: string;
  };
  theme?: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondarySoft: string;
    background: string;
    foreground: string;
    foregroundMuted: string;
    whatsapp: string;
  };
  footer?: { copyright: string };
  categories: Category[];
  products: Product[];
}

export interface CustomerResponse {
  id: string;
  name: string;
  phone: string;
  points: number;
}

export interface LoyaltyBalanceResponse {
  points: number;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  image?: string;
}

export interface ValidateCouponPayload {
  code: string;
  orderValue: number;
  customerPhone?: string;
}

export interface ValidateCouponResponse {
  valid: boolean;
  discount: number;
  message?: string;
}

export interface CreateOrderPayload {
  customer: { name: string; phone: string };
  items: { productId: string; quantity: number }[];
  couponCode?: string;
  pointsToUse?: number;
  rewards?: string[];
}

export interface CreateOrderResponse {
  id: string;
  total: number;
  discount: number;
  pointsEarned: number;
}
