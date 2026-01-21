export interface Category {
  id?: string;
  name: string;
  image: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  weight: number; // in grams
  category: string;
  image: string;
  description: string;
  featured?: boolean;
  mrp?: number;
  salePrice?: number;
  offerStartDate?: string;

  offerEndDate?: string;
  brand?: string;
  rating?: number;
  reviewsCount?: number;
  isCombo?: boolean;
  images?: string[];
  keywords?: string[];
  stock?: number;
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  description?: string;
  other?: string;
}

export interface Keyword {
  id: string;
  name: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId?: string; // Link order to a specific user ID
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  date: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: CartItem[];
  shippingCost: number;
  trackingId?: string;
  paymentId?: string;
  paymentMethod?: string;
  paymentStatus?: 'Pending' | 'Paid' | 'Failed';
}

export enum PaymentMethod {
  COD = 'Cash on Delivery',
  UPI = 'UPI',
  CARD = 'Credit/Debit Card'
}