import { z } from 'zod';

export const productsQuerySchema = z
  .object({
    category: z.string().trim().optional(),
    search: z.string().trim().optional(),
    fabric: z.string().trim().optional(),
    minPrice: z.coerce.number().int().nonnegative().optional(),
    priceMin: z.coerce.number().int().nonnegative().optional(),
    maxPrice: z.coerce.number().int().nonnegative().optional(),
    priceMax: z.coerce.number().int().nonnegative().optional(),
    sort: z.enum(['price_asc', 'price_desc', 'newest', 'name']).optional(),
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(12),
  })
  .transform((data) => ({
    ...data,
    minPrice: data.minPrice ?? data.priceMin,
    maxPrice: data.maxPrice ?? data.priceMax,
  }));

export const productDetailParamsSchema = z
  .object({
    slug: z.string().trim().min(1, 'Product identifier is required').optional(),
    id: z.string().trim().min(1, 'Product identifier is required').optional(),
  });

export const quoteBodySchema = z
  .object({
    selections: z
      .array(
        z.object({
          groupId: z.string().trim().min(1, 'groupId is required'),
          optionId: z.string().trim().min(1, 'optionId is required'),
        })
      )
      .optional(),
    selectedOptionIds: z.array(z.string().trim().min(1)).optional(),
    quantity: z.coerce.number().int().positive('Quantity must be at least 1').default(1),
  })
  .strict();

export type ProductsQueryParams = z.infer<typeof productsQuerySchema>;
export type QuoteInput = z.infer<typeof quoteBodySchema>;
