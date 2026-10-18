import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';
import { createTestDatabase } from '../../src/db/index.js';
import { UserRepository } from '../../src/repositories/user-repository.js';
import { SessionRepository } from '../../src/repositories/session-repository.js';
import { CategoryRepository } from '../../src/repositories/category-repository.js';
import { ProductRepository } from '../../src/repositories/product-repository.js';
import { hashPassword, generateToken, hashToken } from '../../src/utils/security.js';

describe('BE-12, BE-13: Cart Read, Add, Edit, and Real-time Pricing', () => {
  let app: FastifyInstance;
  let userRepo: UserRepository;
  let sessionRepo: SessionRepository;
  let categoryRepo: CategoryRepository;
  let productRepo: ProductRepository;

  let userAId: string;
  let userACookie: string;
  let userBId: string;
  let userBCookie: string;

  const sampleCategory = {
    id: 'cat_scrunchies_cart',
    name: 'Scrunchies',
    slug: 'scrunchies-cart',
    sortOrder: 1,
    published: true,
  };

  const sampleProduct = {
    id: 'prod_velvet_scrunchie',
    slug: 'velvet-scrunchie',
    name: 'Velvet Scrunchie',
    description: 'Plush velvet scrunchie for all occasions',
    categoryId: 'cat_scrunchies_cart',
    basePrice: 15000, // 150.00 INR
    published: true,
    images: [{ url: 'https://images.example.com/velvet.jpg', alt: 'Velvet', order: 1 }],
    optionGroups: [
      {
        id: 'fabric',
        name: 'Fabric',
        type: 'swatch',
        required: true,
        sortOrder: 1,
        options: [
          {
            id: 'fab_burgundy_velvet',
            label: 'Burgundy Velvet',
            priceDelta: 0,
            available: true,
          },
          {
            id: 'fab_midnight_velvet',
            label: 'Midnight Velvet',
            priceDelta: 5000, // +50.00 INR
            available: true,
          },
          {
            id: 'fab_gold_velvet',
            label: 'Gold Velvet',
            priceDelta: 3000,
            available: false, // out of stock
            unavailableReason: 'Gold velvet fabric is out of stock',
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
          { id: 'size_standard', label: 'Standard', priceDelta: 0, available: true },
          { id: 'size_large', label: 'Large', priceDelta: 2000, available: true },
        ],
      },
      {
        id: 'tag',
        name: 'Personalized Tag',
        type: 'toggle',
        required: false,
        sortOrder: 3,
        options: [
          { id: 'tag_metallic', label: 'Metallic Tag', priceDelta: 1500, available: true },
        ],
      },
    ],
    compatibilityRules: [
      {
        id: 'rule_velvet_1',
        primaryOptionId: 'fab_midnight_velvet',
        incompatibleOptionId: 'tag_metallic',
        message: 'Metallic Tag is not compatible with Midnight Velvet',
      },
    ],
  };

  beforeAll(async () => {
    const { db } = await createTestDatabase();
    userRepo = new UserRepository(db);
    sessionRepo = new SessionRepository(db);
    categoryRepo = new CategoryRepository(db);
    productRepo = new ProductRepository(db);

    // Seed category & product
    await categoryRepo.create(sampleCategory);
    await productRepo.create(sampleProduct);

    // Create User A
    const passwordHash = await hashPassword('cart-test-password-1');
    const userA = await userRepo.create({
      name: 'Aarav Patel',
      email: 'aarav@example.com',
      passwordHash,
    });
    userAId = userA.id;
    const tokenA = generateToken();
    await sessionRepo.create({
      userId: userAId,
      sessionIdHash: hashToken(tokenA),
      expiresAt: new Date(Date.now() + 86400000),
    });
    userACookie = `boutique_session=${tokenA}`;

    // Create User B
    const userB = await userRepo.create({
      name: 'Diya Sen',
      email: 'diya@example.com',
      passwordHash,
    });
    userBId = userB.id;
    const tokenB = generateToken();
    await sessionRepo.create({
      userId: userBId,
      sessionIdHash: hashToken(tokenB),
      expiresAt: new Date(Date.now() + 86400000),
    });
    userBCookie = `boutique_session=${tokenB}`;

    app = buildApp({
      db,
      frontendOrigin: 'http://localhost:3000',
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // BE-12: Cart Read & Add
  it('GET /api/v1/cart returns empty cart initially for new user (BE-12)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/cart',
      headers: { cookie: userACookie },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.items).toEqual([]);
    expect(body.subtotal).toBe(0);
    expect(body.currency).toBe('INR');
  });

  it('rejects adding invalid configuration with 422 INVALID_CONFIGURATION (BE-12)', async () => {
    // Missing required 'size' group
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/cart/items',
      headers: { cookie: userACookie },
      payload: {
        productId: sampleProduct.id,
        selections: [{ groupId: 'fabric', optionId: 'fab_burgundy_velvet' }],
        quantity: 1,
      },
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('INVALID_CONFIGURATION');
  });

  it('rejects adding unavailable option with 422 INVALID_CONFIGURATION (BE-12)', async () => {
    // fab_gold_velvet is available: false
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/cart/items',
      headers: { cookie: userACookie },
      payload: {
        productId: sampleProduct.id,
        selections: [
          { groupId: 'fabric', optionId: 'fab_gold_velvet' },
          { groupId: 'size', optionId: 'size_standard' },
        ],
        quantity: 1,
      },
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('INVALID_CONFIGURATION');
  });

  let addedItemId: string;

  it('adds a valid configured item to the cart with price calculation (BE-12)', async () => {
    // Burgundy (+0) + Standard (+0) = 15000 paise
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/cart/items',
      headers: { cookie: userACookie },
      payload: {
        productId: sampleProduct.id,
        selections: [
          { groupId: 'fabric', optionId: 'fab_burgundy_velvet' },
          { groupId: 'size', optionId: 'size_standard' },
        ],
        quantity: 1,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.id).toMatch(/^item_/);
    expect(body.productId).toBe(sampleProduct.id);
    expect(body.unitPrice).toBe(15000);
    expect(body.lineTotal).toBe(15000);
    expect(body.status).toBe('available');
    expect(body.selectedOptions.length).toBe(2);

    addedItemId = body.id;
  });

  it('adding identical item merges and increments quantity (BE-12)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/cart/items',
      headers: { cookie: userACookie },
      payload: {
        productId: sampleProduct.id,
        selections: [
          { groupId: 'fabric', optionId: 'fab_burgundy_velvet' },
          { groupId: 'size', optionId: 'size_standard' },
        ],
        quantity: 2,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.id).toBe(addedItemId);
    expect(body.quantity).toBe(3); // 1 + 2
    expect(body.lineTotal).toBe(15000 * 3);
  });

  it('GET /api/v1/cart reflects updated items and subtotal (BE-12)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/cart',
      headers: { cookie: userACookie },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.items.length).toBe(1);
    expect(body.items[0].quantity).toBe(3);
    expect(body.items[0].status).toBe('available');
    expect(body.subtotal).toBe(45000); // 3 * 15000
  });

  // Cross-user cart isolation
  it('User B sees an empty cart despite User A having items (BE-12)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/cart',
      headers: { cookie: userBCookie },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.items.length).toBe(0);
    expect(body.subtotal).toBe(0);
  });

  // BE-13: Cart Edit & Remove
  it('PATCH /api/v1/cart/items/{itemId} updates quantity (BE-13)', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/cart/items/${addedItemId}`,
      headers: { cookie: userACookie },
      payload: {
        quantity: 2,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.quantity).toBe(2);
    expect(body.lineTotal).toBe(30000);
  });

  it('rejects invalid quantity (0 or > 50) with 400 VALIDATION_FAILED (BE-13)', async () => {
    const resZero = await app.inject({
      method: 'PATCH',
      url: `/api/v1/cart/items/${addedItemId}`,
      headers: { cookie: userACookie },
      payload: { quantity: 0 },
    });
    expect(resZero.statusCode).toBe(400);

    const resTooLarge = await app.inject({
      method: 'PATCH',
      url: `/api/v1/cart/items/${addedItemId}`,
      headers: { cookie: userACookie },
      payload: { quantity: 51 },
    });
    expect(resTooLarge.statusCode).toBe(400);
  });

  it('User B cannot edit User A cart item and receives 404 NOT_FOUND (BE-13)', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/cart/items/${addedItemId}`,
      headers: { cookie: userBCookie },
      payload: { quantity: 5 },
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('User B cannot delete User A cart item and receives 404 NOT_FOUND (BE-13)', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/cart/items/${addedItemId}`,
      headers: { cookie: userBCookie },
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('re-configures cart item with valid options and re-calculates price (BE-13)', async () => {
    // Change to Midnight Velvet (+5000) and Large size (+2000) = 15000 + 7000 = 22000 paise
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/cart/items/${addedItemId}`,
      headers: { cookie: userACookie },
      payload: {
        selections: [
          { groupId: 'fabric', optionId: 'fab_midnight_velvet' },
          { groupId: 'size', optionId: 'size_large' },
        ],
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.unitPrice).toBe(22000);
    expect(body.quantity).toBe(2);
    expect(body.lineTotal).toBe(44000);
  });

  it('rejects editing cart item to incompatible options with 422 INVALID_CONFIGURATION (BE-13)', async () => {
    // Midnight Velvet is incompatible with Metallic Tag
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/cart/items/${addedItemId}`,
      headers: { cookie: userACookie },
      payload: {
        selections: [
          { groupId: 'fabric', optionId: 'fab_midnight_velvet' },
          { groupId: 'size', optionId: 'size_standard' },
          { groupId: 'tag', optionId: 'tag_metallic' },
        ],
      },
    });

    expect(res.statusCode).toBe(422);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('INVALID_CONFIGURATION');
  });

  it('DELETE /api/v1/cart/items/{itemId} removes item from cart (BE-13)', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/cart/items/${addedItemId}`,
      headers: { cookie: userACookie },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);

    // Verify cart is now empty
    const cartRes = await app.inject({
      method: 'GET',
      url: '/api/v1/cart',
      headers: { cookie: userACookie },
    });
    expect(cartRes.statusCode).toBe(200);
    const cartBody = JSON.parse(cartRes.payload);
    expect(cartBody.items.length).toBe(0);
    expect(cartBody.subtotal).toBe(0);
  });
});
