import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fastifyCors from '@fastify/cors';
import { ForbiddenError } from '../errors/app-error.js';

export interface SecurityOptions {
  frontendOrigin: string;
}

export function setupSecurity(app: FastifyInstance, options: SecurityOptions): void {
  const allowedOrigin = options.frontendOrigin.trim().replace(/\/$/, '');

  // 1. CORS plugin registration
  app.register(fastifyCors, {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. server-to-server, curl, mobile native, webhooks)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.trim().replace(/\/$/, '');
      if (normalizedOrigin === allowedOrigin) {
        return callback(null, true);
      }

      // Block disallowed origins
      return callback(new ForbiddenError(`Origin ${origin} is not allowed by CORS`), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Request-Id',
      'Idempotency-Key',
      'X-Staff-Api-Key',
      'Origin',
      'Accept',
    ],
    exposedHeaders: ['X-Request-Id'],
  });

  // 2. Standard security headers on all responses
  app.addHook('onSend', async (_request: FastifyRequest, reply: FastifyReply, payload) => {
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('X-Frame-Options', 'DENY');
    reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('X-XSS-Protection', '0');
    return payload;
  });

  // 3. Strict Origin check on state-changing requests (CSRF protection for cross-site cookie sessions)
  app.addHook('preValidation', async (request: FastifyRequest, _reply: FastifyReply) => {
    const method = request.method.toUpperCase();
    const isMutating = ['POST', 'PATCH', 'DELETE', 'PUT'].includes(method);

    // Exempt webhook route as webhooks are server-to-server and verified by cryptographic signature
    if (request.url.startsWith('/api/v1/payments/webhook')) {
      return;
    }

    if (isMutating) {
      const origin = request.headers.origin;
      if (origin) {
        const normalizedOrigin = (Array.isArray(origin) ? origin[0] : origin).trim().replace(/\/$/, '');
        if (normalizedOrigin !== allowedOrigin) {
          throw new ForbiddenError(`Cross-origin request from ${origin} is rejected`);
        }
      }
    }
  });
}
