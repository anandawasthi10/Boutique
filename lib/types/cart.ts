/**
 * Cart & Cart Item Types
 * Conforms to Frontend Specification Section 8
 */

export interface CartItemSelection {
  groupId: string;
  groupLabel: string;
  optionId: string;
  optionLabel: string;
  swatchImageUrl?: string;
  colourValue?: string;
}

export type CartItemStatus = 'available' | 'price_changed' | 'unavailable';

export interface CartItem {
  id: string;
  productId: string;
  productSlug?: string; // CONTRACT-GAP: optional slug to support direct product detail and configuration resolution
  productName: string;
  image: string;
  selectedOptions: CartItemSelection[];
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  status: CartItemStatus;
  notice?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  notices?: string[];
}

export interface AddToCartRequest {
  productId: string;
  selectedOptionIds: string[];
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity?: number;
  selectedOptionIds?: string[];
}
