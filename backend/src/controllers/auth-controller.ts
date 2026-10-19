import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '../services/auth-service.js';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../schemas/auth-schemas.js';

export interface CookieConfig {
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  domain?: string;
}

export class AuthController {
  constructor(
    private authService: AuthService,
    private cookieConfig: CookieConfig,
    private frontendOrigin: string
  ) {}

  private setSessionCookie(reply: FastifyReply, token: string): void {
    reply.setCookie('boutique_session', token, {
      path: '/',
      httpOnly: true,
      secure: this.cookieConfig.secure,
      sameSite: this.cookieConfig.sameSite,
      domain: this.cookieConfig.domain || undefined,
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
    });
  }

  register = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as RegisterInput;
    const result = await this.authService.register(body);
    this.setSessionCookie(reply, result.sessionToken);

    return reply.status(200).send({
      user: result.user,
    });
  };

  login = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as LoginInput;
    const result = await this.authService.login(body);
    this.setSessionCookie(reply, result.sessionToken);

    return reply.status(200).send({
      user: result.user,
    });
  };

  logout = async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.sessionId) {
      await this.authService.logout(request.sessionId);
    }

    reply.clearCookie('boutique_session', {
      path: '/',
      httpOnly: true,
      secure: this.cookieConfig.secure,
      sameSite: this.cookieConfig.sameSite,
      domain: this.cookieConfig.domain || undefined,
    });

    return reply.status(200).send({
      success: true,
      message: 'Logged out successfully',
    });
  };

  me = async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required',
          requestId: request.id,
        },
      });
    }

    return reply.status(200).send({
      user: {
        id: request.user.id,
        name: request.user.name,
        email: request.user.email,
      },
    });
  };

  forgotPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as ForgotPasswordInput;
    const result = await this.authService.forgotPassword(body, this.frontendOrigin);
    return reply.status(200).send(result);
  };

  resetPassword = async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as ResetPasswordInput;
    const result = await this.authService.resetPassword(body);
    return reply.status(200).send(result);
  };
}
