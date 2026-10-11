'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We could not complete your request. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center text-center p-8 md:p-12 bg-[var(--color-surface)] border border-[var(--color-error)] rounded-[4px] max-w-lg mx-auto my-6 ${className}`.trim()}
    >
      <div className="text-[var(--color-error)] mb-3 inline-flex items-center justify-center">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-h3 text-[var(--color-text)] mb-2">{title}</h3>
      <p className="text-body text-[var(--color-text-muted)] max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button variant="primary" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
