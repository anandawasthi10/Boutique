'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authApi } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const ResetPasswordContent: React.FC = () => {
  const searchParams = useSearchParams();
  const token = searchParams?.get('token') ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(!token);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const errors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      errors.newPassword = 'New password is required.';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);

    if (errors.newPassword) {
      newPasswordRef.current?.focus();
      return false;
    }
    if (errors.confirmPassword) {
      confirmPasswordRef.current?.focus();
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);
    setFieldErrors({});

    if (!token) {
      setTokenInvalid(true);
      return;
    }

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.resetPassword({
        token,
        newPassword,
      });
      setIsSuccess(true);
    } catch (err) {
      const apiErr = err as { code?: string; fieldErrors?: Record<string, string>; message?: string };
      if (
        apiErr?.code === 'TOKEN_INVALID_OR_EXPIRED' ||
        apiErr?.message?.toLowerCase().includes('expired') ||
        apiErr?.message?.toLowerCase().includes('invalid')
      ) {
        setTokenInvalid(true);
      } else if (apiErr?.fieldErrors) {
        setFieldErrors(apiErr.fieldErrors);
        if (apiErr.fieldErrors.newPassword) {
          newPasswordRef.current?.focus();
        }
      } else {
        const msg = err instanceof Error ? err.message : 'Could not reset password. Please try again.';
        setFormError(msg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg)] min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-8 shadow-xs">
          {/* State 1: Invalid or Expired Token */}
          {tokenInvalid ? (
            <div className="text-center" data-testid="reset-password-invalid-token">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-error/10 flex items-center justify-center text-[var(--color-error)]">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h1 className="text-h2 font-serif text-[var(--color-text)] mb-3">
                Link Invalid or Expired
              </h1>
              <p className="text-body-small text-[var(--color-text-muted)] mb-6 leading-relaxed">
                This password reset link is invalid or has expired. Please request a new password reset link.
              </p>
              <div className="flex flex-col gap-3">
                <Link
                  href="/forgot-password"
                  className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-[4px] bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-medium uppercase tracking-wide hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  Request a New Link
                </Link>
                <Link
                  href="/login"
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] mt-2"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : isSuccess ? (
            /* State 2: Successful Password Reset */
            <div className="text-center" data-testid="reset-password-success">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center text-[var(--color-success)]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h1 className="text-h2 font-serif text-[var(--color-text)] mb-3">
                Password Reset Complete
              </h1>
              <p className="text-body-small text-[var(--color-text-muted)] mb-6 leading-relaxed">
                Your password has been reset successfully. You can now sign in with your new password.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center min-h-[48px] w-full px-6 rounded-[4px] bg-[var(--color-primary)] text-[var(--color-on-primary)] text-sm font-medium uppercase tracking-wide hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                <span>Sign In</span>
              </Link>
            </div>
          ) : (
            /* State 3: Reset Password Form */
            <>
              <div className="text-center mb-8">
                <h1 className="text-h2 font-serif text-[var(--color-text)] mb-2">
                  Reset Password
                </h1>
                <p className="text-body-small text-[var(--color-text-muted)] leading-relaxed">
                  Enter your new password below. It must be at least 8 characters long.
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  data-testid="reset-password-general-error"
                  className="mb-6 p-4 rounded-[4px] bg-error/10 border border-error/20 flex items-start gap-2.5 text-xs text-[var(--color-error)]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
                {/* New Password */}
                <Input
                  ref={newPasswordRef}
                  id="reset-new-password"
                  name="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  label="New Password"
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.newPassword) {
                      setFieldErrors((prev) => ({ ...prev, newPassword: undefined }));
                    }
                  }}
                  error={fieldErrors.newPassword}
                  helperText="Password must be at least 8 characters long."
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

                {/* Confirm Password */}
                <Input
                  ref={confirmPasswordRef}
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  label="Confirm New Password"
                  autoComplete="new-password"
                  required
                  disabled={isSubmitting}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  error={fieldErrors.confirmPassword}
                  placeholder="••••••••"
                  endAdornment={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      aria-pressed={showConfirmPassword}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-1 rounded transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  className="w-full justify-center mt-3 font-medium tracking-wide uppercase text-sm"
                  data-testid="reset-password-submit-btn"
                >
                  <span>Set New Password</span>
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
                <Link
                  href="/login"
                  className="text-[var(--color-primary)] hover:underline font-semibold"
                >
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
