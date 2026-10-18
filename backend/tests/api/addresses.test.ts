import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';
import { createTestDatabase } from '../../src/db/index.js';
import { UserRepository } from '../../src/repositories/user-repository.js';
import { SessionRepository } from '../../src/repositories/session-repository.js';
import { hashPassword, generateToken, hashToken } from '../../src/utils/security.js';

describe('BE-14: Address Management and Indian Format Validation', () => {
  let app: FastifyInstance;
  let userRepo: UserRepository;
  let sessionRepo: SessionRepository;

  let userAId: string;
  let userACookie: string;
  let userBId: string;
  let userBCookie: string;

  beforeAll(async () => {
    const { db } = await createTestDatabase();
    userRepo = new UserRepository(db);
    sessionRepo = new SessionRepository(db);

    // Create User A
    const passwordHash = await hashPassword('secure-password-2026');
    const userA = await userRepo.create({
      name: 'Rohan Mehra',
      email: 'rohan@example.com',
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

    // Create User B (for cross-user ownership tests)
    const userB = await userRepo.create({
      name: 'Priya Verma',
      email: 'priya@example.com',
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

  const validAddressA = {
    fullName: 'Rohan Mehra',
    phone: '9876543210',
    line1: 'Flat 402, Lotus Residency',
    line2: 'MG Road, Indiranagar',
    landmark: 'Near Metro Station',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560038',
    isDefault: true,
  };

  it('rejects invalid Indian PIN code with 400 VALIDATION_FAILED (BE-14)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/addresses',
      headers: { cookie: userACookie },
      payload: {
        ...validAddressA,
        pincode: '12345', // 5 digits instead of 6
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });

  it('rejects invalid Indian phone number with 400 VALIDATION_FAILED (BE-14)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/addresses',
      headers: { cookie: userACookie },
      payload: {
        ...validAddressA,
        phone: '1234567890', // Invalid starting digit for Indian mobile
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });

  it('rejects non-existent Indian state with 400 VALIDATION_FAILED (BE-14)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/addresses',
      headers: { cookie: userACookie },
      payload: {
        ...validAddressA,
        state: 'California', // Not an Indian state
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });

  let addressA1Id: string;

  it('creates an address with valid Indian details and marks first address as default (BE-14)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/addresses',
      headers: { cookie: userACookie },
      payload: validAddressA,
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.id).toMatch(/^addr_/);
    expect(body.fullName).toBe(validAddressA.fullName);
    expect(body.recipientName).toBe(validAddressA.fullName);
    expect(body.pincode).toBe(validAddressA.pincode);
    expect(body.pinCode).toBe(validAddressA.pincode);
    expect(body.state).toBe('Karnataka');
    expect(body.isDefault).toBe(true);

    addressA1Id = body.id;
  });

  it('supports recipientName and pinCode field aliases from frontend specification (BE-14)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/addresses',
      headers: { cookie: userACookie },
      payload: {
        recipientName: 'Rohan Mehra Office',
        phone: '9812345678',
        line1: 'Tower B, Tech Park',
        city: 'Bengaluru',
        state: 'karnataka', // Case-insensitive normalization
        pinCode: '560100',
        isDefault: false,
      },
    });

    expect(res.statusCode).toBe(201);
    const body = JSON.parse(res.payload);
    expect(body.fullName).toBe('Rohan Mehra Office');
    expect(body.recipientName).toBe('Rohan Mehra Office');
    expect(body.pincode).toBe('560100');
    expect(body.pinCode).toBe('560100');
    expect(body.state).toBe('Karnataka');
    expect(body.isDefault).toBe(false);
  });

  it('creating another address with isDefault: true resets the previous default (BE-14)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/addresses',
      headers: { cookie: userACookie },
      payload: {
        fullName: 'Rohan New Primary',
        phone: '9876543211',
        line1: 'House 12, Koramangala',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560034',
        isDefault: true,
      },
    });

    expect(res.statusCode).toBe(201);
    const newAddress = JSON.parse(res.payload);
    expect(newAddress.isDefault).toBe(true);

    // Verify first address is no longer default
    const getPrevRes = await app.inject({
      method: 'GET',
      url: `/api/v1/addresses/${addressA1Id}`,
      headers: { cookie: userACookie },
    });
    expect(getPrevRes.statusCode).toBe(200);
    const prevAddress = JSON.parse(getPrevRes.payload);
    expect(prevAddress.isDefault).toBe(false);
  });

  it('GET /api/v1/addresses returns only user own addresses sorted by isDefault DESC (BE-14)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/addresses',
      headers: { cookie: userACookie },
    });

    expect(res.statusCode).toBe(200);
    const list = JSON.parse(res.payload);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(3);
    expect(list[0].isDefault).toBe(true);
  });

  // Cross-user ownership enforcement
  it('User B cannot read User A address and receives 404 NOT_FOUND (BE-14)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/addresses/${addressA1Id}`,
      headers: { cookie: userBCookie },
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('User B cannot update User A address and receives 404 NOT_FOUND (BE-14)', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/addresses/${addressA1Id}`,
      headers: { cookie: userBCookie },
      payload: {
        city: 'Mumbai',
      },
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('User B cannot delete User A address and receives 404 NOT_FOUND (BE-14)', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/addresses/${addressA1Id}`,
      headers: { cookie: userBCookie },
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('NOT_FOUND');
  });

  it('User A can update and delete their own address (BE-14)', async () => {
    const updateRes = await app.inject({
      method: 'PATCH',
      url: `/api/v1/addresses/${addressA1Id}`,
      headers: { cookie: userACookie },
      payload: {
        landmark: 'Opposite Central Park',
      },
    });
    expect(updateRes.statusCode).toBe(200);
    expect(JSON.parse(updateRes.payload).landmark).toBe('Opposite Central Park');

    const deleteRes = await app.inject({
      method: 'DELETE',
      url: `/api/v1/addresses/${addressA1Id}`,
      headers: { cookie: userACookie },
    });
    expect(deleteRes.statusCode).toBe(200);
    expect(JSON.parse(deleteRes.payload).success).toBe(true);

    // Verify deleted
    const getRes = await app.inject({
      method: 'GET',
      url: `/api/v1/addresses/${addressA1Id}`,
      headers: { cookie: userACookie },
    });
    expect(getRes.statusCode).toBe(404);
  });
});
