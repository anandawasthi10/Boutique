'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { getNeonAuthClient } from '@/lib/neon-auth';
import { sanitizeReturnUrl } from '@/lib/utils/url';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo') || '/account';
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleCallback() {
      try {
        const client = getNeonAuthClient() as any;
        // Try getting session from Neon Auth
        const session = await client.getSession?.();

        if (session?.data && 'user' in session.data && session.data.user) {
          await refreshUser();
          if (isMounted) {
            setStatus('success');
            setTimeout(() => {
              const destination = sanitizeReturnUrl(returnTo, '/account');
              router.push(destination);
            }, 600);
          }
          return;
        }

        // If refresh user succeeds
        const user = await refreshUser();
        if (user) {
          if (isMounted) {
            setStatus('success');
            setTimeout(() => {
              const destination = sanitizeReturnUrl(returnTo, '/account');
              router.push(destination);
            }, 600);
          }
          return;
        }

        // Redirect to account
        if (isMounted) {
          setStatus('success');
          router.push(sanitizeReturnUrl(returnTo, '/account'));
        }
      } catch (err) {
        console.error('Callback error:', err);
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'Authentication verification failed.');
        }
      }
    }

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [refreshUser, returnTo, router]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="bg-surface border border-border rounded-sm p-8 max-w-md w-full text-center shadow-soft">
        {status === 'verifying' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <h2 className="text-h3 text-text">
              Verifying Authentication
            </h2>
            <p className="text-body-small text-text-muted">
              Connecting with Neon Auth and finalizing your secure session...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="w-10 h-10 text-success" />
            <h2 className="text-h3 text-text">
              Authentication Confirmed
            </h2>
            <p className="text-body-small text-text-muted">
              Redirecting you to your account...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="w-10 h-10 text-error" />
            <h2 className="text-h3 text-text">
              Authentication Notice
            </h2>
            <p className="text-body-small text-text-muted">
              {errorMessage || 'Unable to complete sign-in. Please try again.'}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="mt-4 px-6 py-2.5 bg-primary text-primary-text text-xs uppercase tracking-wider font-medium rounded-sm hover:opacity-90 transition-opacity"
            >
              Return to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
