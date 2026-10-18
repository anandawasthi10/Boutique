import { eq, asc } from 'drizzle-orm';
import { AppDatabase } from '../db/index.js';
import { categories } from '../db/schema.js';

export interface CreateCategoryData {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  published?: boolean;
}

export class CategoryRepository {
  constructor(private db: AppDatabase) {}

  async listPublished() {
    return this.db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        image: categories.image,
        sortOrder: categories.sortOrder,
      })
      .from(categories)
      .where(eq(categories.published, true))
      .orderBy(asc(categories.sortOrder));
  }

  async findById(id: string) {
    const results = await this.db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);
    return results[0] || null;
  }

  async findBySlug(slug: string) {
    const results = await this.db
      .select()
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    return results[0] || null;
  }

  async create(data: CreateCategoryData) {
    const results = await this.db
      .insert(categories)
      .values({
        id: data.id,
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        sortOrder: data.sortOrder ?? 0,
        published: data.published ?? true,
      })
      .returning();
    return results[0];
  }
}
