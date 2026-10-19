import { eq, and, or, ilike, gte, lte, asc, desc, sql, inArray } from 'drizzle-orm';
import { AppDatabase } from '../db/index.js';
import {
  products,
  categories,
  optionGroups,
  options,
  optionCompatibilityRules,
} from '../db/schema.js';

export interface ProductFilterParams {
  category?: string;
  search?: string;
  fabric?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'name';
  page?: number;
  pageSize?: number;
}

export class ProductRepository {
  constructor(private db: AppDatabase) {}

  async findPublished(params: ProductFilterParams) {
    const page = Math.max(1, params.page || 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize || 12));
    const offset = (page - 1) * pageSize;

    const conditions = [eq(products.published, true)];

    // Category filter by ID or slug
    if (params.category) {
      conditions.push(
        or(
          eq(products.categoryId, params.category),
          eq(categories.slug, params.category)
        )!
      );
    }

    // Search filter across name and description
    if (params.search) {
      const term = `%${params.search.trim()}%`;
      conditions.push(or(ilike(products.name, term), ilike(products.description, term))!);
    }

    // Price range filters
    if (params.minPrice !== undefined) {
      conditions.push(gte(products.basePrice, params.minPrice));
    }
    if (params.maxPrice !== undefined) {
      conditions.push(lte(products.basePrice, params.maxPrice));
    }

    // Fabric filter (D-06: filter products with option group 'fabric' or type 'swatch' matching fabric term)
    if (params.fabric) {
      const fabricTerm = `%${params.fabric.trim()}%`;
      const matchingProductIds = await this.db
        .select({ productId: options.productId })
        .from(options)
        .innerJoin(
          optionGroups,
          and(
            eq(options.productId, optionGroups.productId),
            eq(options.groupId, optionGroups.id)
          )
        )
        .where(
          and(
            or(eq(optionGroups.id, 'fabric'), ilike(optionGroups.name, '%fabric%')),
            or(
              eq(options.id, params.fabric.trim()),
              ilike(options.label, fabricTerm)
            )
          )
        );

      const ids = matchingProductIds.map((r) => r.productId);
      if (ids.length === 0) {
        return { items: [], total: 0, page, pageSize, totalPages: 0 };
      }
      conditions.push(inArray(products.id, ids));
    }

    // Sorting
    let orderByClause = desc(products.createdAt);
    if (params.sort === 'price_asc') {
      orderByClause = asc(products.basePrice);
    } else if (params.sort === 'price_desc') {
      orderByClause = desc(products.basePrice);
    } else if (params.sort === 'name') {
      orderByClause = asc(products.name);
    } else if (params.sort === 'newest') {
      orderByClause = desc(products.createdAt);
    }

    // Execute query
    const rows = await this.db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        basePrice: products.basePrice,
        currency: products.currency,
        images: products.images,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .orderBy(orderByClause)
      .limit(pageSize)
      .offset(offset);

    // Total count query
    const totalCountResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions));

    const total = Number(totalCountResult[0]?.count || 0);
    const totalPages = Math.ceil(total / pageSize);

    return {
      items: rows,
      total,
      page,
      pageSize,
      totalPages,
    };
  }

  async findByIdOrSlug(idOrSlug: string, includeUnpublished = false) {
    const conditions = [
      or(eq(products.id, idOrSlug), eq(products.slug, idOrSlug))!,
    ];
    if (!includeUnpublished) {
      conditions.push(eq(products.published, true));
    }

    const productRows = await this.db
      .select({
        id: products.id,
        slug: products.slug,
        name: products.name,
        description: products.description,
        basePrice: products.basePrice,
        currency: products.currency,
        images: products.images,
        published: products.published,
        category: {
          id: categories.id,
          name: categories.name,
        },
      })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(...conditions))
      .limit(1);

    const product = productRows[0] || null;
    if (!product) return null;

    // Fetch option groups
    const groups = await this.db
      .select()
      .from(optionGroups)
      .where(eq(optionGroups.productId, product.id))
      .orderBy(asc(optionGroups.sortOrder));

    // Fetch options
    const allOptions = await this.db
      .select()
      .from(options)
      .where(eq(options.productId, product.id))
      .orderBy(asc(options.sortOrder));

    // Fetch compatibility rules
    const rules = await this.db
      .select()
      .from(optionCompatibilityRules)
      .where(eq(optionCompatibilityRules.productId, product.id));

    // Group options by optionGroup
    const optionGroupsWithNestedOptions = groups.map((g) => ({
      id: g.id,
      name: g.name,
      label: g.name,
      type: g.type,
      required: g.required,
      sortOrder: g.sortOrder,
      defaultOptionId: g.defaultOptionId || undefined,
      options: allOptions
        .filter((opt) => opt.groupId === g.id)
        .map((opt) => ({
          id: opt.id,
          label: opt.label,
          priceDelta: opt.priceDelta,
          swatchImageUrl: opt.swatchImageUrl || undefined,
          colourValue: opt.colourValue || undefined,
          previewImageUrl: opt.previewImageUrl || undefined,
          detail: opt.detail || undefined,
          available: opt.available,
          unavailableReason: opt.unavailableReason || undefined,
          sortOrder: opt.sortOrder,
        })),
    }));

    return {
      ...product,
      optionGroups: optionGroupsWithNestedOptions,
      compatibilityRules: rules,
    };
  }

  async create(data: {
    id: string;
    slug: string;
    name: string;
    description: string;
    categoryId: string;
    basePrice: number;
    images?: Array<{ url: string; alt: string; order: number }>;
    published?: boolean;
    optionGroups?: Array<{
      id: string;
      name: string;
      type?: string;
      required?: boolean;
      sortOrder?: number;
      defaultOptionId?: string;
      options: Array<{
        id: string;
        label: string;
        priceDelta?: number;
        swatchImageUrl?: string;
        colourValue?: string;
        previewImageUrl?: string;
        detail?: string;
        available?: boolean;
        sortOrder?: number;
      }>;
    }>;
    compatibilityRules?: Array<{
      id: string;
      primaryOptionId: string;
      incompatibleOptionId: string;
      message: string;
    }>;
  }) {
    const createdProduct = await this.db
      .insert(products)
      .values({
        id: data.id,
        slug: data.slug,
        name: data.name,
        description: data.description,
        categoryId: data.categoryId,
        basePrice: data.basePrice,
        images: data.images || [],
        published: data.published ?? true,
      })
      .returning();

    if (data.optionGroups) {
      for (const g of data.optionGroups) {
        await this.db.insert(optionGroups).values({
          id: g.id,
          productId: data.id,
          name: g.name,
          type: g.type || 'swatch',
          required: g.required ?? true,
          sortOrder: g.sortOrder ?? 0,
          defaultOptionId: g.defaultOptionId,
        });

        if (g.options && g.options.length > 0) {
          for (const opt of g.options) {
            await this.db.insert(options).values({
              id: opt.id,
              productId: data.id,
              groupId: g.id,
              label: opt.label,
              priceDelta: opt.priceDelta ?? 0,
              swatchImageUrl: opt.swatchImageUrl,
              colourValue: opt.colourValue,
              previewImageUrl: opt.previewImageUrl,
              detail: opt.detail,
              available: opt.available ?? true,
              sortOrder: opt.sortOrder ?? 0,
            });
          }
        }
      }
    }

    if (data.compatibilityRules && data.compatibilityRules.length > 0) {
      for (const rule of data.compatibilityRules) {
        await this.db.insert(optionCompatibilityRules).values({
          id: rule.id,
          productId: data.id,
          primaryOptionId: rule.primaryOptionId,
          incompatibleOptionId: rule.incompatibleOptionId,
          message: rule.message,
        });
      }
    }

    return createdProduct[0];
  }
}
