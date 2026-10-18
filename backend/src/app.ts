import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';
import { setupRequestId } from './middleware/request-id.js';
import { setupErrorHandler } from './middleware/error-handler.js';
import { setupSecurity } from './middleware/security.js';

export interface AppOptions extends FastifyServerOptions {
  trustProxy?: boolean;
  frontendOrigin?: string;
}

export function buildApp(options: AppOptions = {}): FastifyInstance {
  const app = fastify({
    logger: options.logger ?? false,
    trustProxy: options.trustProxy ?? true,
    ...options,
  });

  // Request ID setup
  setupRequestId(app);

  // Global Error Handler
  setupErrorHandler(app);

  // Security headers & CORS
  setupSecurity(app, {
    frontendOrigin: options.frontendOrigin ?? process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
  });

  // Health check routes - serving both /api/v1/health and /health per decisions
  const healthHandler = async (_request: unknown, reply: any) => {
    return reply.status(200).send({
      status: 'ok',
      service: 'boutique-backend',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  };

  app.get('/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  return app;
}
