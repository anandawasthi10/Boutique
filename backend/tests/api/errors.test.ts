import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../src/app.js';
import { validate } from '../../src/middleware/validate.js';
import { z } from 'zod';
import { NotFoundError, ConflictError } from '../../src/errors/app-error.js';

describe('BE-03: Error Handling, Validation, and Request IDs', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = buildApp();

    // Test route for validation
    app.post(
      '/test/validate',
      {
        preHandler: validate({
          body: z
            .object({
              name: z.string().min(2, 'Name must be at least 2 characters'),
              age: z.number().int().positive('Age must be positive'),
            })
            .strict(),
        }),
      },
      async (req, reply) => {
        return reply.status(200).send({ received: req.body });
      }
    );

    // Test route throwing AppError
    app.get('/test/not-found', async () => {
      throw new NotFoundError('Custom resource was not found');
    });

    app.get('/test/conflict', async () => {
      throw new ConflictError('Resource already exists');
    });

    // Test route throwing unhandled unexpected error
    app.get('/test/crash', async () => {
      throw new Error('Database connection crashed! Sensitive query info here.');
    });

    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('attaches X-Request-Id to every successful response', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['x-request-id']).toBeDefined();
    expect(typeof res.headers['x-request-id']).toBe('string');
  });

  it('preserves client-provided X-Request-Id in response', async () => {
    const customReqId = 'custom-trace-uuid-12345';
    const res = await app.inject({
      method: 'GET',
      url: '/health',
      headers: {
        'x-request-id': customReqId,
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.headers['x-request-id']).toBe(customReqId);
  });

  it('returns 400 VALIDATION_FAILED with field details on invalid input', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/test/validate',
      payload: {
        name: 'a', // too short
        age: -5, // negative
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe('VALIDATION_FAILED');
    expect(body.error.requestId).toBeDefined();
    expect(Array.isArray(body.error.details)).toBe(true);

    const fields = body.error.details.map((d: any) => d.field);
    expect(fields).toContain('name');
    expect(fields).toContain('age');
  });

  it('rejects unknown fields on strict validation schema', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/test/validate',
      payload: {
        name: 'John',
        age: 25,
        extraField: 'not allowed',
      },
    });

    expect(res.statusCode).toBe(400);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('VALIDATION_FAILED');
    const extraFieldIssue = body.error.details.find((d: any) => d.field === 'extraField');
    expect(extraFieldIssue).toBeDefined();
  });

  it('returns 404 NOT_FOUND on unknown route with standard envelope', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/non-existent-route',
    });

    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.requestId).toBeDefined();
    expect(res.headers['x-request-id']).toBe(body.error.requestId);
  });

  it('maps custom AppErrors accurately (e.g. NotFoundError -> 404, ConflictError -> 409)', async () => {
    const notFoundRes = await app.inject({ method: 'GET', url: '/test/not-found' });
    expect(notFoundRes.statusCode).toBe(404);
    const notFoundBody = JSON.parse(notFoundRes.payload);
    expect(notFoundBody.error.code).toBe('NOT_FOUND');
    expect(notFoundBody.error.message).toBe('Custom resource was not found');

    const conflictRes = await app.inject({ method: 'GET', url: '/test/conflict' });
    expect(conflictRes.statusCode).toBe(409);
    const conflictBody = JSON.parse(conflictRes.payload);
    expect(conflictBody.error.code).toBe('CONFLICT');
  });

  it('masks unknown internal errors as 500 INTERNAL_ERROR with no stack trace or raw SQL leaked', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/test/crash',
    });

    expect(res.statusCode).toBe(500);
    const body = JSON.parse(res.payload);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('An unexpected internal error occurred. Please try again later.');
    expect(body.error.requestId).toBeDefined();
    expect(body.stack).toBeUndefined();
    expect(body.error.stack).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain('Database connection crashed');
  });
});
