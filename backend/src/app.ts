import fastify, { FastifyInstance, FastifyServerOptions } from 'fastify';

export interface AppOptions extends FastifyServerOptions {
  trustProxy?: boolean;
}

export function buildApp(options: AppOptions = {}): FastifyInstance {
  const app = fastify({
    logger: options.logger ?? false,
    trustProxy: options.trustProxy ?? true,
    ...options,
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
