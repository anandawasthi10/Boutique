'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Mail, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { authApi } from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const ForgotPasswordContent: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const trimmed = email.trim();
    if (!trimmed) {
      setFieldError('Email address is required.');
      emailInputRef.current?.focus();
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setFieldError('Please enter a valid email address.');
      emailInputRef.current?.focus();
      return false;
    }
    setFieldError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.forgotPassword({ email: email.trim() });
      setIsSubmitted(true);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to process your request at this time. Please try again.';
      setFormError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg)] min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-8 shadow-xs">
          {isSubmitted ? (
            /* Neutral Confirmation State */
            <div className="text-center" data-testid="forgot-password-confirmation">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)]">
                <Mail className="w-6 h-6" />
              </div>
              <h1 className="text-h2 font-serif text-[var(--color-text)] mb-3">
                Check Your Email
              </h1>
              <p className="text-body-small text-[var(--color-text-muted)] mb-6 leading-relaxed">
                If an account exists with this email address, we have sent instructions to reset your password.
                Please check your inbox and spam folder.
              </p>
              <div className="pt-4 border-t border-[var(--color-border)] flex flex-col gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center font-medium text-xs text-[var(--color-primary)] hover:underline uppercase tracking-wider"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Return to Sign In
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                  }}
                  className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] cursor-pointer"
                >
                  Try a different email address
                </button>
              </div>
            </div>
          ) : (
            /* Forgot Password Request Form */
            <>
              <div className="text-center mb-8">
                <h1 className="text-h2 font-serif text-[var(--color-text)] mb-2">
                  Forgot Password
                </h1>
                <p className="text-body-small text-[var(--color-text-muted)] leading-relaxed">
                  Enter the email address associated with your account, and we will send you a reset link.
                </p>
              </div>

              {formError && (
                <div
                  role="alert"
                  data-testid="forgot-password-error"
                  className="mb-6 p-4 rounded-[4px] bg-error/10 border border-error/20 flex items-start gap-2.5 text-xs text-[var(--color-error)]"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                <Input
                  ref={emailInputRef}
                  id="forgot-email"
                  name="email"
                  type="email"
                  label="Email Address"
                  autoComplete="email"
                  required
                  disabled={isSubmitting}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldError) setFieldError(null);
                  }}
                  error={fieldError || undefined}
                  placeholder="you@example.com"
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  className="w-full justify-center mt-2 font-medium tracking-wide uppercase text-sm"
                  data-testid="forgot-password-submit-btn"
                >
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
                <Link
                  href="/login"
                  className="inline-flex items-center text-[var(--color-primary)] hover:underline font-semibold"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
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
