'use client';

import GlobalError from '@/app/error';

export default function ShopError({
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
      title="Unable to load catalogue"
      description="We couldn't load the accessories collection. Please try again or return to the shop."
      secondaryHref="/shop"
      secondaryLabel="Back to Shop"
    />
  );
}
