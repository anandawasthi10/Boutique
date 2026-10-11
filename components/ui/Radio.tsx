'use client';

import React, { useId } from 'react';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  detail?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  name,
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
  className = '',
}) => {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  return (
    <div
      role="radiogroup"
      aria-labelledby={label ? `${groupId}-label` : undefined}
      className={`flex flex-col gap-2 ${className}`.trim()}
    >
      {label && (
        <span id={`${groupId}-label`} className="text-body-small font-medium text-[var(--color-text)]">
          {label}
        </span>
      )}
      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          const isDisabled = disabled || opt.disabled;
          const optId = `${groupId}-${opt.value}`;

          return (
            <label
              key={opt.value}
              htmlFor={optId}
              className={`inline-flex items-start gap-3 cursor-pointer select-none p-2 rounded-[4px] border transition-colors ${
                isSelected
                  ? 'border-[var(--color-primary)] bg-[var(--color-surface)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)] bg-[var(--color-bg)]'
              } ${isDisabled ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="radio"
                  id={optId}
                  name={name}
                  value={opt.value}
                  checked={isSelected}
                  disabled={isDisabled}
                  onChange={() => onChange?.(opt.value)}
                  className="peer sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
                      : 'border-[var(--color-border)] bg-[var(--color-bg)]'
                  } peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--color-focus)] peer-focus-visible:ring-offset-2`}
                  aria-hidden="true"
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary-text)]" />}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-body-small text-[var(--color-text)] font-medium">{opt.label}</span>
                {opt.detail && (
                  <span className="text-[13px] text-[var(--color-text-muted)]">{opt.detail}</span>
                )}
              </div>
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-[13px] text-[var(--color-error)] mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};
