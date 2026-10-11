import {
  User,
  SignupRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SimpleSuccessResponse,
} from '../../types';
import { ApiException } from '../client';
import { MOCK_USER } from './data';

let currentUserState: User | null = { ...MOCK_USER };

export async function getCurrentUser(): Promise<User | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(currentUserState ? { ...currentUserState } : null);
    }, 10);
  });
}

export async function login(request: LoginRequest): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!request.email || !request.password) {
        reject(
          new ApiException({
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required.',
          })
        );
        return;
      }

      if (request.password === 'wrong-password') {
        reject(
          new ApiException({
            code: 'INVALID_CREDENTIALS',
            message: 'The email or password you entered is incorrect.',
          })
        );
        return;
      }

      currentUserState = {
        id: 'usr-signedin-1',
        name: request.email.split('@')[0] || 'Customer',
        email: request.email,
        phone: '9876543210',
      };

      resolve({ ...currentUserState });
    }, 15);
  });
}

export async function signup(request: SignupRequest): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!request.email || !request.password || !request.name) {
        reject(
          new ApiException({
            code: 'VALIDATION_ERROR',
            message: 'Please complete all required fields.',
          })
        );
        return;
      }

      if (request.email === 'taken@example.com') {
        reject(
          new ApiException({
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'An account with this email address already exists.',
            fieldErrors: { email: 'This email is already in use' },
          })
        );
        return;
      }

      currentUserState = {
        id: `usr-${Date.now()}`,
        name: request.name,
        email: request.email,
        phone: request.phone,
      };

      resolve({ ...currentUserState });
    }, 15);
  });
}

export async function logout(): Promise<SimpleSuccessResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUserState = null;
      resolve({ success: true, message: 'Successfully signed out.' });
    }, 10);
  });
}

export async function forgotPassword(
  request: ForgotPasswordRequest
): Promise<SimpleSuccessResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Neutral confirmation regardless of whether email exists (Security Document Section 1)
      if (request.email) {
        // acknowledged
      }
      resolve({
        success: true,
        message: 'If an account exists with this email address, we have sent instructions to reset your password.',
      });
    }, 15);
  });
}

export async function resetPassword(
  request: ResetPasswordRequest
): Promise<SimpleSuccessResponse> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (request.token === 'invalid-token' || request.token === 'expired-token') {
        reject(
          new ApiException({
            code: 'TOKEN_INVALID_OR_EXPIRED',
            message: 'This password reset link is invalid or has expired. Please request a new link.',
          })
        );
        return;
      }

      if (request.newPassword.length < 8) {
        reject(
          new ApiException({
            code: 'PASSWORD_TOO_SHORT',
            message: 'Password must be at least 8 characters long.',
            fieldErrors: { newPassword: 'Must be at least 8 characters' },
          })
        );
        return;
      }

      resolve({
        success: true,
        message: 'Your password has been successfully reset. You may now log in.',
      });
    }, 15);
  });
}
