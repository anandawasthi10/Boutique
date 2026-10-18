import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';
import { createTestDatabase } from '../../src/db/index.js';
import { CategoryRepository } from '../../src/repositories/category-repository.js';
import { ProductRepository } from '../../src/repositories/product-repository.js';

describe('BE-08 to BE-11: Catalogue and Price Quote API', () => {
  let app: FastifyInstance;
  let categoryRepo: CategoryRepository;
  let productRepo: ProductRepository;

  const sampleCategory1 = {
    id: 'cat_scrunchies',
    name: 'Scrunchies',
    slug: 'scrunchies',
    description: 'Handmade luxury fabric scrunchies',
    image: 'https://images.example.com/scrunchies.jpg',
    sortOrder: 1,
    published: true,
  };

  const sampleCategory2 = {
    id: 'cat_pouches',
    name: 'Pouches',
    slug: 'pouches',
    description: 'Handcrafted utility pouches',
    image: 'https://images.example.com/pouches.jpg',
    sortOrder: 2,
    published: true,
  };

  const hiddenCategory = {
    id: 'cat_drafts',
    name: 'Drafts',
    slug: 'drafts',
    sortOrder: 3,
    published: false,
  };

  const sampleProduct1 = {
    id: 'prod_corduroy_scrunchie',
    slug: 'corduroy-scrunchie',
    name: 'Corduroy Scrunchie',
    description: 'Plush corduroy scrunchie for everyday comfort',
    categoryId: 'cat_scrunchies',
    basePrice: 19900, // 199.00 INR
    published: true,
    images: [{ url: 'https://images.example.com/scrunchie-1.jpg', alt: 'Corduroy Scrunchie', order: 1 }],
    optionGroups: [
      {
        id: 'fabric',
        name: 'Fabric',
        type: 'swatch',
        required: true,
        sortOrder: 1,
        options: [
          {
            id: 'fab_mocha_cord',
            label: 'Mocha Corduroy',
            priceDelta: 0,
            colourValue: '#8b6b55',
            available: true,
          },
          {
            id: 'fab_emerald_cord',
            label: 'Emerald Corduroy',
            priceDelta: 3000, // +30.00 INR
            colourValue: '#097969',
            available: true,
          },
          {
            id: 'fab_ruby_cord',
            label: 'Ruby Corduroy',
            priceDelta: 2000,
            available: false,
            unavailableReason: 'Ruby fabric is currently out of stock',
          },
        ],
      },
      {
        id: 'size',
        name: 'Size',
        type: 'chips',
        required: true,
        sortOrder: 2,
        options: [
          { id: 'size_regular', label: 'Regular', priceDelta: 0, available: true },
          { id: 'size_jumbo', label: 'Jumbo XL', priceDelta: 5000, available: true }, // +50.00 INR
        ],
      },
      {
        id: 'charm',
        name: 'Add-on Charm',
        type: 'toggle',
        required: false,
        sortOrder: 3,
        options: [
          { id: 'charm_gold_star', label: 'Gold Star Charm', priceDelta: 4000, available: true },
        ],
      },
    ],
    compatibilityRules: [
      {
        id: 'rule_1',
        primaryOptionId: 'fab_emerald_cord',
        incompatibleOptionId: 'charm_gold_star',
        message: 'Gold star charms are not compatible with Emerald Corduroy fabric',
      },
    ],
  };

  const sampleProduct2 = {
    id: 'prod_linen_pouch',
    slug: 'pure-linen-pouch',
    name: 'Pure Linen Pouch',
    description: 'Eco-friendly minimal linen pouch with zip closure',
    categoryId: 'cat_pouches',
    basePrice: 49900, // 499.00 INR
    published: true,
    images: [{ url: 'https://images.example.com/pouch-1.jpg', alt: 'Linen Pouch', order: 1 }],
    optionGroups: [
      {
        id: 'fabric',
        name: 'Fabric',
        type: 'swatch',
        required: true,
        options: [
          { id: 'fab_natural_linen', label: 'Natural Linen', priceDelta: 0, available: true },
        ],
      },
    ],
  };

  beforeAll(async () => {
    const { db } = await createTestDatabase();
    categoryRepo = new CategoryRepository(db);
    productRepo = new ProductRepository(db);

    // Seed test categories
    await categoryRepo.create(sampleCategory1);
    await categoryRepo.create(sampleCategory2);
    await categoryRepo.create(hiddenCategory);

    // Seed test products
    await productRepo.create(sampleProduct1);
    await productRepo.create(sampleProduct2);

    app = buildApp({
      db,
      frontendOrigin: 'http://localhost:3000',
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // BE-08: Categories
  it('GET /api/v1/categories returns published categories ordered by sortOrder (BE-08)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/categories',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(2); // Unpublished category omitted

    expect(body[0].slug).toBe('scrunchies');
    expect(body[1].slug).toBe('pouches');
    expect(body[0].sortOrder).toBeLessThanOrEqual(body[1].sortOrder);
  });

  // BE-09: Products list and filters
  it('GET /api/v1/products returns paged products list (BE-09)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/products',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.items).toBeDefined();
    expect(body.total).toBe(2);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(12);
    expect(body.totalPages).toBe(1);
    expect(body.items.length).toBe(2);
  });

  it('filters products by category slug (BE-09)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/products?category=scrunchies',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.total).toBe(1);
    expect(body.items[0].slug).toBe('corduroy-scrunchie');
  });

  it('filters products by search keyword (BE-09)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/products?search=linen',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.total).toBe(1);
    expect(body.items[0].slug).toBe('pure-linen-pouch');
  });

  it('filters products by fabric option (BE-09, D-06)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/products?fabric=Corduroy',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.total).toBe(1);
    expect(body.items[0].slug).toBe('corduroy-scrunchie');
  });

  it('filters products by price range (BE-09)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/products?minPrice=20000',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.total).toBe(1);
    expect(body.items[0].slug).toBe('pure-linen-pouch');
  });

  it('sorts products by price ascending (BE-09)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/products?sort=price_asc',
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.items[0].basePrice).toBeLessThanOrEqual(body.items[1].basePrice);
  });

  it('rejects invalid query parameters with 400 VALIDATION_FAILED (BE-09)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/products?minPrice=-100',
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });

  // BE-10: Product detail
  it('GET /api/v1/products/{id} and {slug} return identical product detail with option groups (BE-10)', async () => {
    const resSlug = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${sampleProduct1.slug}`,
    });
    expect(resSlug.statusCode).toBe(200);
    const bodySlug = JSON.parse(resSlug.payload);

    const resId = await app.inject({
      method: 'GET',
      url: `/api/v1/products/${sampleProduct1.id}`,
    });
    expect(resId.statusCode).toBe(200);
    const bodyId = JSON.parse(resId.payload);

    expect(bodySlug.id).toBe(bodyId.id);
    expect(bodySlug.optionGroups).toBeDefined();
    expect(bodySlug.optionGroups.length).toBe(3);

    const fabricGroup = bodySlug.optionGroups.find((g: any) => g.id === 'fabric');
    expect(fabricGroup).toBeDefined();
    expect(fabricGroup.options.length).toBe(3);
  });

  it('returns 404 for unknown product identifier (BE-10)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/products/non-existent-product',
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  // BE-11: Quote Endpoint
  it('calculates correct price for valid option selections and quantity (BE-11)', async () => {
    // Mocha corduroy (+0) + Jumbo XL (+5000) = 19900 + 5000 = 24900 paise
    // Quantity 2 -> total 49800 paise
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/products/${sampleProduct1.id}/quote`,
      payload: {
        selections: [
          { groupId: 'fabric', optionId: 'fab_mocha_cord' },
          { groupId: 'size', optionId: 'size_jumbo' },
        ],
        quantity: 2,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.valid).toBe(true);
    expect(body.unitPrice).toBe(24900);
    expect(body.total).toBe(49800);
    expect(body.currency).toBe('INR');
    expect(body.problems).toEqual([]);
    expect(body.lines.length).toBeGreaterThan(0);
  });

  it('returns valid: false when a required option group is omitted (BE-11)', async () => {
    // Only selects fabric, missing required 'size' group
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/products/${sampleProduct1.id}/quote`,
      payload: {
        selections: [{ groupId: 'fabric', optionId: 'fab_mocha_cord' }],
        quantity: 1,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.valid).toBe(false);
    expect(body.problems.length).toBe(1);
    expect(body.problems[0].groupId).toBe('size');
  });

  it('returns valid: false when an option does not belong to group (BE-11)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/products/${sampleProduct1.id}/quote`,
      payload: {
        selections: [
          { groupId: 'fabric', optionId: 'alien_option_id' },
          { groupId: 'size', optionId: 'size_regular' },
        ],
        quantity: 1,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.valid).toBe(false);
    expect(body.problems[0].optionId).toBe('alien_option_id');
  });

  it('returns valid: false when an unavailable option is selected (BE-11)', async () => {
    // fab_ruby_cord is available: false
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/products/${sampleProduct1.id}/quote`,
      payload: {
        selections: [
          { groupId: 'fabric', optionId: 'fab_ruby_cord' },
          { groupId: 'size', optionId: 'size_regular' },
        ],
        quantity: 1,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.valid).toBe(false);
    expect(body.problems[0].message).toContain('out of stock');
  });

  it('returns valid: false when incompatible options are chosen (BE-11)', async () => {
    // Emerald corduroy is incompatible with Gold Star charm
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/products/${sampleProduct1.id}/quote`,
      payload: {
        selections: [
          { groupId: 'fabric', optionId: 'fab_emerald_cord' },
          { groupId: 'size', optionId: 'size_regular' },
          { groupId: 'charm', optionId: 'charm_gold_star' },
        ],
        quantity: 1,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.valid).toBe(false);
    expect(body.problems.some((p: any) => p.message.includes('not compatible'))).toBe(true);
  });

  it('rejects invalid quantity (<= 0) with 400 VALIDATION_FAILED (BE-11)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/products/${sampleProduct1.id}/quote`,
      payload: {
        selections: [{ groupId: 'fabric', optionId: 'fab_mocha_cord' }],
        quantity: 0,
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });
});
