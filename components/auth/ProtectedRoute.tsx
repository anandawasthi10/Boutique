'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  fallback,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const queryString = searchParams?.toString();
      const currentPath = queryString ? `${pathname}?${queryString}` : pathname;
      const destination = `${redirectTo}?returnTo=${encodeURIComponent(currentPath)}`;
      router.replace(destination);
    }
  }, [isLoading, isAuthenticated, pathname, searchParams, redirectTo, router]);

  if (isLoading) {
    return (
      fallback ?? (
        <div
          data-testid="protected-route-loading"
          role="status"
          aria-live="polite"
          className="py-24 flex flex-col items-center justify-center gap-3 text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            Checking authentication...
          </p>
        </div>
      )
    );
  }

  if (!isAuthenticated) {
    return (
      fallback ?? (
        <div
          data-testid="protected-route-redirecting"
          role="status"
          aria-live="polite"
          className="py-24 flex flex-col items-center justify-center gap-3 text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          <p className="text-sm font-medium text-[var(--color-text-muted)]">
            Redirecting to sign in...
          </p>
        </div>
      )
    );
  }

  return <>{children}</>;
};
