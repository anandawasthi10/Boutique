import { eq, and, gt } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { AppDatabase } from '../db/index.js';
import { idempotencyKeys } from '../db/schema.js';

export interface IdempotencyRecord {
  responseStatus: number;
  responseBody: any;
}

export class IdempotencyRepository {
  constructor(private db: AppDatabase) {}

  async find(key: string, userId: string, endpoint: string): Promise<IdempotencyRecord | null> {
    const results = await this.db
      .select()
      .from(idempotencyKeys)
      .where(
        and(
          eq(idempotencyKeys.key, key),
          eq(idempotencyKeys.userId, userId),
          eq(idempotencyKeys.endpoint, endpoint),
          gt(idempotencyKeys.expiresAt, new Date())
        )
      )
      .limit(1);

    if (!results[0]) return null;

    return {
      responseStatus: results[0].responseStatus,
      responseBody: results[0].responseBody,
    };
  }

  async save(
    key: string,
    userId: string,
    endpoint: string,
    requestHash: string,
    responseStatus: number,
    responseBody: any,
    ttlMs: number = 86400000 // 24 hours
  ): Promise<void> {
    const id = `idemp_${randomUUID()}`;
    const expiresAt = new Date(Date.now() + ttlMs);

    try {
      await this.db.insert(idempotencyKeys).values({
        id,
        key,
        userId,
        endpoint,
        requestHash,
        responseStatus,
        responseBody,
        expiresAt,
      });
    } catch {
      // Ignore conflict if duplicate insert happened concurrently
    }
  }
}
