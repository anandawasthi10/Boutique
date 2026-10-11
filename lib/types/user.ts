/**
 * User & Authentication Types
 * Conforms to Frontend Specification Section 7 & 8
 */

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt?: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  user: User;
}

export interface SimpleSuccessResponse {
  success: boolean;
  message?: string;
}
