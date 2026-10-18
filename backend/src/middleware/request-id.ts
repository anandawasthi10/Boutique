import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

export function setupRequestId(app: FastifyInstance): void {
  // Hook to ensure incoming X-Request-Id is respected or a new UUID is generated
  app.addHook('onRequest', async (request: FastifyRequest, reply: FastifyReply) => {
    const existingId = request.headers['x-request-id'];
    const requestId = (typeof existingId === 'string' && existingId.trim().length > 0)
      ? existingId.trim()
      : randomUUID();

    request.id = requestId;
    reply.header('X-Request-Id', requestId);
  });
}
