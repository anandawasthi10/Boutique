'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  fallback?: React.ReactNode;
}

const DefaultLoadingFallback = () => (
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
);

const ProtectedRouteInner: React.FC<ProtectedRouteProps> = ({
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
    return fallback ?? <DefaultLoadingFallback />;
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

export const ProtectedRoute: React.FC<ProtectedRouteProps> = (props) => {
  return (
    <Suspense fallback={props.fallback ?? <DefaultLoadingFallback />}>
      <ProtectedRouteInner {...props} />
    </Suspense>
  );
};
