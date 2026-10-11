'use client';

import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'blush' | 'sage' | 'muted';
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'blush',
  children,
  className = '',
  ...props
}) => {
  const variantStyles = {
    blush: 'bg-[var(--color-blush)] text-[var(--color-text)]',
    sage: 'bg-[var(--color-sage)] text-[var(--color-text)]',
    muted: 'bg-[var(--color-surface)] text-[var(--color-text-muted)] border border-[var(--color-border)]',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[13px] font-medium tracking-wide uppercase select-none ${variantStyles[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
};
