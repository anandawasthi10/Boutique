'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { sanitizeReturnUrl } from '@/lib/utils/url';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const SignupContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get('returnTo') ?? null;
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    phone?: string;
  }>({});

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const validate = (): boolean => {
    const errors: {
      name?: string;
      email?: string;
      password?: string;
      phone?: string;
    } = {};

    const trimmedName = name.trim();
    if (!trimmedName) {
      errors.name = 'Full name is required.';
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    const trimmedPhone = phone.trim();
    if (trimmedPhone && !/^[6-9]\d{9}$/.test(trimmedPhone)) {
      errors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    setFieldErrors(errors);

    if (errors.name) {
      nameInputRef.current?.focus();
      return false;
    }
    if (errors.email) {
      emailInputRef.current?.focus();
      return false;
    }
    if (errors.password) {
      passwordInputRef.current?.focus();
      return false;
    }
    if (errors.phone) {
      phoneInputRef.current?.focus();
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
      await signup({
        name: name.trim(),
        email: email.trim(),
        password,
        phone: phone.trim() || undefined,
      });

      // Navigate to safe sanitized return destination
      const destination = sanitizeReturnUrl(returnTo, '/account');
      router.push(destination);
    } catch (err) {
      const apiErr = err as { fieldErrors?: Record<string, string>; message?: string };
      setIsSubmitting(false);
      if (apiErr?.fieldErrors) {
        setFieldErrors(apiErr.fieldErrors);
        const fe = apiErr.fieldErrors;
        setTimeout(() => {
          if (fe.name) {
            nameInputRef.current?.focus();
          } else if (fe.email) {
            emailInputRef.current?.focus();
          } else if (fe.password) {
            passwordInputRef.current?.focus();
          } else if (fe.phone) {
            phoneInputRef.current?.focus();
          }
        }, 0);
      } else {
        const msg = err instanceof Error ? err.message : 'Could not complete registration.';
        setFormError(msg);
      }
      return;
    }
    setIsSubmitting(false);
  };

  const loginLink = returnTo
    ? `/login?returnTo=${encodeURIComponent(returnTo)}`
    : '/login';

  return (
    <div className="bg-[var(--color-bg)] min-h-[calc(100vh-200px)] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] p-8 shadow-xs">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-h2 font-serif text-[var(--color-text)] mb-2">
              Create an Account
            </h1>
            <p className="text-body-small text-[var(--color-text-muted)]">
              Join our community of handcrafted bespoke accessory enthusiasts.
            </p>
          </div>

          {/* Form-Level General Error */}
          {formError && (
            <div
              role="alert"
              data-testid="signup-general-error"
              className="mb-6 p-4 rounded-[4px] bg-error/10 border border-error/20 flex items-start gap-2.5 text-xs text-[var(--color-error)]"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Full Name Field */}
            <Input
              ref={nameInputRef}
              id="signup-name"
              name="name"
              type="text"
              label="Full Name"
              autoComplete="name"
              required
              disabled={isSubmitting}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={fieldErrors.name}
              placeholder="Priya Sharma"
            />

            {/* Email Field */}
            <Input
              ref={emailInputRef}
              id="signup-email"
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
            <Input
              ref={passwordInputRef}
              id="signup-password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }}
              error={fieldErrors.password}
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

            {/* Phone Number Field (Optional) */}
            <Input
              ref={phoneInputRef}
              id="signup-phone"
              name="phone"
              type="tel"
              label="Phone Number (Optional)"
              autoComplete="tel"
              disabled={isSubmitting}
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              error={fieldErrors.phone}
              helperText="10-digit mobile number for order delivery updates."
              placeholder="9876543210"
            />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              className="w-full justify-center mt-3 font-medium tracking-wide uppercase text-sm"
              data-testid="signup-submit-btn"
            >
              <span>Create Account</span>
            </Button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-[var(--color-border)] text-center text-xs text-[var(--color-text-muted)]">
            <span>Already have an account? </span>
            <Link
              href={loginLink}
              className="text-[var(--color-primary)] hover:underline font-semibold"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
