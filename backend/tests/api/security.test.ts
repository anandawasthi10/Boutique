import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';
import pino from 'pino';
import { REDACTED_PATHS } from '../../src/config/logger.js';

describe('BE-04: Logging, CORS, and Security Headers', () => {
  let app: FastifyInstance;
  const FRONTEND_ORIGIN = 'http://localhost:3000';

  beforeAll(async () => {
    app = buildApp({
      frontendOrigin: FRONTEND_ORIGIN,
    });

    app.post('/test/mutate', async (_req, reply) => {
      return reply.status(200).send({ success: true });
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('includes standard security headers on responses', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['strict-transport-security']).toBe('max-age=31536000; includeSubDomains');
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
  });

  it('allows requests and returns CORS headers when Origin matches FRONTEND_ORIGIN', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        origin: FRONTEND_ORIGIN,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe(FRONTEND_ORIGIN);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('blocks mutating cross-origin requests from disallowed origins with 403 FORBIDDEN', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/test/mutate',
      headers: {
        origin: 'https://evil-hacker-site.com',
      },
    });

    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('FORBIDDEN');
  });

  it('redacts sensitive fields (passwords, tokens, secrets) in structured logger', () => {
    let loggedOutput = '';
    const destination = {
      write: (chunk: string) => {
        loggedOutput += chunk;
      },
    };

    const logger = pino(
      {
        redact: {
          paths: REDACTED_PATHS,
          censor: '[REDACTED]',
        },
      },
      destination
    );

    logger.info({
      user: 'alice@example.com',
      password: 'super-secret-password-123',
      token: 'reset-token-xyz-789',
      secret: 'payment-secret-abc',
      safeField: 'visible-metadata',
    });

    expect(loggedOutput).toContain('"user":"alice@example.com"');
    expect(loggedOutput).toContain('"safeField":"visible-metadata"');
    expect(loggedOutput).toContain('"password":"[REDACTED]"');
    expect(loggedOutput).toContain('"token":"[REDACTED]"');
    expect(loggedOutput).toContain('"secret":"[REDACTED]"');
    expect(loggedOutput).not.toContain('super-secret-password-123');
    expect(loggedOutput).not.toContain('reset-token-xyz-789');
    expect(loggedOutput).not.toContain('payment-secret-abc');
  });
});
