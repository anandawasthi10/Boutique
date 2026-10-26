import { apiFetch, ApiException } from './client';
import type {
  User,
  SignupRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SimpleSuccessResponse,
} from '../types';

export const SESSION_ACTIVE_KEY = 'boutique_session_active';

export function hasActiveSession(): boolean {
  if (typeof window === 'undefined') return false;
  if (process.env.NEXT_PUBLIC_USE_MOCK_API === 'true') return true;
  try {
    const local = window.localStorage.getItem(SESSION_ACTIVE_KEY) === '1';
    const cookie = document.cookie
      .split(';')
      .some((item) => item.trim().startsWith(`${SESSION_ACTIVE_KEY}=1`));
    return local || cookie;
  } catch {
    return false;
  }
}

export function setActiveSession(active: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (active) {
      window.localStorage.setItem(SESSION_ACTIVE_KEY, '1');
      document.cookie = `${SESSION_ACTIVE_KEY}=1; path=/; max-age=2592000; SameSite=Lax`;
    } else {
      window.localStorage.removeItem(SESSION_ACTIVE_KEY);
      document.cookie = `${SESSION_ACTIVE_KEY}=; path=/; max-age=0; SameSite=Lax`;
    }
  } catch {
    // Ignore storage errors in restricted contexts
  }
}

export async function signup(request: SignupRequest): Promise<User> {
  const response = await apiFetch<{ user: User }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  setActiveSession(true);
  return response.user;
}

export async function login(request: LoginRequest): Promise<User> {
  const response = await apiFetch<{ user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  setActiveSession(true);
  return response.user;
}

export async function logout(): Promise<SimpleSuccessResponse> {
  try {
    const res = await apiFetch<SimpleSuccessResponse>('/auth/logout', {
      method: 'POST',
    });
    setActiveSession(false);
    return res;
  } catch (err) {
    setActiveSession(false);
    throw err;
  }
}

export async function getCurrentUser(): Promise<User | null> {
  // Unauthenticated guests do not send requests to /me
  if (!hasActiveSession()) {
    return null;
  }

  try {
    const response = await apiFetch<{ user: User } | User>('/me', {
      method: 'GET',
    });
    if ('user' in response) {
      return response.user;
    }
    return response as User;
  } catch (err: unknown) {
    if (
      err instanceof ApiException &&
      (err.code === 'HTTP_401' ||
        err.code === 'UNAUTHORIZED' ||
        err.code === 'UNAUTHENTICATED')
    ) {
      // Clear stale session flag once so subsequent loads do not re-request
      setActiveSession(false);
      return null;
    }
    throw err;
  }
}

export async function forgotPassword(
  request: ForgotPasswordRequest
): Promise<SimpleSuccessResponse> {
  return apiFetch<SimpleSuccessResponse>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function resetPassword(
  request: ResetPasswordRequest
): Promise<SimpleSuccessResponse> {
  return apiFetch<SimpleSuccessResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
