import { NextRequest, NextResponse } from 'next/server';

/**
 * Neon Auth API Route Handler (Next.js App Router)
 * Mounts the Better Auth endpoints used by @neondatabase/auth
 */

const baseUrl = process.env.NEON_AUTH_BASE_URL || process.env.NEXT_PUBLIC_NEON_AUTH_URL;
const secret = process.env.NEON_AUTH_COOKIE_SECRET || 'boutique-secret-key-neon-auth-min-32-chars!';

// Lazy load createNeonAuth to avoid build issues when credentials are not yet provisioned
let authHandler: any = null;

async function getAuthHandler() {
  if (authHandler) return authHandler;
  if (!baseUrl || baseUrl.includes('dummy') || baseUrl.includes('sample')) {
    return null;
  }

  try {
    const { createNeonAuth } = await import('@neondatabase/auth/next/server');
    const auth = createNeonAuth({
      baseUrl,
      cookies: {
        secret,
      },
    });
    authHandler = auth.handler();
    return authHandler;
  } catch (err) {
    console.warn('Neon Auth handler initialization deferred:', err);
    return null;
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const handler = await getAuthHandler();
  if (handler) {
    return handler.GET(request, context);
  }
  return NextResponse.json({
    service: 'Neon Auth API Handler',
    status: 'idle',
    configured: Boolean(baseUrl && !baseUrl.includes('sample')),
    message: 'To connect live Neon Auth, set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET in .env.local',
  });
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const handler = await getAuthHandler();
  if (handler) {
    return handler.POST(request, context);
  }
  return NextResponse.json({
    service: 'Neon Auth API Handler',
    status: 'idle',
    configured: Boolean(baseUrl && !baseUrl.includes('sample')),
    message: 'To connect live Neon Auth, set NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET in .env.local',
  });
}
