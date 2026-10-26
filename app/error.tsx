'use client';

import { useEffect } from 'react';
import NextLink from 'next/link';
import { Button } from '@/components/ui/Button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}

export default function GlobalError({
  error,
  reset,
  title = 'Something went wrong',
  description = "We're sorry, an unexpected error occurred while loading this page. Please try again or return to the homepage.",
  secondaryHref = '/',
  secondaryLabel = 'Return Home',
}: GlobalErrorProps) {
  useEffect(() => {
    // Error monitoring hook (if added in the future, per Technical Architecture)
    // Never log personal data or payment credentials to console
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 sm:py-24">
      <div
        role="alert"
        aria-live="assertive"
        className="max-w-md w-full text-center space-y-6 p-8 bg-surface border border-border rounded-sm shadow-soft"
      >
        <div className="w-14 h-14 mx-auto rounded-full bg-surface-alt border border-border flex items-center justify-center text-error">
          <AlertCircle className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="text-label text-text-muted">Notice</span>
          <h1 className="text-h1 text-text">{title}</h1>
          <p className="text-body text-text-muted">
            {description}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            onClick={() => reset()}
            className="w-full sm:w-auto"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Try Again
          </Button>
          <NextLink href={secondaryHref} className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              {secondaryLabel}
            </Button>
          </NextLink>
        </div>
      </div>
    </div>
  );
}
