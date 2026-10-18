import { z } from 'zod';
import { isCommonPassword } from '../utils/security.js';

export const registerSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Valid email is required').toLowerCase(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .refine((val) => !isCommonPassword(val), {
        message: 'This password is too common and easily guessed. Please choose a stronger password.',
      }),
    phone: z.string().trim().optional(),
  })
  .strict();

export const loginSchema = z
  .object({
    email: z.string().trim().email('Valid email is required').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: z.string().trim().email('Valid email is required').toLowerCase(),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, 'Reset token is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .refine((val) => !isCommonPassword(val), {
        message: 'This password is too common and easily guessed. Please choose a stronger password.',
      }),
  })
  .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
