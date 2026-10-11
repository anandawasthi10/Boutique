/**
 * Primary API Gateway Module
 * The SINGLE switching file between the real HTTP client and the mock adapter.
 * Controlled by the public environment flag NEXT_PUBLIC_USE_MOCK_API ('true' | '1').
 */

import * as realProducts from './products';
import * as realCategories from './categories';
import * as realCart from './cart';
import * as realAuth from './auth';
import * as realAddresses from './addresses';
import * as realCheckout from './checkout';
import * as realOrders from './orders';

import * as mockProducts from './mock/products';
import * as mockCategories from './mock/categories';
import * as mockCart from './mock/cart';
import * as mockAuth from './mock/auth';
import * as mockAddresses from './mock/addresses';
import * as mockCheckout from './mock/checkout';
import * as mockOrders from './mock/orders';

import type {
  ProductsQueryParams,
  ProductsResponse,
  Product,
  PriceQuote,
  PriceQuoteRequest,
  CategorySummary,
  Cart,
  AddToCartRequest,
  UpdateCartItemRequest,
  User,
  SignupRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SimpleSuccessResponse,
  Address,
  AddressInput,
  CheckoutRequest,
  CheckoutResponse,
  OrdersResponse,
  Order,
} from '../types';

export { ApiException } from './client';

export function isMockEnabled(): boolean {
  return (
    process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' ||
    process.env.NEXT_PUBLIC_USE_MOCK_API === '1'
  );
}

// Modular API services that route based on NEXT_PUBLIC_USE_MOCK_API
export const productsApi = {
  getProducts: (params?: ProductsQueryParams): Promise<ProductsResponse> =>
    isMockEnabled() ? mockProducts.getProducts(params) : realProducts.getProducts(params),
  getProductBySlug: (slug: string): Promise<Product> =>
    isMockEnabled() ? mockProducts.getProductBySlug(slug) : realProducts.getProductBySlug(slug),
  getPriceQuote: (productId: string, request: PriceQuoteRequest): Promise<PriceQuote> =>
    isMockEnabled() ? mockProducts.getPriceQuote(productId, request) : realProducts.getPriceQuote(productId, request),
};

export const categoriesApi = {
  getCategories: (): Promise<CategorySummary[]> =>
    isMockEnabled() ? mockCategories.getCategories() : realCategories.getCategories(),
};

export const cartApi = {
  getCart: (): Promise<Cart> =>
    isMockEnabled() ? mockCart.getCart() : realCart.getCart(),
  addToCart: (request: AddToCartRequest): Promise<Cart> =>
    isMockEnabled() ? mockCart.addToCart(request) : realCart.addToCart(request),
  updateCartItem: (itemId: string, request: UpdateCartItemRequest): Promise<Cart> =>
    isMockEnabled() ? mockCart.updateCartItem(itemId, request) : realCart.updateCartItem(itemId, request),
  removeCartItem: (itemId: string): Promise<Cart> =>
    isMockEnabled() ? mockCart.removeCartItem(itemId) : realCart.removeCartItem(itemId),
};

export const authApi = {
  signup: (request: SignupRequest): Promise<User> =>
    isMockEnabled() ? mockAuth.signup(request) : realAuth.signup(request),
  login: (request: LoginRequest): Promise<User> =>
    isMockEnabled() ? mockAuth.login(request) : realAuth.login(request),
  logout: (): Promise<SimpleSuccessResponse> =>
    isMockEnabled() ? mockAuth.logout() : realAuth.logout(),
  getCurrentUser: (): Promise<User | null> =>
    isMockEnabled() ? mockAuth.getCurrentUser() : realAuth.getCurrentUser(),
  forgotPassword: (request: ForgotPasswordRequest): Promise<SimpleSuccessResponse> =>
    isMockEnabled() ? mockAuth.forgotPassword(request) : realAuth.forgotPassword(request),
  resetPassword: (request: ResetPasswordRequest): Promise<SimpleSuccessResponse> =>
    isMockEnabled() ? mockAuth.resetPassword(request) : realAuth.resetPassword(request),
};

export const addressesApi = {
  getAddresses: (): Promise<Address[]> =>
    isMockEnabled() ? mockAddresses.getAddresses() : realAddresses.getAddresses(),
  addAddress: (address: AddressInput): Promise<Address> =>
    isMockEnabled() ? mockAddresses.addAddress(address) : realAddresses.addAddress(address),
  editAddress: (id: string, address: Partial<AddressInput>): Promise<Address> =>
    isMockEnabled() ? mockAddresses.editAddress(id, address) : realAddresses.editAddress(id, address),
  deleteAddress: (id: string): Promise<SimpleSuccessResponse> =>
    isMockEnabled() ? mockAddresses.deleteAddress(id) : realAddresses.deleteAddress(id),
};

export const checkoutApi = {
  createCheckout: (request: CheckoutRequest): Promise<CheckoutResponse> =>
    isMockEnabled() ? mockCheckout.createCheckout(request) : realCheckout.createCheckout(request),
};

export const ordersApi = {
  getOrders: (params?: { page?: number; pageSize?: number }): Promise<OrdersResponse> =>
    isMockEnabled() ? mockOrders.getOrders(params) : realOrders.getOrders(params),
  getOrderById: (id: string): Promise<Order> =>
    isMockEnabled() ? mockOrders.getOrderById(id) : realOrders.getOrderById(id),
};
