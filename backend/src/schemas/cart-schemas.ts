import { z } from 'zod';
import { selectionItemSchema } from './catalogue-schemas.js';

export const AddCartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  selections: z.array(selectionItemSchema).min(1, 'At least one option selection is required'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(50, 'Quantity cannot exceed 50 per item')
    .default(1),
});

export const UpdateCartItemSchema = z
  .object({
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .max(50, 'Quantity cannot exceed 50 per item')
      .optional(),
    selections: z.array(selectionItemSchema).min(1).optional(),
  })
  .refine((data) => data.quantity !== undefined || data.selections !== undefined, {
    message: 'Either quantity or selections must be provided to update',
  });

export const CartItemParamsSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
});

export type AddCartItemInput = z.infer<typeof AddCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
