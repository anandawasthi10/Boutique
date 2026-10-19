import { eq, and, gt } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { AppDatabase } from '../db/index.js';
import { sessions, users } from '../db/schema.js';

export interface CreateSessionData {
  id?: string;
  sessionIdHash: string;
  userId: string;
  expiresAt: Date;
}

export class SessionRepository {
  constructor(private db: AppDatabase) {}

  async create(data: CreateSessionData) {
    const id = data.id ?? `sess_${randomUUID()}`;
    const results = await this.db
      .insert(sessions)
      .values({
        id,
        sessionIdHash: data.sessionIdHash,
        userId: data.userId,
        expiresAt: data.expiresAt,
      })
      .returning();
    return results[0];
  }

  async findActiveByHash(sessionIdHash: string) {
    const results = await this.db
      .select({
        session: sessions,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          role: users.role,
        },
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(
        and(
          eq(sessions.sessionIdHash, sessionIdHash),
          gt(sessions.expiresAt, new Date())
        )
      )
      .limit(1);

    return results[0] || null;
  }

  async updateLastActive(id: string) {
    await this.db
      .update(sessions)
      .set({ lastActiveAt: new Date() })
      .where(eq(sessions.id, id));
  }

  async delete(id: string) {
    await this.db.delete(sessions).where(eq(sessions.id, id));
  }

  async deleteAllForUser(userId: string) {
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }
}
