import { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';
import { formatZodError } from './validate.js';

export function setupErrorHandler(app: FastifyInstance): void {
  // Not found handler (404)
  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.id || (reply.getHeader('x-request-id') as string) || 'unknown';
    reply.header('X-Request-Id', requestId);
    return reply.status(404).send({
      error: {
        code: 'NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
        requestId,
      },
    });
  });

  // Global error handler
  app.setErrorHandler((error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.id || (reply.getHeader('x-request-id') as string) || 'unknown';
    reply.header('X-Request-Id', requestId);

    // 1. Known AppError
    if (error instanceof AppError) {
      if (error.statusCode >= 500) {
        request.log.error({ err: error, requestId }, `AppError ${error.code}: ${error.message}`);
      } else {
        request.log.warn({ code: error.code, requestId }, `AppWarning ${error.code}: ${error.message}`);
      }

      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
          requestId,
        },
      });
    }

    // 2. Direct ZodError
    if (error instanceof ZodError) {
      const details = formatZodError(error);
      request.log.warn({ details, requestId }, 'Validation error');
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Validation failed',
          details,
          requestId,
        },
      });
    }

    // 3. Fastify Rate Limit error
    if ('statusCode' in error && error.statusCode === 429) {
      request.log.warn({ requestId }, 'Rate limit exceeded');
      return reply.status(429).send({
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
          requestId,
        },
      });
    }

    // 4. Fastify Body parsing / validation errors (e.g. FST_ERR_CTP_INVALID_JSON)
    if ('statusCode' in error && typeof error.statusCode === 'number' && error.statusCode === 400) {
      request.log.warn({ err: error, requestId }, 'Malformed request');
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid request payload format',
          requestId,
        },
      });
    }

    // 5. Unhandled / Internal Errors (500)
    request.log.error({ err: error, requestId }, 'Unhandled exception');
    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected internal error occurred. Please try again later.',
        requestId,
      },
    });
  });
}
