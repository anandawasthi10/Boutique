import React from 'react';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginContent } from '@/app/login/LoginContent';
import { SignupContent } from '@/app/signup/SignupContent';
import { AuthProvider } from '@/lib/hooks/useAuth';
import * as neonAuthModule from '@/lib/neon-auth';
import { authApi } from '@/lib/api';

const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('Clean Login & Signup with Google and Google Authenticator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the Continue with Google button with Google logo', () => {
    render(
      <AuthProvider initialUser={null}>
        <LoginContent />
      </AuthProvider>
    );

    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    expect(googleBtn).toBeInTheDocument();
    expect(googleBtn).toBeEnabled();
  });

  it('renders Email or Mobile Number input field and password field', () => {
    render(
      <AuthProvider initialUser={null}>
        <LoginContent />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/Email Address or Mobile Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i, { selector: 'input' })).toBeInTheDocument();
  });

  it('allows logging in with a 10-digit mobile number and password', async () => {
    const loginSpy = vi.spyOn(authApi, 'login').mockResolvedValue({
      id: 'usr-phone-1',
      name: 'Customer 3210',
      email: '9876543210@boutique.store',
      phone: '9876543210',
    });

    render(
      <AuthProvider initialUser={null}>
        <LoginContent />
      </AuthProvider>
    );

    fireEvent.change(screen.getByLabelText(/Email Address or Mobile Number/i), {
      target: { value: '9876543210' },
    });
    fireEvent.change(screen.getByLabelText(/^Password/i, { selector: 'input' }), {
      target: { value: 'validPassword123' },
    });

    fireEvent.click(screen.getByTestId('login-submit-btn'));

    await waitFor(() => {
      expect(loginSpy).toHaveBeenCalledWith({
        email: '9876543210',
        password: 'validPassword123',
      });
      expect(mockPush).toHaveBeenCalledWith('/account');
    });
  });

  it('executes Google Sign In when clicking Continue with Google', async () => {
    const signInWithGoogleSpy = vi.spyOn(neonAuthModule, 'signInWithGoogle').mockResolvedValue({
      success: true,
      user: {
        id: 'usr-google-123',
        name: 'Alex Google',
        email: 'alex@example.com',
      },
      redirectUrl: '/account',
    });

    render(
      <AuthProvider initialUser={null}>
        <LoginContent />
      </AuthProvider>
    );

    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(googleBtn);

    expect(signInWithGoogleSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, Alex Google! Redirecting.../i)).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/account');
    }, { timeout: 1500 });
  });

  it('displays an error alert if Google Sign In fails', async () => {
    vi.spyOn(neonAuthModule, 'signInWithGoogle').mockResolvedValue({
      success: false,
      error: 'Google account access denied by user.',
    });

    render(
      <AuthProvider initialUser={null}>
        <LoginContent />
      </AuthProvider>
    );

    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(screen.getByTestId('login-general-error')).toHaveTextContent(
        /Google account access denied by user/i
      );
    });
  });

  it('switches to Google Authenticator (TOTP) mode and displays the verification form', () => {
    render(
      <AuthProvider initialUser={null}>
        <LoginContent />
      </AuthProvider>
    );

    const totpTabBtn = screen.getByRole('button', { name: /google authenticator/i });
    fireEvent.click(totpTabBtn);

    expect(screen.getByText(/Enter the 6-digit code from your Google Authenticator app/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/6-Digit Verification Code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify with google authenticator/i })).toBeInTheDocument();
  });

  it('validates 6-digit requirement for Google Authenticator code', async () => {
    render(
      <AuthProvider initialUser={null}>
        <LoginContent />
      </AuthProvider>
    );

    // Switch to Google Authenticator
    fireEvent.click(screen.getByRole('button', { name: /google authenticator/i }));

    const codeInput = screen.getByLabelText(/6-Digit Verification Code/i);
    fireEvent.change(codeInput, { target: { value: '123' } });

    const form = codeInput.closest('form')!;
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Please enter a valid 6-digit verification code from Google Authenticator/i
      );
    });
  });

  it('verifies 6-digit Google Authenticator code and redirects to account', async () => {
    const verifyTotpSpy = vi.spyOn(neonAuthModule, 'verifyGoogleAuthenticator').mockResolvedValue({
      success: true,
      user: {
        id: 'usr-totp-99',
        name: 'Verified Customer',
        email: 'customer@boutique.store',
      },
    });

    render(
      <AuthProvider initialUser={null}>
        <LoginContent />
      </AuthProvider>
    );

    // Switch to Google Authenticator
    fireEvent.click(screen.getByRole('button', { name: /google authenticator/i }));

    const codeInput = screen.getByLabelText(/6-Digit Verification Code/i);
    fireEvent.change(codeInput, { target: { value: '654321' } });

    const form = codeInput.closest('form')!;
    fireEvent.submit(form);

    expect(verifyTotpSpy).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(
        /Code verified! Signing you in.../i
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/account');
    }, { timeout: 1500 });
  });

  it('renders Sign up with Google button on the Signup page', () => {
    render(
      <AuthProvider initialUser={null}>
        <SignupContent />
      </AuthProvider>
    );

    const googleBtn = screen.getByRole('button', { name: /sign up with google/i });
    expect(googleBtn).toBeInTheDocument();
  });
});
