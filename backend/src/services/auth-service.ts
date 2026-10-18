import { randomUUID } from 'crypto';
import { UserRepository } from '../repositories/user-repository.js';
import { SessionRepository } from '../repositories/session-repository.js';
import { ResetTokenRepository } from '../repositories/reset-token-repository.js';
import { EmailAdapter } from '../adapters/email/index.js';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from '../schemas/auth-schemas.js';
import {
  hashPassword,
  verifyPassword,
  hashToken,
  generateSecureToken,
} from '../utils/security.js';
import {
  ConflictError,
  InvalidCredentialsError,
  ValidationError,
} from '../errors/app-error.js';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private sessionRepo: SessionRepository,
    private resetTokenRepo: ResetTokenRepository,
    private emailAdapter: EmailAdapter
  ) {}

  async register(input: RegisterInput) {
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      // Generic message to prevent account enumeration per security specs
      throw new ConflictError('An account with this email address already exists or could not be created');
    }

    const passwordHash = await hashPassword(input.password);
    const userId = `usr_${randomUUID()}`;

    const user = await this.userRepo.create({
      id: userId,
      name: input.name,
      email: input.email,
      passwordHash,
      role: 'customer',
    });

    const rawSessionToken = generateSecureToken(32);
    const sessionIdHash = hashToken(rawSessionToken);
    const sessionId = `ses_${randomUUID()}`;
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await this.sessionRepo.create({
      id: sessionId,
      sessionIdHash,
      userId: user.id,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      sessionToken: rawSessionToken,
    };
  }

  async login(input: LoginInput) {
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) {
      throw new InvalidCredentialsError('Invalid email or password');
    }

    const isValid = await verifyPassword(user.passwordHash, input.password);
    if (!isValid) {
      throw new InvalidCredentialsError('Invalid email or password');
    }

    const rawSessionToken = generateSecureToken(32);
    const sessionIdHash = hashToken(rawSessionToken);
    const sessionId = `ses_${randomUUID()}`;
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

    await this.sessionRepo.create({
      id: sessionId,
      sessionIdHash,
      userId: user.id,
      expiresAt,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      sessionToken: rawSessionToken,
    };
  }

  async logout(sessionId: string) {
    await this.sessionRepo.delete(sessionId);
    return { success: true, message: 'Logged out successfully' };
  }

  async forgotPassword(input: ForgotPasswordInput, frontendOrigin: string) {
    const user = await this.userRepo.findByEmail(input.email);
    if (user) {
      const rawToken = generateSecureToken(32);
      const tokenHash = hashToken(rawToken);
      const tokenId = `rst_${randomUUID()}`;
      const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

      await this.resetTokenRepo.create({
        id: tokenId,
        tokenHash,
        userId: user.id,
        expiresAt,
      });

      const cleanOrigin = frontendOrigin.trim().replace(/\/$/, '');
      const resetLink = `${cleanOrigin}/reset-password?token=${rawToken}`;

      try {
        await this.emailAdapter.sendPasswordReset(user.email, resetLink);
      } catch {
        // Email errors are logged and never break the user flow
      }
    }

    // Always return success regardless of whether email exists to prevent enumeration
    return {
      success: true,
      message: 'If an account matches that email, a password reset link has been sent.',
    };
  }

  async resetPassword(input: ResetPasswordInput) {
    const tokenHash = hashToken(input.token);
    const resetRecord = await this.resetTokenRepo.findByHash(tokenHash);

    if (
      !resetRecord ||
      resetRecord.usedAt !== null ||
      resetRecord.expiresAt.getTime() < Date.now()
    ) {
      throw new ValidationError('Password reset link is invalid or has expired');
    }

    const passwordHash = await hashPassword(input.newPassword);
    await this.userRepo.updatePassword(resetRecord.userId, passwordHash);
    await this.resetTokenRepo.markUsed(resetRecord.id);

    // End all other active sessions for this user upon password reset
    await this.sessionRepo.deleteAllForUser(resetRecord.userId);

    return {
      success: true,
      message: 'Password has been successfully reset. Please log in with your new password.',
    };
  }
}
