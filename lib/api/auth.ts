import { apiFetch, ApiException } from './client';
import type {
  User,
  SignupRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SimpleSuccessResponse,
} from '../types';

export async function signup(request: SignupRequest): Promise<User> {
  const response = await apiFetch<{ user: User }>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.user;
}

export async function login(request: LoginRequest): Promise<User> {
  const response = await apiFetch<{ user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
  return response.user;
}

export async function logout(): Promise<SimpleSuccessResponse> {
  return apiFetch<SimpleSuccessResponse>('/auth/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await apiFetch<{ user: User } | User>('/me', {
      method: 'GET',
    });
    if ('user' in response) {
      return response.user;
    }
    return response as User;
  } catch (err: unknown) {
    if (err instanceof ApiException && (err.code === 'HTTP_401' || err.code === 'UNAUTHORIZED')) {
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
