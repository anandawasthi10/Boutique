import { eq } from 'drizzle-orm';
import { AppDatabase } from '../db/index.js';
import { passwordResetTokens } from '../db/schema.js';

export interface CreateResetTokenData {
  id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
}

export class ResetTokenRepository {
  constructor(private db: AppDatabase) {}

  async create(data: CreateResetTokenData) {
    const results = await this.db
      .insert(passwordResetTokens)
      .values({
        id: data.id,
        tokenHash: data.tokenHash,
        userId: data.userId,
        expiresAt: data.expiresAt,
      })
      .returning();
    return results[0];
  }

  async findByHash(tokenHash: string) {
    const results = await this.db
      .select()
      .from(passwordResetTokens)
      .where(eq(passwordResetTokens.tokenHash, tokenHash))
      .limit(1);
    return results[0] || null;
  }

  async markUsed(id: string) {
    await this.db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, id));
  }
}
