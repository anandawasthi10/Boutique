'use client';

import React, { forwardRef, useId } from 'react';
import { AlertCircle, ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  hideLabelVisually?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
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
    const selectId = id || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const describedBy = [
      error ? errorId : null,
      helperText && !error ? helperId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="w-full flex flex-col gap-1.5">
        <label
          htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            className={`w-full min-h-[48px] px-3.5 py-2.5 pr-10 bg-[var(--color-bg)] text-[var(--color-text)] text-[16px] rounded-[4px] border appearance-none transition-colors duration-150 cursor-pointer disabled:bg-[var(--color-surface)] disabled:cursor-not-allowed ${
              error
                ? 'border-[var(--color-error)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
            } ${className}`.trim()}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <div
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)] flex items-center gap-1"
            aria-hidden="true"
          >
            {error && <AlertCircle className="w-5 h-5 text-[var(--color-error)]" />}
            <ChevronDown className="w-4 h-4" />
          </div>
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

Select.displayName = 'Select';
