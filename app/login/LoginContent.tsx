'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  AlertCircle,
  Smartphone,
  KeyRound,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { sanitizeReturnUrl } from '@/lib/utils/url';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { GoogleIcon } from '@/components/icons/GoogleIcon';
import {
  signInWithGoogle,
  verifyGoogleAuthenticator,
} from '@/lib/neon-auth';

export const LoginContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo') ?? null;
  const { login, setAuthenticatedUser } = useAuth();

  // Mode: standard email/mobile login OR google authenticator TOTP
  const [authMode, setAuthMode] = useState<'standard' | 'totp'>('standard');

  // Form State
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Google OAuth Loading State
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleSuccessNotice, setGoogleSuccessNotice] = useState<string | null>(null);

  // Google Authenticator (TOTP) State
  const [totpCode, setTotpCode] = useState('');
  const [totpIdentifier, setTotpIdentifier] = useState('');
  const [isTotpSubmitting, setIsTotpSubmitting] = useState(false);
  const [totpError, setTotpError] = useState<string | null>(null);
  const [totpSuccess, setTotpSuccess] = useState(false);
  const [totpSecondsLeft, setTotpSecondsLeft] = useState(30);

  const identifierInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const totpInputRef = useRef<HTMLInputElement>(null);

  // TOTP 30-second cycle countdown
  useEffect(() => {
    if (authMode !== 'totp') return;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);
      setTotpSecondsLeft(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [authMode]);

  // Validate Email or Phone Number
  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    const trimmed = identifier.trim();
    if (!trimmed) {
      errors.email = 'Email address is required.';
    } else {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
      const isPhone = /^[6-9]\d{9}$/.test(trimmed) || /^\d{10}$/.test(trimmed);

      if (!isEmail && !isPhone) {
        errors.email = 'Please enter a valid email address.';
      }
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);

    if (errors.email) {
      identifierInputRef.current?.focus();
      return false;
    }
    if (errors.password) {
      passwordInputRef.current?.focus();
      return false;
    }

    return true;
  };

  // Standard Email / Mobile & Password Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);
    setFieldErrors({});

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({
        email: identifier.trim(),
        password,
      });

      // Navigate to safe sanitized return destination
      const destination = sanitizeReturnUrl(returnTo, '/account');
      router.push(destination);
    } catch (err) {
      const apiErr = err as { fieldErrors?: Record<string, string>; message?: string };
      if (apiErr?.fieldErrors) {
        setFieldErrors(apiErr.fieldErrors);
        if (apiErr.fieldErrors.email) {
          identifierInputRef.current?.focus();
        } else if (apiErr.fieldErrors.password) {
          passwordInputRef.current?.focus();
        }
      }

      // Security requirement: failed login shows a general message that does not say which part was wrong
      setFormError('The email or password you entered is incorrect. Please try again.');
      if (!apiErr?.fieldErrors?.email && !apiErr?.fieldErrors?.password) {
        identifierInputRef.current?.focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign In with Google
  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    setFormError(null);

    try {
      const result = await signInWithGoogle({
        returnTo: returnTo || '/account',
      });

      if (result.success) {
        if (result.user && setAuthenticatedUser) {
          setAuthenticatedUser(result.user);
          setGoogleSuccessNotice(`Welcome back, ${result.user.name}! Redirecting...`);
          setTimeout(() => {
            const destination = sanitizeReturnUrl(returnTo, '/account');
            router.push(destination);
          }, 600);
        } else if (result.redirectUrl) {
          window.location.href = result.redirectUrl;
        } else {
          const destination = sanitizeReturnUrl(returnTo, '/account');
          router.push(destination);
        }
      } else {
        setFormError(result.error || 'Google authentication could not be completed. Please try again.');
      }
    } catch (err) {
      console.error('Google sign in error:', err);
      setFormError('Failed to initialize Google authentication.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Google Authenticator (TOTP) Submission
  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isTotpSubmitting) return;

    setTotpError(null);
    const cleanCode = totpCode.replace(/\s+/g, '');

    if (cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
      setTotpError('Please enter a valid 6-digit verification code from Google Authenticator.');
      totpInputRef.current?.focus();
      return;
    }

    setIsTotpSubmitting(true);

    try {
      const response = await verifyGoogleAuthenticator(
        cleanCode,
        totpIdentifier.trim() || identifier.trim()
      );

      if (response.success && response.user) {
        setTotpSuccess(true);
        if (setAuthenticatedUser) {
          setAuthenticatedUser(response.user);
        }
        setTimeout(() => {
          const destination = sanitizeReturnUrl(returnTo, '/account');
          router.push(destination);
        }, 700);
      } else {
        setTotpError(response.error || 'Invalid 6-digit code. Please verify your Google Authenticator app and try again.');
        totpInputRef.current?.focus();
      }
    } catch (err) {
      setTotpError(err instanceof Error ? err.message : 'TOTP verification failed.');
    } finally {
      setIsTotpSubmitting(false);
    }
  };

  const signupLink = returnTo
    ? `/signup?returnTo=${encodeURIComponent(returnTo)}`
    : '/signup';

  return (
    <div className="bg-[var(--color-bg)] min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-8 shadow-soft">
          
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-h2 font-serif text-[var(--color-text)] mb-2">
              Welcome Back
            </h1>
            <p className="text-body-small text-[var(--color-text-muted)]">
              Sign in with Google, email, or mobile number.
            </p>
          </div>

          {/* Form-Level General Error */}
          {formError && (
            <div
              role="alert"
              data-testid="login-general-error"
              className="mb-6 p-4 rounded-[4px] bg-error/10 border border-error/20 flex items-start gap-2.5 text-xs text-[var(--color-error)]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Google Auth Success Banner */}
          {googleSuccessNotice && (
            <div
              role="status"
              className="mb-6 p-4 rounded-[4px] bg-success/10 border border-success/20 flex items-start gap-2.5 text-xs text-[var(--color-success)]"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{googleSuccessNotice}</span>
            </div>
          )}

          {/* Sleek Mode Switcher */}
          <div className="flex p-1 mb-6 rounded-[4px] bg-[var(--color-surface-alt)] border border-[var(--color-border)]">
            <button
              type="button"
              onClick={() => {
                setAuthMode('standard');
                setFormError(null);
              }}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-[3px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'standard'
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs font-semibold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Email / Mobile</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('totp');
                setTotpError(null);
                setTimeout(() => totpInputRef.current?.focus(), 50);
              }}
              className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-[3px] transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'totp'
                  ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs font-semibold'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Google Authenticator</span>
            </button>
          </div>

          {/* Standard Sign In Mode */}
          {authMode === 'standard' && (
            <div className="flex flex-col gap-5">
              {/* Clean Google Authentication Button with Google Logo */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading || isSubmitting}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-[4px] border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-alt)] active:bg-[var(--color-border)] text-sm font-medium text-[var(--color-text)] transition-all duration-150 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group focus-visible:outline-2 focus-visible:outline-[var(--color-focus)]"
                aria-label="Continue with Google"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[var(--color-primary)]" />
                ) : (
                  <GoogleIcon className="w-5 h-5 transition-transform group-hover:scale-105" />
                )}
                <span>
                  {isGoogleLoading ? 'Connecting to Google...' : 'Continue with Google'}
                </span>
              </button>

              {/* Minimal Divider */}
              <div className="relative my-1 flex items-center justify-center">
                <div className="w-full border-t border-[var(--color-border)]" />
                <span className="absolute bg-[var(--color-surface)] px-3 text-[11px] uppercase tracking-wider font-medium text-[var(--color-text-muted)]">
                  or sign in with password
                </span>
              </div>

              {/* Email / Mobile & Password Form */}
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {/* Email or Mobile Number Field */}
                <Input
                  ref={identifierInputRef}
                  id="login-email"
                  name="email"
                  type="text"
                  label="Email Address or Mobile Number"
                  autoComplete="username"
                  required
                  disabled={isSubmitting || isGoogleLoading}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  error={fieldErrors.email}
                  placeholder="you@example.com or 9876543210"
                />

                {/* Password Field */}
                <div className="flex flex-col gap-1">
                  <Input
                    ref={passwordInputRef}
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    autoComplete="current-password"
                    required
                    disabled={isSubmitting || isGoogleLoading}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    error={fieldErrors.password}
                    placeholder="••••••••"
                    endAdornment={
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />
                  <div className="flex justify-between items-center mt-1">
                    <button
                      type="button"
                      onClick={() => setAuthMode('totp')}
                      className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] font-medium inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Smartphone className="w-3 h-3 text-[#00E599]" />
                      <span>Use 2FA code</span>
                    </button>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-[var(--color-primary)] hover:underline font-medium"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting || isGoogleLoading}
                  isLoading={isSubmitting}
                  className="w-full justify-center mt-2 font-medium tracking-wide uppercase text-sm"
                  data-testid="login-submit-btn"
                >
                  <span>Sign In</span>
                </Button>
              </form>
            </div>
          )}

          {/* Google Authenticator Mode */}
          {authMode === 'totp' && (
            <div className="flex flex-col gap-5">
              <div className="text-center">
                <div className="inline-flex p-2.5 rounded-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] mb-2 text-[#00875A]">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h2 className="text-sm font-semibold text-[var(--color-text)]">
                  Google Authenticator
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                  Enter the 6-digit code from your Google Authenticator app.
                </p>
              </div>

              {/* TOTP Error Notice */}
              {totpError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-[4px] bg-error/10 border border-error/20 flex items-start gap-2.5 text-xs text-[var(--color-error)]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{totpError}</span>
                </div>
              )}

              {/* TOTP Success Notice */}
              {totpSuccess && (
                <div
                  role="status"
                  className="p-3.5 rounded-[4px] bg-success/10 border border-success/20 flex items-start gap-2.5 text-xs text-[var(--color-success)]"
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Code verified! Signing you in...</span>
                </div>
              )}

              {/* Authenticator Form */}
              <form onSubmit={handleTotpSubmit} className="flex flex-col gap-4">
                {/* Account Identifier (optional) */}
                <Input
                  id="totp-email"
                  name="totpEmail"
                  type="text"
                  label="Email or Mobile (optional)"
                  placeholder="you@example.com or 9876543210"
                  disabled={isTotpSubmitting || totpSuccess}
                  value={totpIdentifier || identifier}
                  onChange={(e) => setTotpIdentifier(e.target.value)}
                />

                {/* 6-Digit TOTP Input */}
                <div className="flex flex-col gap-1.5">
                  <label
                    htmlFor="totp-code"
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] flex items-center justify-between"
                  >
                    <span>6-Digit Verification Code</span>
                    <span className="text-[11px] font-mono lowercase font-normal text-[var(--color-text-muted)]">
                      resets in <strong className="text-[var(--color-text)]">{totpSecondsLeft}s</strong>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      ref={totpInputRef}
                      id="totp-code"
                      name="totpCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={7}
                      required
                      autoComplete="one-time-code"
                      disabled={isTotpSubmitting || totpSuccess}
                      value={totpCode}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/\D/g, '');
                        if (raw.length <= 6) {
                          if (raw.length > 3) {
                            setTotpCode(`${raw.slice(0, 3)} ${raw.slice(3)}`);
                          } else {
                            setTotpCode(raw);
                          }
                          if (totpError) setTotpError(null);
                        }
                      }}
                      placeholder="123 456"
                      className="w-full text-center tracking-[0.3em] font-mono text-xl py-3 px-4 rounded-[4px] border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                    />
                  </div>
                  <div className="w-full bg-[var(--color-border)]/60 h-1 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-[#00E599] transition-all duration-1000 ease-linear"
                      style={{ width: `${(totpSecondsLeft / 30) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Submit TOTP Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isTotpSubmitting || totpSuccess || !totpCode.trim()}
                  isLoading={isTotpSubmitting}
                  className="w-full justify-center mt-2 font-medium tracking-wide uppercase text-sm"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  <span>Verify with Google Authenticator</span>
                </Button>

                {/* Back link */}
                <button
                  type="button"
                  onClick={() => setAuthMode('standard')}
                  className="text-center text-xs text-[var(--color-text-muted)] hover:text-[var(--color-primary)] font-medium mt-1 cursor-pointer transition-colors"
                >
                  ← Back to standard login
                </button>
              </form>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
            <span>Don&apos;t have an account yet? </span>
            <Link
              href={signupLink}
              className="text-[var(--color-primary)] hover:underline font-semibold"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
