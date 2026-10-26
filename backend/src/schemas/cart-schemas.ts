import { z } from 'zod';
import { selectionItemSchema } from './catalogue-schemas.js';

export const AddCartItemSchema = z
  .object({
    productId: z.string().min(1, 'Product ID is required'),
    selections: z.array(selectionItemSchema).optional(),
    selectedOptionIds: z.array(z.string().min(1)).optional(),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .max(50, 'Quantity cannot exceed 50 per item')
      .default(1),
  })
  .refine(
    (data) =>
      (data.selections && data.selections.length > 0) ||
      (data.selectedOptionIds && data.selectedOptionIds.length > 0),
    {
      message: 'At least one option selection is required',
    }
  );

export const UpdateCartItemSchema = z
  .object({
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .max(50, 'Quantity cannot exceed 50 per item')
      .optional(),
    selections: z.array(selectionItemSchema).optional(),
    selectedOptionIds: z.array(z.string().min(1)).optional(),
  })
  .refine(
    (data) =>
      data.quantity !== undefined ||
      data.selections !== undefined ||
      data.selectedOptionIds !== undefined,
    {
      message: 'Either quantity or selections must be provided to update',
    }
  );

export const CartItemParamsSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
});

export type AddCartItemInput = z.infer<typeof AddCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>;
