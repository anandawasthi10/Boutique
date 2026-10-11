'use client';

import React, { forwardRef, useId } from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, id, checked, disabled, className = '', onChange, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;
    const errorId = `${checkboxId}-error`;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className={`inline-flex items-start gap-3 cursor-pointer select-none ${
            disabled ? 'cursor-not-allowed opacity-60' : ''
          } ${className}`.trim()}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              checked={checked}
              disabled={disabled}
              onChange={onChange}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className="peer sr-only"
              {...props}
            />
            <div
              className={`w-5 h-5 rounded-[4px] border flex items-center justify-center transition-colors duration-150 bg-[var(--color-bg)] ${
                checked
                  ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-[var(--color-primary-text)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
              } ${error ? 'border-[var(--color-error)]' : ''} peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-focus)] peer-focus-visible:ring-offset-2`}
              aria-hidden="true"
            >
              {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </div>
          </div>
          <span className="text-body-small text-[var(--color-text)]">{label}</span>
        </label>
        {error && (
          <p id={errorId} role="alert" className="text-[13px] text-[var(--color-error)] ml-8">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
