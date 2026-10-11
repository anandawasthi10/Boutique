'use client';

import React, { forwardRef, useId } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  hideLabelVisually?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      hideLabelVisually = false,
      id,
      className = '',
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const describedBy = [
      error ? errorId : null,
      helperText && !error ? helperId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="w-full flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className={`text-body-small font-medium text-[var(--color-text)] select-none ${
            hideLabelVisually ? 'sr-only' : 'block'
          }`}
        >
          {label}
          {required && (
            <span className="text-[var(--color-error)] ml-1" aria-hidden="true">
              *
            </span>
          )}
        </label>
        <div className="relative w-full">
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={`w-full min-h-[48px] px-3.5 py-2.5 bg-[var(--color-bg)] text-[var(--color-text)] text-[16px] rounded-[4px] border transition-colors duration-150 placeholder:text-[var(--color-text-muted)] placeholder:opacity-60 disabled:bg-[var(--color-surface)] disabled:cursor-not-allowed ${
              error
                ? 'border-[var(--color-error)] pr-10'
                : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
            } ${className}`.trim()}
            {...props}
          />
          {error && (
            <div
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-error)]"
              aria-hidden="true"
            >
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {error && (
          <p
            id={errorId}
            role="alert"
            className="text-[13px] text-[var(--color-error)] flex items-center gap-1 mt-0.5"
          >
            <span>{error}</span>
          </p>
        )}
        {!error && helperText && (
          <p id={helperId} className="text-[13px] text-[var(--color-text-muted)] mt-0.5">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
