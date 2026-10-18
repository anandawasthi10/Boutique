import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';
import { createTestDatabase } from '../../src/db/index.js';
import { UserRepository } from '../../src/repositories/user-repository.js';
import { SessionRepository } from '../../src/repositories/session-repository.js';
import { CategoryRepository } from '../../src/repositories/category-repository.js';
import { ProductRepository } from '../../src/repositories/product-repository.js';
import { AddressRepository } from '../../src/repositories/address-repository.js';
import { FakePaymentAdapter } from '../../src/adapters/payment/index.js';
import { FakeEmailAdapter } from '../../src/adapters/email/index.js';
import { hashPassword, generateToken, hashToken } from '../../src/utils/security.js';

describe('BE-15 to BE-18: Checkout, Payment Adapter, Webhooks, and Orders', () => {
  let app: FastifyInstance;
  let userRepo: UserRepository;
  let sessionRepo: SessionRepository;
  let categoryRepo: CategoryRepository;
  let productRepo: ProductRepository;
  let addressRepo: AddressRepository;
  let paymentAdapter: FakePaymentAdapter;
  let emailAdapter: FakeEmailAdapter;

  let userAId: string;
  let userACookie: string;
  let userBId: string;
  let userBCookie: string;
  let addressAId: string;
  let createdOrderId: string;
  let gatewayOrderId: string;

  beforeAll(async () => {
    const { db } = await createTestDatabase();
    userRepo = new UserRepository(db);
    sessionRepo = new SessionRepository(db);
    categoryRepo = new CategoryRepository(db);
    productRepo = new ProductRepository(db);
    addressRepo = new AddressRepository(db);
    paymentAdapter = new FakePaymentAdapter();
    emailAdapter = new FakeEmailAdapter();

    // User A
    const passwordHash = await hashPassword('secure-password-2026');
    const userA = await userRepo.create({
      name: 'Rohan Mehra',
      email: 'rohan.checkout@example.com',
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

    // User B
    const userB = await userRepo.create({
      name: 'Priya Verma',
      email: 'priya.checkout@example.com',
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

    // Category & Product
    await categoryRepo.create({
      id: 'cat_pouches_chk',
      name: 'Pouches',
      slug: 'pouches-chk',
      sortOrder: 1,
      published: true,
    });

    await productRepo.create({
      id: 'prod_coin_pouch',
      slug: 'coin-pouch',
      name: 'Coin Pouch',
      description: 'Handmade cotton coin pouch',
      categoryId: 'cat_pouches_chk',
      basePrice: 20000, // 200.00 INR (20000 paise)
      published: true,
      images: [{ url: 'https://images.example.com/pouch.jpg', alt: 'Pouch', order: 1 }],
      optionGroups: [
        {
          id: 'fabric',
          name: 'Fabric',
          type: 'swatch',
          required: true,
          sortOrder: 1,
          options: [
            {
              id: 'fab_indigo_cotton',
              label: 'Indigo Cotton',
              priceDelta: 0,
              available: true,
            },
          ],
        },
      ],
      compatibilityRules: [],
    });

    // Address for User A
    const addr = await addressRepo.create(userAId, {
      fullName: 'Rohan Mehra',
      phone: '9876543210',
      line1: '123 MG Road',
      line2: null,
      landmark: null,
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      isDefault: true,
    });
    addressAId = addr.id;

    app = buildApp({
      db,
      frontendOrigin: 'http://localhost:3000',
      paymentAdapter,
      emailAdapter,
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  // BE-15: Checkout
  it('rejects checkout when cart is empty with 400 VALIDATION_FAILED (BE-15)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/checkout',
      headers: {
        cookie: userACookie,
        origin: 'http://localhost:3000',
      },
      payload: {
        addressId: addressAId,
      },
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });

  it('adds item to cart and executes successful checkout with 201 CREATED (BE-15, BE-16)', async () => {
    // 1. Add item to cart
    await app.inject({
      method: 'POST',
      url: '/api/v1/cart/items',
      headers: {
        cookie: userACookie,
        origin: 'http://localhost:3000',
      },
      payload: {
        productId: 'prod_coin_pouch',
        quantity: 2,
        selections: [{ groupId: 'fabric', optionId: 'fab_indigo_cotton' }],
      },
    });

    // 2. Checkout
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/checkout',
      headers: {
        cookie: userACookie,
        origin: 'http://localhost:3000',
        'idempotency-key': 'idemp_key_test_001',
      },
      payload: {
        addressId: addressAId,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.order).toBeDefined();
    expect(body.order.orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
    expect(body.order.status).toBe('placed');
    expect(body.order.paymentStatus).toBe('pending');
    expect(body.order.totals.total).toBe(40000); // 2 * 20000 paise
    expect(body.paymentInfo).toBeDefined();
    expect(body.paymentInfo.gateway).toBe('fake');
    expect(body.paymentInfo.amount).toBe(40000);

    createdOrderId = body.order.id;
    gatewayOrderId = body.paymentInfo.gatewayOrderId;

    // Verify cart is now empty
    const cartRes = await app.inject({
      method: 'GET',
      url: '/api/v1/cart',
      headers: {
        cookie: userACookie,
      },
    });
    expect(cartRes.json().items).toHaveLength(0);
  });

  it('returns cached response for identical idempotency key (BE-15)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/checkout',
      headers: {
        cookie: userACookie,
        origin: 'http://localhost:3000',
        'idempotency-key': 'idemp_key_test_001',
      },
      payload: {
        addressId: addressAId,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.order.id).toBe(createdOrderId);
  });

  // BE-17: Payment Webhook
  it('rejects invalid webhook signature with 400 (BE-17)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/webhook',
      headers: {
        'x-fake-signature': 'bad_signature',
      },
      payload: {
        event_id: 'evt_test_bad',
        gatewayOrderId,
        status: 'paid',
        amount: 40000,
        currency: 'INR',
      },
    });

    expect(res.statusCode).toBe(400);
  });

  it('processes valid paid webhook event and updates order to confirmed (BE-17)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/webhook',
      headers: {
        'x-fake-signature': 'valid_sig',
      },
      payload: {
        event_id: 'evt_test_paid_123',
        gatewayOrderId,
        status: 'paid',
        amount: 40000,
        currency: 'INR',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('ok');

    // Verify order detail reflects paid and confirmed
    const orderRes = await app.inject({
      method: 'GET',
      url: `/api/v1/orders/${createdOrderId}`,
      headers: {
        cookie: userACookie,
      },
    });

    expect(orderRes.statusCode).toBe(200);
    const orderData = orderRes.json();
    expect(orderData.status).toBe('confirmed');
    expect(orderData.paymentStatus).toBe('paid');
  });

  it('handles duplicate webhook idempotently without error (BE-17)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/payments/webhook',
      headers: {
        'x-fake-signature': 'valid_sig',
      },
      payload: {
        event_id: 'evt_test_paid_123',
        gatewayOrderId,
        status: 'paid',
        amount: 40000,
        currency: 'INR',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe('already_processed');
  });

  // BE-18: Orders List and Detail
  it('GET /api/v1/orders lists orders for authenticated customer (BE-18)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/orders?page=1&pageSize=10',
      headers: {
        cookie: userACookie,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].id).toBe(createdOrderId);
    expect(body.total).toBe(1);
  });

  it('User B cannot see User A order in list or detail (BE-18 ownership)', async () => {
    const listRes = await app.inject({
      method: 'GET',
      url: '/api/v1/orders',
      headers: {
        cookie: userBCookie,
      },
    });
    expect(listRes.json().items).toHaveLength(0);

    const detailRes = await app.inject({
      method: 'GET',
      url: `/api/v1/orders/${createdOrderId}`,
      headers: {
        cookie: userBCookie,
      },
    });
    expect(detailRes.statusCode).toBe(404);
  });
});
