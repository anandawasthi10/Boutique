import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginContent } from '@/app/login/LoginContent';
import { SignupContent } from '@/app/signup/SignupContent';
import { AuthProvider } from '@/lib/hooks/useAuth';
import { authApi, ApiException } from '@/lib/api';
import { User } from '@/lib/types';

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('FE-25: Sign up and login pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Login Page', () => {
    it('validates required fields before sending and moves focus to first invalid field', () => {
      render(
        <AuthProvider initialUser={null}>
          <LoginContent />
        </AuthProvider>
      );

      const submitButton = screen.getByTestId('login-submit-btn');
      fireEvent.click(submitButton);

      // Client validation catches missing email
      expect(screen.getByText('Email address is required.')).toBeInTheDocument();
      const emailInput = screen.getByLabelText(/Email Address/i);
      expect(document.activeElement).toBe(emailInput);
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    it('validates email format before sending', () => {
      render(
        <AuthProvider initialUser={null}>
          <LoginContent />
        </AuthProvider>
      );

      const emailInput = screen.getByLabelText(/Email Address/i);
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } });

      const submitButton = screen.getByTestId('login-submit-btn');
      fireEvent.click(submitButton);

      expect(screen.getByText('Please enter a valid email address.')).toBeInTheDocument();
      expect(document.activeElement).toBe(emailInput);
    });

    it('shows a general message on failed login that does not reveal which credential was incorrect', async () => {
      vi.spyOn(authApi, 'login').mockRejectedValue(
        new ApiException({
          code: 'INVALID_CREDENTIALS',
          message: 'The email or password you entered is incorrect.',
        })
      );

      render(
        <AuthProvider initialUser={null}>
          <LoginContent />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'user@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^Password/i, { selector: 'input' }), {
        target: { value: 'WrongPassword!' },
      });

      fireEvent.click(screen.getByTestId('login-submit-btn'));

      await waitFor(() => {
        const errorAlert = screen.getByTestId('login-general-error');
        expect(errorAlert).toBeInTheDocument();
        expect(errorAlert).toHaveTextContent(/The email or password you entered is incorrect/i);
      });
    });

    it('toggles password visibility with accessible show/hide password control', () => {
      render(
        <AuthProvider initialUser={null}>
          <LoginContent />
        </AuthProvider>
      );

      const passwordInput = screen.getByLabelText(/^Password/i, { selector: 'input' });
      expect(passwordInput).toHaveAttribute('type', 'password');

      const toggleButton = screen.getByRole('button', { name: 'Show password' });
      expect(toggleButton).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });

    it('shows loading state on submit and prevents double submission', async () => {
      let resolveLogin: (u: User) => void;
      const loginPromise = new Promise<User>((res) => {
        resolveLogin = res;
      });

      const loginSpy = vi.spyOn(authApi, 'login').mockReturnValue(loginPromise);

      render(
        <AuthProvider initialUser={null}>
          <LoginContent />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'user@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^Password/i, { selector: 'input' }), {
        target: { value: 'validPassword123' },
      });

      const submitButton = screen.getByTestId('login-submit-btn');
      fireEvent.click(submitButton);

      // While in-flight, button is disabled
      expect(submitButton).toBeDisabled();

      // Second click does nothing
      fireEvent.click(submitButton);
      expect(loginSpy).toHaveBeenCalledTimes(1);

      // Resolve login
      resolveLogin!({ id: 'usr-1', name: 'User', email: 'user@example.com' });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/account');
      });
    });
  });

  describe('Signup Page', () => {
    it('validates required fields, password rules, and displays helper text matching Member B rules', () => {
      render(
        <AuthProvider initialUser={null}>
          <SignupContent />
        </AuthProvider>
      );

      // Member B rule helper text
      expect(
        screen.getByText('Password must be at least 8 characters long.')
      ).toBeInTheDocument();

      const submitButton = screen.getByTestId('signup-submit-btn');
      fireEvent.click(submitButton);

      // Name required
      expect(screen.getByText('Full name is required.')).toBeInTheDocument();
      expect(document.activeElement).toBe(screen.getByLabelText(/Full Name/i));
    });

    it('enforces password minimum length of 8 characters and moves focus', () => {
      render(
        <AuthProvider initialUser={null}>
          <SignupContent />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Priya' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'priya@example.com' },
      });
      const passwordInput = screen.getByLabelText(/^Password/i, { selector: 'input' });
      fireEvent.change(passwordInput, { target: { value: 'short' } });

      fireEvent.click(screen.getByTestId('signup-submit-btn'));

      expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();
      expect(document.activeElement).toBe(passwordInput);
    });

    it('displays server field errors next to fields when registration fails (e.g. email taken)', async () => {
      vi.spyOn(authApi, 'signup').mockRejectedValue(
        new ApiException({
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists.',
          fieldErrors: { email: 'This email is already in use' },
        })
      );

      render(
        <AuthProvider initialUser={null}>
          <SignupContent />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Priya' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'taken@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^Password/i, { selector: 'input' }), {
        target: { value: 'SecretPassword123' },
      });

      fireEvent.click(screen.getByTestId('signup-submit-btn'));

      await waitFor(() => {
        expect(screen.getByText('This email is already in use')).toBeInTheDocument();
        expect(document.activeElement).toBe(screen.getByLabelText(/Email Address/i));
      });
    });

    it('successful signup redirects to sanitized returnTo destination', async () => {
      const mockUser: User = {
        id: 'usr-new-1',
        name: 'New Customer',
        email: 'new@example.com',
      };

      vi.spyOn(authApi, 'signup').mockResolvedValue(mockUser);

      render(
        <AuthProvider initialUser={null}>
          <SignupContent />
        </AuthProvider>
      );

      fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'New Customer' } });
      fireEvent.change(screen.getByLabelText(/Email Address/i), {
        target: { value: 'new@example.com' },
      });
      fireEvent.change(screen.getByLabelText(/^Password/i, { selector: 'input' }), {
        target: { value: 'StrongPassword123' },
      });

      fireEvent.click(screen.getByTestId('signup-submit-btn'));

      await waitFor(() => {
        expect(authApi.signup).toHaveBeenCalledWith({
          name: 'New Customer',
          email: 'new@example.com',
          password: 'StrongPassword123',
          phone: undefined,
        });
        expect(mockPush).toHaveBeenCalledWith('/account');
      });
    });
  });
});
