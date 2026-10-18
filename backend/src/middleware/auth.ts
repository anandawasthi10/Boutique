import { FastifyRequest, FastifyReply } from 'fastify';
import { SessionRepository } from '../repositories/session-repository.js';
import { hashToken } from '../utils/security.js';
import { UnauthenticatedError, ForbiddenError } from '../errors/app-error.js';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
    sessionId?: string;
  }
}

export function createAuthMiddleware(sessionRepo: SessionRepository, staffApiKey?: string) {
  const getSessionToken = (request: FastifyRequest): string | null => {
    // 1. Check signed/unsigned cookie
    const cookie = request.cookies?.boutique_session;
    if (cookie && typeof cookie === 'string' && cookie.trim().length > 0) {
      return cookie.trim();
    }

    // 2. Check Bearer Authorization header
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7).trim();
    }

    return null;
  };

  const authenticateCustomer = async (request: FastifyRequest, _reply: FastifyReply) => {
    const rawToken = getSessionToken(request);
    if (!rawToken) {
      throw new UnauthenticatedError('Authentication required');
    }

    const tokenHash = hashToken(rawToken);
    const result = await sessionRepo.findActiveByHash(tokenHash);

    if (!result) {
      throw new UnauthenticatedError('Invalid or expired session. Please log in again.');
    }

    // Update activity timestamp non-blockingly
    sessionRepo.updateLastActive(result.session.id).catch(() => {});

    request.user = result.user;
    request.sessionId = result.session.id;
  };

  const authenticateOptional = async (request: FastifyRequest, _reply: FastifyReply) => {
    const rawToken = getSessionToken(request);
    if (!rawToken) return;

    try {
      const tokenHash = hashToken(rawToken);
      const result = await sessionRepo.findActiveByHash(tokenHash);
      if (result) {
        request.user = result.user;
        request.sessionId = result.session.id;
      }
    } catch {
      // Ignored for optional authentication
    }
  };

  const authenticateStaff = async (request: FastifyRequest, _reply: FastifyReply) => {
    const apiKeyHeader = request.headers['x-staff-api-key'];
    const expectedKey = staffApiKey || process.env.STAFF_API_KEY;

    if (
      typeof apiKeyHeader === 'string' &&
      expectedKey &&
      apiKeyHeader.trim() === expectedKey.trim()
    ) {
      request.user = {
        id: 'staff_system',
        name: 'Staff Internal',
        email: 'staff@boutique.local',
        role: 'staff',
      };
      return;
    }

    // Also allow logged-in staff role if present
    await authenticateOptional(request, _reply);
    if (request.user && request.user.role === 'staff') {
      return;
    }

    throw new ForbiddenError('Staff authorization required');
  };

  return {
    authenticateCustomer,
    authenticateOptional,
    authenticateStaff,
  };
}
