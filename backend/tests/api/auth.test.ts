import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';
import { FakeEmailAdapter } from '../../src/adapters/email/index.js';
import { createTestDatabase } from '../../src/db/index.js';

describe('BE-05, BE-06, BE-07, BE-22: Authentication and Transactional Email', () => {
  let app: FastifyInstance;
  let emailAdapter: FakeEmailAdapter;

  beforeAll(async () => {
    emailAdapter = new FakeEmailAdapter();
    const { db } = await createTestDatabase();

    app = buildApp({
      db,
      emailAdapter,
      frontendOrigin: 'http://localhost:3000',
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  const testUser = {
    name: 'Ananya Sharma',
    email: 'ananya@example.com',
    password: 'super-secure-password-2026',
  };

  it('rejects passwords shorter than 8 characters', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Test',
        email: 'short@example.com',
        password: 'short',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('VALIDATION_FAILED');
  });

  it('rejects common passwords like 12345678', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: {
        name: 'Test',
        email: 'common@example.com',
        password: '12345678',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('VALIDATION_FAILED');
    expect(body.error.details[0].message).toContain('too common');
  });

  let sessionCookie: string;

  it('registers a new user and issues a session cookie (BE-05)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: testUser,
    });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.user).toBeDefined();
    expect(body.user.name).toBe(testUser.name);
    expect(body.user.email).toBe(testUser.email);
    expect(body.user.id).toMatch(/^usr_/);

    // Verify httpOnly cookie
    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie!;
    expect(cookieHeader).toContain('boutique_session=');
    expect(cookieHeader).toContain('HttpOnly');
    expect(cookieHeader).toContain('SameSite=Lax');

    sessionCookie = cookieHeader.split(';')[0];
  });

  it('duplicate email registration returns generic 409 CONFLICT without leaking info', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: testUser,
    });

    expect(res.statusCode).toBe(409);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('CONFLICT');
  });

  it('login with wrong password returns generic 401 INVALID_CREDENTIALS', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: testUser.email,
        password: 'wrong-password-here',
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('login with non-existent email returns generic 401 INVALID_CREDENTIALS', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: 'ghost@example.com',
        password: 'password-whatever',
      },
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('login with correct credentials succeeds and issues new session cookie (BE-05)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: testUser.email,
        password: testUser.password,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.user.email).toBe(testUser.email);

    const setCookie = res.headers['set-cookie'];
    expect(setCookie).toBeDefined();
    const cookieHeader = Array.isArray(setCookie) ? setCookie[0] : setCookie!;
    sessionCookie = cookieHeader.split(';')[0];
  });

  it('GET /api/v1/auth/me returns current user profile when authenticated (BE-06)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        cookie: sessionCookie,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.user.email).toBe(testUser.email);
    expect(body.user.name).toBe(testUser.name);
  });

  it('GET /api/v1/auth/me returns 401 UNAUTHENTICATED without session', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
    });

    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('UNAUTHENTICATED');
  });

  it('forgot-password sends reset link email and always returns 200 (BE-07, BE-22)', async () => {
    emailAdapter.clear();

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/forgot-password',
      payload: {
        email: testUser.email,
      },
    });

    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.payload);
    expect(body.success).toBe(true);

    expect(emailAdapter.sentEmails.length).toBe(1);
    const sent = emailAdapter.sentEmails[0];
    expect(sent.to).toBe(testUser.email);
    expect(sent.type).toBe('reset_password');
    expect(typeof sent.data.resetLink).toBe('string');
    expect(sent.data.resetLink as string).toContain('/reset-password?token=');
  });

  it('forgot-password on non-existent email returns 200 without sending email', async () => {
    emailAdapter.clear();

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/forgot-password',
      payload: {
        email: 'unregistered@example.com',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(emailAdapter.sentEmails.length).toBe(0);
  });

  it('resets password with valid token and ends other active sessions (BE-07)', async () => {
    // 1. Request reset link
    emailAdapter.clear();
    await app.inject({
      method: 'POST',
      url: '/api/v1/auth/forgot-password',
      payload: { email: testUser.email },
    });

    const resetLink = emailAdapter.sentEmails[0].data.resetLink as string;
    const url = new URL(resetLink);
    const token = url.searchParams.get('token')!;
    expect(token).toBeDefined();

    // 2. Perform reset
    const newPassword = 'brand-new-secure-password-2026';
    const resetRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/reset-password',
      payload: {
        token,
        newPassword,
      },
    });

    expect(resetRes.statusCode).toBe(200);
    const resetBody = JSON.parse(resetRes.payload);
    expect(resetBody.success).toBe(true);

    // 3. Verify old session is terminated
    const meResOldSession = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { cookie: sessionCookie },
    });
    expect(meResOldSession.statusCode).toBe(401);

    // 4. Verify old password no longer works
    const loginOldPass = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: testUser.email, password: testUser.password },
    });
    expect(loginOldPass.statusCode).toBe(401);

    // 5. Verify new password works
    const loginNewPass = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: testUser.email, password: newPassword },
    });
    expect(loginNewPass.statusCode).toBe(200);

    // 6. Verify single-use: token cannot be reused
    const reuseRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/reset-password',
      payload: {
        token,
        newPassword: 'another-password-1234',
      },
    });
    expect(reuseRes.statusCode).toBe(400);
  });

  it('logout terminates session and clears cookie (BE-06)', async () => {
    // 1. Log in
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {
        email: testUser.email,
        password: 'brand-new-secure-password-2026',
      },
    });

    const cookieHeader = loginRes.headers['set-cookie'] as string;
    const cookie = cookieHeader.split(';')[0];

    // 2. Logout
    const logoutRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: { cookie },
    });

    expect(logoutRes.statusCode).toBe(200);

    // 3. Subsequent me query is unauthenticated
    const meRes = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { cookie },
    });

    expect(meRes.statusCode).toBe(401);
  });
});
