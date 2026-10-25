'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { sanitizeReturnUrl } from '@/lib/utils/url';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const LoginContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo') ?? null;
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    }

    setFieldErrors(errors);

    if (errors.email) {
      emailInputRef.current?.focus();
      return false;
    }
    if (errors.password) {
      passwordInputRef.current?.focus();
      return false;
    }

    return true;
  };

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
        email: email.trim(),
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
          emailInputRef.current?.focus();
        } else if (apiErr.fieldErrors.password) {
          passwordInputRef.current?.focus();
        }
      }

      // Security requirement: failed login shows a general message that does not say which part was wrong
      setFormError('The email or password you entered is incorrect. Please try again.');
      if (!apiErr?.fieldErrors?.email && !apiErr?.fieldErrors?.password) {
        emailInputRef.current?.focus();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const signupLink = returnTo
    ? `/signup?returnTo=${encodeURIComponent(returnTo)}`
    : '/signup';

  return (
    <div className="bg-[var(--color-bg)] min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-8 shadow-xs">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-h2 font-serif text-[var(--color-text)] mb-2">
              Welcome Back
            </h1>
            <p className="text-body-small text-[var(--color-text-muted)]">
              Sign in to manage your orders and bespoke accessories.
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

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Email Field */}
            <Input
              ref={emailInputRef}
              id="login-email"
              name="email"
              type="email"
              label="Email Address"
              autoComplete="email"
              required
              disabled={isSubmitting}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={fieldErrors.email}
              placeholder="you@example.com"
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
                disabled={isSubmitting}
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
                    className="w-11 h-11 flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text)] p-2 rounded transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                }
              />
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="min-h-[44px] inline-flex items-center text-xs text-[var(--color-primary)] hover:underline font-medium"
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
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="w-full min-h-[44px] justify-center mt-2 font-medium tracking-wide uppercase text-sm"
              data-testid="login-submit-btn"
            >
              <span>Sign In</span>
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)] flex items-center justify-center gap-1 flex-wrap">
            <span>Don&apos;t have an account yet? </span>
            <Link
              href={signupLink}
              className="min-h-[44px] inline-flex items-center text-[var(--color-primary)] hover:underline font-semibold px-1"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
