import { createAuthClient } from '@neondatabase/auth';
import type { User } from '@/lib/types';

/**
 * Neon Auth configuration and client utilities
 * Integrates Neon Postgres managed authentication (powered by Better Auth)
 * Supports Google OAuth and Google Authenticator (TOTP 2FA).
 */

export interface GoogleAuthResponse {
  success: boolean;
  user?: User;
  redirectUrl?: string;
  error?: string;
}

export interface TotpVerifyResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export const DEFAULT_NEON_AUTH_URL =
  'https://ep-weathered-smoke-b5h1lrnh.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth';
export const DEFAULT_NEON_JWKS_URL =
  'https://ep-weathered-smoke-b5h1lrnh.neonauth.c-7.us-east-2.aws.neon.tech/neondb/auth/.well-known/jwks.json';

// Read Neon Auth base URL from public environment
export function getNeonAuthUrl(): string {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_NEON_AUTH_URL) {
    return process.env.NEXT_PUBLIC_NEON_AUTH_URL;
  }
  return DEFAULT_NEON_AUTH_URL;
}

export function isNeonAuthConfigured(): boolean {
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_NEON_AUTH_URL) {
    return (
      !process.env.NEXT_PUBLIC_NEON_AUTH_URL.includes('sample') &&
      !process.env.NEXT_PUBLIC_NEON_AUTH_URL.includes('dummy')
    );
  }
  return true;
}

let jwksSet: any = null;

export async function verifyNeonJwt(token: string) {
  try {
    const { jwtVerify, createRemoteJWKSet } = await import('jose');
    const jwksUrl =
      (typeof process !== 'undefined' && process.env.NEON_AUTH_JWKS_URL) || DEFAULT_NEON_JWKS_URL;
    if (!jwksSet) {
      jwksSet = createRemoteJWKSet(new URL(jwksUrl));
    }
    const { payload } = await jwtVerify(token, jwksSet);
    return { valid: true, payload };
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : 'Invalid JWT token',
    };
  }
}

let cachedClient: ReturnType<typeof createAuthClient> | null = null;

export function getNeonAuthClient() {
  if (!cachedClient) {
    const authUrl = getNeonAuthUrl();
    try {
      cachedClient = createAuthClient(authUrl);
    } catch (err) {
      console.warn('Failed to initialize Neon Auth client with URL:', authUrl, err);
      // Fallback client
      cachedClient = createAuthClient('http://localhost:3000/api/auth');
    }
  }
  return cachedClient;
}

/**
 * Sign in using Google OAuth via Neon Auth
 */
export async function signInWithGoogle(options?: {
  returnTo?: string;
}): Promise<GoogleAuthResponse> {
  const returnTo = options?.returnTo || '/account';
  const callbackURL = typeof window !== 'undefined'
    ? `${window.location.origin}${returnTo.startsWith('/') ? returnTo : `/${returnTo}`}`
    : returnTo;

  if (isNeonAuthConfigured()) {
    try {
      const client = getNeonAuthClient() as any;
      // Better Auth social login with Google
      const result = await client.signIn?.social?.({
        provider: 'google',
        callbackURL,
      });

      if (result?.error) {
        return {
          success: false,
          error: result.error.message || 'Google authentication failed',
        };
      }

      return {
        success: true,
        redirectUrl: callbackURL,
      };
    } catch (err) {
      console.error('Neon Auth Google sign-in error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Google authentication failed.',
      };
    }
  }

  // Development / Demo mode: Simulate Google authentication when live Neon Auth URL is not yet connected
  return new Promise((resolve) => {
    setTimeout(() => {
      const demoGoogleUser: User = {
        id: `usr-google-${Date.now().toString(36)}`,
        name: 'Google Authenticated User',
        email: 'user.google@boutique.store',
        phone: '+1 (555) 234-5678',
      };
      resolve({
        success: true,
        user: demoGoogleUser,
        redirectUrl: callbackURL,
      });
    }, 600);
  });
}

/**
 * Verify 6-digit TOTP code from Google Authenticator
 */
export async function verifyGoogleAuthenticator(
  code: string,
  email?: string
): Promise<TotpVerifyResponse> {
  const cleanCode = code.replace(/\s+/g, '');

  if (!/^\d{6}$/.test(cleanCode)) {
    return {
      success: false,
      error: 'Please enter a valid 6-digit verification code from Google Authenticator.',
    };
  }

  if (isNeonAuthConfigured()) {
    try {
      const client = getNeonAuthClient() as any;
      if (typeof client.twoFactor?.verifyTotp === 'function') {
        const result = await client.twoFactor.verifyTotp({
          code: cleanCode,
        });

        if (result?.error) {
          return {
            success: false,
            error: result.error.message || 'Invalid Google Authenticator code. Please try again.',
          };
        }

        const user: User = {
          id: (result as { data?: { user?: { id: string; name?: string; email: string } } })?.data?.user?.id || 'usr-neon-2fa',
          name: (result as { data?: { user?: { name?: string } } })?.data?.user?.name || 'Verified User',
          email: email || 'user@boutique.store',
        };

        return {
          success: true,
          user,
        };
      }
    } catch (err) {
      console.warn('Neon TOTP verification encountered error:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Failed to verify authenticator code.',
      };
    }
  }

  // Development / Demo mode: accept valid 6-digit code
  return new Promise((resolve) => {
    setTimeout(() => {
      const demoUser: User = {
        id: `usr-totp-${Date.now().toString(36)}`,
        name: email ? email.split('@')[0] : '2FA Verified Customer',
        email: email || 'verified.customer@boutique.store',
      };
      resolve({
        success: true,
        user: demoUser,
      });
    }, 500);
  });
}
