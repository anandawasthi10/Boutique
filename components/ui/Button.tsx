'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'text' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  'aria-label'?: string;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      className = '',
      type = 'button',
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-[4px] cursor-pointer select-none text-button disabled:cursor-not-allowed';

    const variantStyles = {
      primary:
        'bg-[var(--color-primary)] text-[var(--color-on-primary)] min-h-[48px] px-6 hover:bg-[var(--color-primary-hover)] active:bg-[var(--color-primary)] disabled:bg-[var(--color-border)] disabled:text-[var(--color-text-muted)]',
      secondary:
        'bg-transparent border border-[var(--color-primary)] text-[var(--color-primary)] min-h-[48px] px-6 hover:bg-[var(--color-surface)] active:bg-[var(--color-surface-alt)] disabled:border-[var(--color-border)] disabled:text-[var(--color-text-muted)]',
      text:
        'bg-transparent text-[var(--color-primary)] underline underline-offset-4 hover:underline-[2px] p-0 min-h-0 disabled:text-[var(--color-text-muted)] disabled:no-underline',
      icon:
        'bg-transparent text-[var(--color-primary)] min-w-[44px] min-h-[44px] p-2 hover:bg-[var(--color-surface)] active:bg-[var(--color-surface-alt)] rounded-full disabled:text-[var(--color-text-muted)]',
    };

    const sizeStyles = variant === 'text' || variant === 'icon' ? '' : {
      sm: 'min-h-[44px] px-4 text-[14px]',
      md: 'min-h-[48px] px-6 text-[15px]',
      lg: 'min-h-[52px] px-8 text-[16px]',
    }[size];

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        aria-label={ariaLabel}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles} ${className}`.trim()}
        {...props}
      >
        {isLoading && (
          <Loader2
            className="w-4 h-4 mr-2 animate-spin text-current"
            aria-hidden="true"
            data-testid="button-spinner"
          />
        )}
        {!isLoading && leftIcon && (
          <span className="mr-2 inline-flex items-center" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="ml-2 inline-flex items-center" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
