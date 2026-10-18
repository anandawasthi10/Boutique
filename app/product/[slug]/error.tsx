'use client';

import GlobalError from '@/app/error';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <GlobalError
      error={error}
      reset={reset}
      title="Unable to load product"
      description="We couldn't load this accessory's details. Please try again or explore our shop."
      secondaryHref="/shop"
      secondaryLabel="Back to Shop"
    />
  );
}
