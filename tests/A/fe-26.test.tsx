import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { ForgotPasswordContent } from '@/app/forgot-password/ForgotPasswordContent';
import { ResetPasswordContent } from '@/app/reset-password/ResetPasswordContent';
import { authApi, ApiException } from '@/lib/api';

let mockSearchParams = new URLSearchParams('');

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/reset-password',
}));

describe('FE-26: Forgot and reset password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams('');
  });

  describe('Forgot Password Page', () => {
    it('validates email format before sending and focuses invalid field', () => {
      render(<ForgotPasswordContent />);

      const submitBtn = screen.getByTestId('forgot-password-submit-btn');
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Email address is required/i)).toBeInTheDocument();
      expect(document.activeElement).toBe(screen.getByLabelText(/Email Address/i));

      const emailInput = screen.getByLabelText(/Email Address/i);
      fireEvent.change(emailInput, { target: { value: 'notanemail' } });
      fireEvent.click(submitBtn);

      expect(screen.getByText(/Please enter a valid email address/i)).toBeInTheDocument();
    });

    it('shows the exact same neutral confirmation whether or not the account exists', async () => {
      const forgotPasswordSpy = vi.spyOn(authApi, 'forgotPassword').mockResolvedValue({
        success: true,
        message: 'Neutral confirmation',
      });

      render(<ForgotPasswordContent />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      fireEvent.change(emailInput, { target: { value: 'unknown.user@example.com' } });

      const submitBtn = screen.getByTestId('forgot-password-submit-btn');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByTestId('forgot-password-confirmation')).toBeInTheDocument();
      });

      // Contains neutral confirmation text
      expect(
        screen.getByText(
          /If an account exists with this email address, we have sent instructions to reset your password/i
        )
      ).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Return to Sign In/i })).toHaveAttribute('href', '/login');
      expect(forgotPasswordSpy).toHaveBeenCalledWith({ email: 'unknown.user@example.com' });
    });

    it('prevents double submission while request is in-flight', async () => {
      let resolvePromise: (value: { success: boolean; message?: string }) => void;
      const promise = new Promise<{ success: boolean; message?: string }>((resolve) => {
        resolvePromise = resolve;
      });

      const forgotPasswordSpy = vi.spyOn(authApi, 'forgotPassword').mockReturnValue(promise);

      render(<ForgotPasswordContent />);

      const emailInput = screen.getByLabelText(/Email Address/i);
      fireEvent.change(emailInput, { target: { value: 'customer@example.com' } });

      const submitBtn = screen.getByTestId('forgot-password-submit-btn');
      fireEvent.click(submitBtn);

      expect(submitBtn).toBeDisabled();
      fireEvent.click(submitBtn);
      expect(forgotPasswordSpy).toHaveBeenCalledTimes(1);

      resolvePromise!({ success: true });
      await waitFor(() => {
        expect(screen.getByTestId('forgot-password-confirmation')).toBeInTheDocument();
      });
    });
  });

  describe('Reset Password Page', () => {
    it('shows clear error and link to request new link when token is missing', () => {
      mockSearchParams = new URLSearchParams('');
      render(<ResetPasswordContent />);

      expect(screen.getByTestId('reset-password-invalid-token')).toBeInTheDocument();
      expect(screen.getByText(/This password reset link is invalid or has expired/i)).toBeInTheDocument();

      const requestLink = screen.getByRole('link', { name: /Request a New Link/i });
      expect(requestLink).toHaveAttribute('href', '/forgot-password');
    });

    it('shows clear message and link to request new link when token is invalid or expired on server', async () => {
      mockSearchParams = new URLSearchParams('token=expired-token-12345');

      vi.spyOn(authApi, 'resetPassword').mockRejectedValue(
        new ApiException({
          code: 'TOKEN_INVALID_OR_EXPIRED',
          message: 'This password reset link is invalid or has expired. Please request a new link.',
        })
      );

      render(<ResetPasswordContent />);

      expect(screen.queryByTestId('reset-password-invalid-token')).not.toBeInTheDocument();

      const newPasswordInput = screen.getByLabelText(/^New Password/i);
      const confirmPasswordInput = screen.getByLabelText(/^Confirm New Password/i);

      fireEvent.change(newPasswordInput, { target: { value: 'ValidPassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPassword123' } });

      const submitBtn = screen.getByTestId('reset-password-submit-btn');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByTestId('reset-password-invalid-token')).toBeInTheDocument();
      });

      expect(screen.getByText(/This password reset link is invalid or has expired/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Request a New Link/i })).toHaveAttribute(
        'href',
        '/forgot-password'
      );
    });

    it('validates minimum 8 characters and matching passwords', () => {
      mockSearchParams = new URLSearchParams('token=valid-token-secret');

      render(<ResetPasswordContent />);

      const newPasswordInput = screen.getByLabelText(/^New Password/i);
      const confirmPasswordInput = screen.getByLabelText(/^Confirm New Password/i);
      const submitBtn = screen.getByTestId('reset-password-submit-btn');

      // 1. Empty submission
      fireEvent.click(submitBtn);
      expect(screen.getByText(/New password is required/i)).toBeInTheDocument();

      // 2. Short password (< 8 chars)
      fireEvent.change(newPasswordInput, { target: { value: 'short' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();

      // 3. Confirm password empty or mismatch
      fireEvent.change(newPasswordInput, { target: { value: 'StrongPassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword456' } });
      fireEvent.click(submitBtn);
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });

    it('confirms success with a link to login when password reset succeeds', async () => {
      const secretToken = 'super-secret-reset-token-xyz';
      mockSearchParams = new URLSearchParams(`token=${secretToken}`);

      const resetPasswordSpy = vi.spyOn(authApi, 'resetPassword').mockResolvedValue({
        success: true,
        message: 'Password reset successful',
      });

      render(<ResetPasswordContent />);

      const newPasswordInput = screen.getByLabelText(/^New Password/i);
      const confirmPasswordInput = screen.getByLabelText(/^Confirm New Password/i);

      fireEvent.change(newPasswordInput, { target: { value: 'BrandNewPassword123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'BrandNewPassword123' } });

      const submitBtn = screen.getByTestId('reset-password-submit-btn');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByTestId('reset-password-success')).toBeInTheDocument();
      });

      expect(screen.getByText(/Password Reset Complete/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Sign In/i })).toHaveAttribute('href', '/login');
      expect(resetPasswordSpy).toHaveBeenCalledWith({
        token: secretToken,
        newPassword: 'BrandNewPassword123',
      });
    });

    it('does not display or log the reset token anywhere in the rendered page text', () => {
      const secretToken = 'secret-uuid-token-cannot-leak-9988';
      mockSearchParams = new URLSearchParams(`token=${secretToken}`);

      const { container } = render(<ResetPasswordContent />);

      // The secret token string must never appear in the visible text or DOM content
      expect(container.textContent).not.toContain(secretToken);
      expect(screen.queryByText(new RegExp(secretToken, 'i'))).not.toBeInTheDocument();
    });

    it('toggles password visibility with accessible label announcement', () => {
      mockSearchParams = new URLSearchParams('token=valid-token');

      render(<ResetPasswordContent />);

      const newPasswordInput = screen.getByLabelText(/^New Password/i);
      expect(newPasswordInput).toHaveAttribute('type', 'password');

      const toggleButtons = screen.getAllByRole('button', { name: /Show password/i });
      const newPasswordToggle = toggleButtons[0];

      fireEvent.click(newPasswordToggle);
      expect(newPasswordInput).toHaveAttribute('type', 'text');
      expect(newPasswordToggle).toHaveAttribute('aria-label', 'Hide password');

      fireEvent.click(newPasswordToggle);
      expect(newPasswordInput).toHaveAttribute('type', 'password');
    });
  });
});
