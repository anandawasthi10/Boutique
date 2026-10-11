import { apiFetch } from './client';
import type { Order, OrdersResponse } from '../types';

export async function getOrders(params?: {
  page?: number;
  pageSize?: number;
}): Promise<OrdersResponse> {
  return apiFetch<OrdersResponse>('/orders', {
    method: 'GET',
    params: params as Record<string, string | number | boolean | undefined>,
  });
}

export async function getOrderById(id: string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`, {
    method: 'GET',
  });
}
