import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env if present
dotenv.config();

export const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    APP_BASE_URL: z.string().url().default('http://localhost:3001'),
    FRONTEND_ORIGIN: z.string().default('http://localhost:3000'),
    DATABASE_URL: z.string({ required_error: 'DATABASE_URL is required' }).min(1, 'DATABASE_URL is required'),
    DATABASE_URL_DIRECT: z.string().optional(),
    SESSION_SECRET: z
      .string({ required_error: 'SESSION_SECRET is required' })
      .min(32, 'SESSION_SECRET must be at least 32 characters'),
    COOKIE_SECURE: z
      .preprocess((val) => {
        if (typeof val === 'string') return val.toLowerCase() === 'true';
        return val;
      }, z.boolean())
      .default(false),
    COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
    COOKIE_DOMAIN: z.string().optional(),
    STAFF_API_KEY: z
      .string({ required_error: 'STAFF_API_KEY is required' })
      .min(16, 'STAFF_API_KEY must be at least 16 characters'),
    PAYMENT_GATEWAY: z.enum(['fake', 'razorpay']).default('fake'),
    PAYMENT_KEY_ID: z.string().optional(),
    PAYMENT_KEY_SECRET: z.string().optional(),
    PAYMENT_WEBHOOK_SECRET: z.string().optional(),
    EMAIL_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().email().default('orders@boutique.local'),
    LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
    SHIPPING_FLAT_RATE: z.coerce.number().int().nonnegative().default(0),
    TAX_RATE_BPS: z.coerce.number().int().nonnegative().default(0),
  })
  .superRefine((data, ctx) => {
    if (data.PAYMENT_GATEWAY === 'razorpay') {
      if (!data.PAYMENT_KEY_ID) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'PAYMENT_KEY_ID is required when PAYMENT_GATEWAY is razorpay',
          path: ['PAYMENT_KEY_ID'],
        });
      }
      if (!data.PAYMENT_KEY_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'PAYMENT_KEY_SECRET is required when PAYMENT_GATEWAY is razorpay',
          path: ['PAYMENT_KEY_SECRET'],
        });
      }
      if (!data.PAYMENT_WEBHOOK_SECRET) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'PAYMENT_WEBHOOK_SECRET is required when PAYMENT_GATEWAY is razorpay',
          path: ['PAYMENT_WEBHOOK_SECRET'],
        });
      }
    }
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown> = process.env): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const errorDetails = result.error.errors
      .map((err) => `${err.path.join('.') || 'configuration'}: ${err.message}`)
      .join('; ');
    throw new Error(`Environment validation failed: ${errorDetails}`);
  }
  return result.data;
}

// Lazy/cached env accessor
let cachedEnv: Env | null = null;
export function getEnv(): Env {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}
