'use client';

import { useState, useEffect } from 'react';
import { authApi } from '../api';
import { User } from '../types';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      try {
        const u = await authApi.getCurrentUser();
        if (mounted) setUser(u);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    checkUser();

    const handleAuthChange = () => {
      checkUser();
    };

    window.addEventListener('auth-changed', handleAuthChange);
    return () => {
      mounted = false;
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  return { user, loading };
}
