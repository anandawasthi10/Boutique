'use client';

import React from 'react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
  children,
}) => {
  return (
    <div
      role="region"
      aria-label={title}
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] max-w-lg mx-auto my-6 ${className}`.trim()}
    >
      {icon && (
        <div className="text-[var(--color-text-muted)] mb-4 inline-flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="text-h3 text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-body text-[var(--color-text-muted)] max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {children}
    </div>
  );
};
