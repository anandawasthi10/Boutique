import NextLink from 'next/link';
import { Button } from '@/components/ui/Button';
import { Compass, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16 sm:py-24">
      <div className="max-w-md w-full text-center space-y-6 p-8 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[4px] shadow-[var(--shadow-soft)]">
        <div className="w-14 h-14 mx-auto rounded-full bg-[var(--color-surface-alt)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-muted)]">
          <Compass className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <span className="text-label text-[var(--color-text-muted)]">404 — Not Found</span>
          <h1 className="text-h1 text-[var(--color-text)]">Page Not Found</h1>
          <p className="text-body text-[var(--color-text-muted)]">
            We couldn&apos;t find the page or accessory you were looking for. It may have been moved, or the link may be outdated.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <NextLink href="/shop" className="w-full sm:w-auto">
            <Button variant="primary" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Shop All
            </Button>
          </NextLink>
          <NextLink href="/" className="w-full sm:w-auto">
            <Button variant="secondary" className="w-full sm:w-auto">
              Return Home
            </Button>
          </NextLink>
        </div>
      </div>
    </div>
  );
}
