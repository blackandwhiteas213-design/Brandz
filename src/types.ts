export interface Product {
  id: number;
  name: string;
  image: string;
  price: number;
  sizes?: string[];
  colors?: string[];
  stock?: number;
}

export interface CartItem {
  key: string;
  productId: number;
  name: string;
  image: string;
  price: number;
  size: string;
  color?: string;
  qty: number;
}

export interface PromoCode {
  id: number;
  code: string;
  discount: number;
  active: boolean;
}

export interface OrderItem {
  name: string;
  size: string;
  color?: string;
  qty: number;
  price: number;
}

export interface Order {
  id: number;
  date: string;
  name: string;
  phone: string;
  city: string;
  governorate: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  promoCode?: string;
}
