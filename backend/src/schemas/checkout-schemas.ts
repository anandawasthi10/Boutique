import { z } from 'zod';

export const CheckoutBodySchema = z.object({
  addressId: z.string().min(1, 'Address ID is required'),
});

export const OrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(10),
});

export const OrderIdParamSchema = z.object({
  id: z.string().min(1, 'Order ID is required'),
});

export type CheckoutBodyInput = z.infer<typeof CheckoutBodySchema>;
export type OrdersQueryInput = z.infer<typeof OrdersQuerySchema>;
