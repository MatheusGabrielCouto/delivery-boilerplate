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
  image: string;
  images?: string[];
  categoryId: string;
  available: boolean;
}

export interface Restaurant {
  name: string;
  description: string;
  whatsapp: string;
  icon?: string;
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
