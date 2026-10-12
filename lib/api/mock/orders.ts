import { Order, OrdersResponse } from '../../types';
import { ApiException } from '../client';
import { INITIAL_ORDERS } from './data';
import { getCurrentUser } from './auth';

export const ordersStore: Order[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));

export async function getOrders(params?: {
  page?: number;
  pageSize?: number;
}): Promise<OrdersResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sorted = [...ordersStore].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      const page = params?.page || 1;
      const pageSize = params?.pageSize || 10;
      const total = sorted.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const items = sorted.slice((page - 1) * pageSize, page * pageSize);

      resolve({
        items,
        total,
        page,
        pageSize,
        totalPages,
      });
    }, 15);
  });
}

export async function getOrderById(id: string): Promise<Order> {
  const currentUser = await getCurrentUser();
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === 'ord-other-user') {
        reject(
          new ApiException({
            code: 'ORDER_NOT_FOUND',
            message: 'The requested order could not be found.',
          })
        );
        return;
      }

      const order = ordersStore.find((o) => o.id === id || o.orderNumber === id);
      if (!order) {
        reject(
          new ApiException({
            code: 'ORDER_NOT_FOUND',
            message: 'The requested order could not be found.',
          })
        );
        return;
      }

      if (order.userId && currentUser && order.userId !== currentUser.id) {
        reject(
          new ApiException({
            code: 'ORDER_NOT_FOUND',
            message: 'The requested order could not be found.',
          })
        );
        return;
      }

      resolve(JSON.parse(JSON.stringify(order)));
    }, 15);
  });
}

export function addOrderInternal(order: Order): void {
  ordersStore.unshift(order);
}

export function updateOrderStatusInternal(id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): void {
  const o = ordersStore.find((x) => x.id === id || x.orderNumber === id);
  if (o) {
    o.status = status;
    if (paymentStatus) {
      o.paymentStatus = paymentStatus;
    }
  }
}
