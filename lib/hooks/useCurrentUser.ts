'use client';

import { useAuth } from './useAuth';

export function useCurrentUser() {
  const { user, isLoading } = useAuth();
  return { user, loading: isLoading };
}
