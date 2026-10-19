import { eq } from 'drizzle-orm';
import { AppDatabase } from '../db/index.js';
import { users } from '../db/schema.js';

import { randomUUID } from 'crypto';

export interface CreateUserData {
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role?: string;
}

export class UserRepository {
  constructor(private db: AppDatabase) {}

  async findByEmail(email: string) {
    const results = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);
    return results[0] || null;
  }

  async findById(id: string) {
    const results = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return results[0] || null;
  }

  async create(data: CreateUserData) {
    const id = data.id ?? `usr_${randomUUID()}`;
    const results = await this.db
      .insert(users)
      .values({
        id,
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        role: data.role || 'customer',
      })
      .returning();
    return results[0];
  }

  async updatePassword(id: string, passwordHash: string) {
    const results = await this.db
      .update(users)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    return results[0] || null;
  }
}
