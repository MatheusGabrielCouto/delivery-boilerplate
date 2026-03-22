export interface Theme {
  primary: string;
  primaryHover: string;
  secondary: string;
  secondarySoft: string;
  background: string;
  foreground: string;
  foregroundMuted: string;
  whatsapp: string;
}

export interface Category {
  id: string;
  name: string;
  order: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  onSale?: boolean;
  image: string;
  images?: string[];
  categoryId: string;
  available: boolean;
}

export function getEffectivePrice(product: Product): number {
  return product.onSale && product.discountPrice != null ? product.discountPrice : product.price;
}

export interface Restaurant {
  name: string;
  description: string;
  whatsapp: string;
  icon?: string;
  deliveryFee?: number;
}

export interface Footer {
  copyright: string;
}

export interface MenuData {
  theme?: Theme;
  restaurant: Restaurant;
  footer?: Footer;
  categories: Category[];
  products: Product[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartRewardItem {
  rewardId: string;
  name: string;
  pointsCost: number;
  quantity: number;
}
