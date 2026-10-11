'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, LoginRequest, SignupRequest } from '@/lib/types';
import { authApi } from '@/lib/api';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (request: LoginRequest) => Promise<User>;
  signup: (request: SignupRequest) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialUser }) => {
  const [user, setUser] = useState<User | null>(initialUser ?? null);
  const [isLoading, setIsLoading] = useState<boolean>(initialUser === undefined);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      setIsLoading(true);
      setError(null);
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to retrieve current user session.';
      setError(msg);
      setUser(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check current session on mount if no initialUser supplied
  useEffect(() => {
    if (initialUser === undefined) {
      let active = true;
      authApi
        .getCurrentUser()
        .then((currentUser) => {
          if (active) {
            setUser(currentUser);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (active) {
            setUser(null);
            setIsLoading(false);
          }
        });

      return () => {
        active = false;
      };
    }
  }, [initialUser]);

  const login = useCallback(
    async (request: LoginRequest): Promise<User> => {
      setIsLoading(true);
      setError(null);
      try {
        const loggedInUser = await authApi.login(request);
        setUser(loggedInUser);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-changed'));
          window.dispatchEvent(new CustomEvent('auth:login'));
        }
        return loggedInUser;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const signup = useCallback(
    async (request: SignupRequest): Promise<User> => {
      setIsLoading(true);
      setError(null);
      try {
        const newUser = await authApi.signup(request);
        setUser(newUser);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth-changed'));
          window.dispatchEvent(new CustomEvent('auth:signup'));
        }
        return newUser;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Signup failed. Please try again.';
        setError(msg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.logout();
      setUser(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('auth:logout'));
        window.dispatchEvent(new CustomEvent('auth-logout'));
        window.dispatchEvent(new CustomEvent('auth-changed'));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to logout.';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      error,
      login,
      signup,
      logout,
      refreshUser,
      clearError,
    }),
    [user, isLoading, error, login, signup, logout, refreshUser, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      login: async () => {
        throw new Error('No AuthProvider found in component tree');
      },
      signup: async () => {
        throw new Error('No AuthProvider found in component tree');
      },
      logout: async () => {
        throw new Error('No AuthProvider found in component tree');
      },
      refreshUser: async () => null,
      clearError: () => {},
    };
  }
  return context;
}
