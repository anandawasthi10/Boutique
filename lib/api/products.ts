import { apiFetch } from './client';
import type {
  Product,
  ProductsQueryParams,
  ProductsResponse,
  PriceQuote,
  PriceQuoteRequest,
} from '../types';

export async function getProducts(params?: ProductsQueryParams): Promise<ProductsResponse> {
  return apiFetch<ProductsResponse>('/products', {
    method: 'GET',
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return apiFetch<Product>(`/products/${slug}`, {
    method: 'GET',
  });
}

export async function getPriceQuote(
  productId: string,
  request: PriceQuoteRequest
): Promise<PriceQuote> {
  return apiFetch<PriceQuote>(`/products/${productId}/quote`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
