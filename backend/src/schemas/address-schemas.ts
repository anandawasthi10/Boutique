import { z } from 'zod';

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export function normalizeIndianState(val: string): string | null {
  const trimmed = val.trim().toLowerCase();
  const found = INDIAN_STATES.find((s) => s.toLowerCase() === trimmed);
  return found || null;
}

export const CreateAddressSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100).optional(),
    recipientName: z.string().min(2).max(100).optional(),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Phone must be a valid 10-digit Indian mobile number'),
    line1: z.string().min(3, 'Address line 1 must be at least 3 characters').max(200),
    line2: z.string().max(200).optional().nullable(),
    landmark: z.string().max(100).optional().nullable(),
    city: z.string().min(2, 'City is required').max(100),
    state: z.string().refine((val) => normalizeIndianState(val) !== null, {
      message: 'State must be a valid Indian state or union territory',
    }),
    pincode: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits').optional(),
    pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits').optional(),
    isDefault: z.boolean().default(false),
  })
  .transform((data, ctx) => {
    const resolvedName = data.fullName || data.recipientName;
    if (!resolvedName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['fullName'],
        message: 'Full name or recipientName is required',
      });
    }

    const resolvedPin = data.pincode || data.pinCode;
    if (!resolvedPin) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['pincode'],
        message: 'PIN code or pinCode is required',
      });
    }

    const canonicalState = normalizeIndianState(data.state)!;

    return {
      fullName: resolvedName || '',
      phone: data.phone,
      line1: data.line1,
      line2: data.line2 || null,
      landmark: data.landmark || null,
      city: data.city,
      state: canonicalState,
      pincode: resolvedPin || '',
      isDefault: data.isDefault,
    };
  });

export const UpdateAddressSchema = z
  .object({
    fullName: z.string().min(2).max(100).optional(),
    recipientName: z.string().min(2).max(100).optional(),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, 'Phone must be a valid 10-digit Indian mobile number')
      .optional(),
    line1: z.string().min(3).max(200).optional(),
    line2: z.string().max(200).optional().nullable(),
    landmark: z.string().max(100).optional().nullable(),
    city: z.string().min(2).max(100).optional(),
    state: z
      .string()
      .refine((val) => normalizeIndianState(val) !== null, {
        message: 'State must be a valid Indian state or union territory',
      })
      .optional(),
    pincode: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits').optional(),
    pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be exactly 6 digits').optional(),
    isDefault: z.boolean().optional(),
  })
  .transform((data) => {
    const resolvedName = data.fullName || data.recipientName;
    const resolvedPin = data.pincode || data.pinCode;
    const canonicalState = data.state ? normalizeIndianState(data.state)! : undefined;

    return {
      fullName: resolvedName,
      phone: data.phone,
      line1: data.line1,
      line2: data.line2,
      landmark: data.landmark,
      city: data.city,
      state: canonicalState,
      pincode: resolvedPin,
      isDefault: data.isDefault,
    };
  });

export const AddressParamsSchema = z.object({
  id: z.string().min(1, 'Address ID is required'),
});

export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;
export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;
