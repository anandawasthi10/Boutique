/**
 * Saved Address Types
 * Conforms to Frontend Specification Section 8 (Indian Address Format)
 */

export interface Address {
  id: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault: boolean;
}

export interface AddressInput {
  recipientName: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pinCode: string;
  isDefault?: boolean;
}
