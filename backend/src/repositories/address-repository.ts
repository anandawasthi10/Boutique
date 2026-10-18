import { eq, and, desc, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { AppDatabase } from '../db/index.js';
import { addresses } from '../db/schema.js';
import { CreateAddressInput, UpdateAddressInput } from '../schemas/address-schemas.js';

export interface FormattedAddress {
  id: string;
  fullName: string;
  recipientName: string;
  phone: string;
  line1: string;
  line2: string | null;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  pinCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export function formatAddress(row: typeof addresses.$inferSelect): FormattedAddress {
  return {
    id: row.id,
    fullName: row.fullName,
    recipientName: row.fullName,
    phone: row.phone,
    line1: row.line1,
    line2: row.line2,
    landmark: row.landmark,
    city: row.city,
    state: row.state,
    pincode: row.pincode,
    pinCode: row.pincode,
    isDefault: row.isDefault,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class AddressRepository {
  constructor(private db: AppDatabase) {}

  async listByUserId(userId: string): Promise<FormattedAddress[]> {
    const rows = await this.db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.isDefault), desc(addresses.createdAt));

    return rows.map(formatAddress);
  }

  async findById(id: string, userId: string): Promise<FormattedAddress | null> {
    const rows = await this.db
      .select()
      .from(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
      .limit(1);

    if (!rows[0]) return null;
    return formatAddress(rows[0]);
  }

  async create(userId: string, data: CreateAddressInput): Promise<FormattedAddress> {
    const existing = await this.listByUserId(userId);
    const shouldBeDefault = data.isDefault || existing.length === 0;

    const id = `addr_${randomUUID()}`;

    // If making default, unset any existing default
    if (shouldBeDefault && existing.length > 0) {
      await this.db
        .update(addresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(addresses.userId, userId));
    }

    const [inserted] = await this.db
      .insert(addresses)
      .values({
        id,
        userId,
        fullName: data.fullName,
        phone: data.phone,
        line1: data.line1,
        line2: data.line2 || null,
        landmark: data.landmark || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        isDefault: shouldBeDefault,
      })
      .returning();

    return formatAddress(inserted);
  }

  async update(id: string, userId: string, data: UpdateAddressInput): Promise<FormattedAddress | null> {
    const current = await this.findById(id, userId);
    if (!current) return null;

    if (data.isDefault === true) {
      await this.db
        .update(addresses)
        .set({ isDefault: false, updatedAt: new Date() })
        .where(eq(addresses.userId, userId));
    }

    const updatePayload: Record<string, any> = { updatedAt: new Date() };
    if (data.fullName !== undefined) updatePayload.fullName = data.fullName;
    if (data.phone !== undefined) updatePayload.phone = data.phone;
    if (data.line1 !== undefined) updatePayload.line1 = data.line1;
    if (data.line2 !== undefined) updatePayload.line2 = data.line2;
    if (data.landmark !== undefined) updatePayload.landmark = data.landmark;
    if (data.city !== undefined) updatePayload.city = data.city;
    if (data.state !== undefined) updatePayload.state = data.state;
    if (data.pincode !== undefined) updatePayload.pincode = data.pincode;
    if (data.isDefault !== undefined) updatePayload.isDefault = data.isDefault;

    const [updated] = await this.db
      .update(addresses)
      .set(updatePayload)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
      .returning();

    return formatAddress(updated);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const current = await this.findById(id, userId);
    if (!current) return false;

    await this.db
      .delete(addresses)
      .where(and(eq(addresses.id, id), eq(addresses.userId, userId)));

    // If the deleted address was default, promote another address to default
    if (current.isDefault) {
      const remaining = await this.listByUserId(userId);
      if (remaining.length > 0) {
        await this.db
          .update(addresses)
          .set({ isDefault: true, updatedAt: new Date() })
          .where(eq(addresses.id, remaining[0].id));
      }
    }

    return true;
  }
}
