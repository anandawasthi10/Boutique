/**
 * Order, Checkout & Payment Types
 * Conforms to Frontend Specification Section 8 & Status Glossary
 */

import { Address } from './address';
import { CartItemSelection } from './cart';

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'in_production'
  | 'packed'
  | 'dispatched'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface OrderItem {
  id: string;
  productName: string;
  selectedOptionsText: string;
  selectedOptions?: CartItemSelection[];
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderTotals {
  subtotal: number;
  shipping: number;
  tax?: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: OrderItem[];
  address: Address;
  totals: OrderTotals;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  userId?: string;
}

export interface CheckoutRequest {
  addressId: string;
}

export interface CheckoutResponse {
  order: Order;
  paymentInfo: {
    gateway: string;
    gatewayOrderId?: string;
    amount: number;
    currency: string;
    keyId?: string;
  };
}

export interface OrdersResponse {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
